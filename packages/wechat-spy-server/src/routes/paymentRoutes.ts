import * as express from "express";
import { logger, paymentLog } from "../logger";
import * as Product from "../models/Product";
import * as Order from "../models/Order";
import { ORDER_STATUS } from "../constants";
// import * as WechatPayNodeJsSDK from "wechatpay-nodejs-sdk";
import { WechatPay } from "../wechatpay-nodejs-sdk";
import { Config } from "../config";
import * as fs from "fs";
const router = express.Router();

const wechatPay = new WechatPay({
  /** 服务器ID */
  appid: Config.WECHAT_APP_ID,
  /** 商户ID */
  mchid: Config.WECHAT_MCH_ID,
  /** V3密钥 */
  secretKey: Config.SECRET_KEY,
  /** 公钥 */
  publicKey: fs.readFileSync("./apiclient_cert.pem"),
  /** 私钥 */
  privateKey: fs.readFileSync("./apiclient_key.pem"),
});

/**
 * 创建订单
 * @param productId - 产品ID
 * @returns {Promise<{product: Product, newOrder: Order}>} - 返回包含产品和新订单的对象
 */
async function createOrder(productId) {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("产品未找到");
  }
  // 新订单
  const newOrder = new Order({
    product: productId,
    totaFee: product.price,
    /** 订单状态 */
    orderStatus: ORDER_STATUS.UN_PAID,
  });

  await newOrder.save();
  return { product, newOrder };
}

/**
 * 调用Native支付接口完成支付
 * @param order 订单对象
 * @param product 商品对象
 * @param req 请求对象
 * @returns Promise<string> 返回支付结果的code_url
 */
async function invokeNativePay(order, product, req) {
  const result = await wechatPay.transactions_native({
    /** 交易的描述 */
    description: `购买${product.name}`,
    /** 订单号id */
    out_trade_no: order.id,
    /** 【通知地址】 异步接收微信支付结果通知的回调地址，通知URL必须为外网可访问的URL，不能携带参数。 公网域名必须为HTTPS，如果是走专线接入，使用专线NAT IP或者私有回调域名可使用HTTP */
    notify_url: Config.WECHAT_NOTIFY_URL,
    /** 订单金额信息 */
    amount: {
      /** 总金额  */
      total: product.price,
      /** 货币类型 */
      currency: "CNY",
    },
    scene_info: {
      /** 用户终端ip */
      payer_client_ip: req.ip,
    },
  });

  logger.info(`transactions_native result: ${JSON.stringify(result)}`);

  const { code_url } = result;
  // 更新订单信息
  await Order.findByIdAndUpdate(order.id, { code_url });
  return code_url;
}
/** 经过app.use后，router被截取了/api/payment */
router.get(`/native/:productId`, async (req, res) => {
  try {
    //# 1.生产订单
    const { productId } = req.params;
    const { product, newOrder } = await createOrder(productId);

    //# 2.调用统一订单接口API
    const code_url = await invokeNativePay(newOrder, product, req);

    //# 3.把新生成的订单号和支付二维码地址返回给客户端
    res.send({ orderNo: newOrder.id, code_url });
  } catch (error) {
    logger.error(`Native Pay Error`, error);
  }
});

//# 接收微信服务器商户后台支付成功回调通知
// 文档地址：https://pay.weixin.qq.com/docs/merchant/apis/native-payment/payment-notice.html
router.post("/callback", async (req, res) => {
  try {
    //验证签名 保证此通知是真的是由微信服务器发过来的
    const { headers, body } = req;
    //Wechatpay-Signature 签名
    const signature = headers["wechatpay-signature"];
    logger.info("signature", signature);
    //Wechatpay-Serial 微信服务器平台的证书序列号
    const serial = headers["wechatpay-serial"];
    logger.info("serial", serial);
    //* HTTP 头 Wechatpay-Timestamp 中的应答时间戳
    const timestamp = headers["wechatpay-timestamp"];
    logger.info("timestamp", timestamp);
    //* HTTP 头 Wechatpay-Nonce 中的应答随机串
    const nonce = headers["wechatpay-nonce"];
    logger.info("nonce", nonce);
    // 判断是否验证通过
    const isVerified = await wechatPay.verifySign({
      body,
      signature,
      serial,
      nonce,
      timestamp,
    });
    logger.info("isVerified", isVerified);
    logger.info("body", body);
    //如果事件类型是TRANSACTION.SUCCESS说明交易成功，说明用户支付成功
    if (isVerified && body && body.event_type === "TRANSACTION.SUCCESS") {
      // 解密结果
      const resultStr = wechatPay.decrypt(body.resource);
      const result = JSON.parse(resultStr);
      paymentLog.info("TRANSACTION.SUCCESS", result);
      //更新订单的状态为支付成功
      // out_trade_no =  商户系统内部订单号，可以是数字、大小写字母_-*的任意组合且在同一个商户号下唯一。
      await Order.findByIdAndUpdate(result.out_trade_no, {
        orderStatus: ORDER_STATUS.PAID,
      });
      res.status(200).send({
        code: "SUCCESS",
        message: "支付成功",
      });
    } else {
      res.status(200).send({
        code: "FAIL",
        message: "支付失败",
      });
    }
  } catch (error) {
    logger.error("接收通知失败", error);
    res.status(500).send(`处理微信支付服务器回调失败` + error.message);
  }
});

/**
 *  根据订单号查询订单
 * @param {Object} req 请求对象
 * @param {Object} res 响应对象
 */
router.get(`/order/:orderNo`, async (req, res) => {
  try {
    const { orderNo } = req.params;
    const result = await wechatPay.queryOrder(orderNo);
    logger.info("query order", result);
    res.status(200).send(result);
  } catch (error) {
    logger.error("查询订单失败", error);
    console.log(typeof error.response.data);
    // const data = JSON.parse(error)
    res.status(500).send({
      message: "查询订单失败",
      data: error.response.data,
    });
  }
});

router.get(`/order/:orderNo/close`, async (req, res) => {
  try {
    const { orderNo } = req.params;
    const result = await wechatPay.orderClose(orderNo);
    await Order.findByIdAndUpdate(orderNo, {
      orderStatus:ORDER_STATUS.CLOSE
    });
    logger.info("order close", result);
    res.status(200).send({message:"关闭订单成功"});
  } catch (error) {
    logger.error("关闭订单失败", error);
    res.status(500).send({
      message: "关闭订单失败",
      data: error.response.data,
    });
  }
});

module.exports = router;
