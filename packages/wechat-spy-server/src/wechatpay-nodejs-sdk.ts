import { Certificate } from "@fidm/x509";
import axios from "axios";
import * as crypto from "crypto";
import { logger } from "./logger";

type CERTIFICATES_type = {
  /** 【证书序列号】 平台证书的主键，唯一定义此资源的标识 */
  serial_no: string;
  /** 【证书启用时间】 启用证书的时间，时间格式为RFC3339。每个平台证书的启用时间是固定的。 */
  effective_time: string;
  /** 【证书弃用时间】 弃用证书的时间，时间格式为RFC3339。更换平台证书前，会提前24小时修改老证书的弃用时间，接口返回新老两个平台证书。更换完成后，接口会返回最新的平台证书。 */
  expire_time: string;
  /** 【证书信息】 证书内容 */
  encrypt_certificate: Encryptcertificate;
};

type Encryptcertificate = {
  /** 【加密证书的算法】 对开启结果数据进行加密的加密算法，目前只支持AEAD_AES_256_GCM。 */
  algorithm: string;
  /** 【加密证书的随机串】 对应到加密算法中的IV。 */
  nonce: string;
  /** 【加密证书的附加数据】 加密证书的附加数据，固定为“certificate"。 */
  associated_data: string;
  /** 【加密后的证书内容】 使用API KEY和上述参数，可以解密出平台证书的明文。证书明文为PEM格式。（注意：更换证书时会出现PEM格式中的证书失效时间与接口返回的证书弃用时间不一致的情况） */
  ciphertext: string;
};
//缓存所有的证书,key是微信服务器的证书编号，值是微信服务器的证书的公钥
const CERTIFICATES = {};
const wechatPayAPI = axios.create({
  //预设了微信支付的域名
  baseURL: "https://api.mch.weixin.qq.com",
  headers: {
    //默认的请求头
    "Content-Type": "application/json", //指定请求体的类型
    Accept: "application/json", //期待服务器返回的类型也是JSON
  },
});

/**
 * #获取证书序列号
 * @param {string} publicKey - 证书公钥
 * @returns {string} - 证书序列号
 */
function getSerial_no(publicKey) {
  //从PEM公钥中提取证书序列号
  // openssl x509 -in 1900009191_20180326_cert.pem -noout -serial
  return Certificate.fromPEM(publicKey).serialNumber.toUpperCase();
}

class WechatPay {
  private appid: string;
  private mchid: string;
  private publicKey: string;
  private privateKey: string;
  private secretKey: string;
  private serial_no: string;
  constructor({ appid, mchid, publicKey, privateKey, secretKey }) {
    logger.info(`WechatPay`, {
      appid,
      mchid,
      publicKey,
      privateKey,
      secretKey,
    });
    this.appid = appid;
    this.mchid = mchid;
    this.publicKey = publicKey;
    this.privateKey = privateKey;
    this.serial_no = getSerial_no(publicKey);
    this.secretKey = secretKey;
  }

  /**
   * # 向微信服务器发送请求
   * @param method 请求的方法
   * @param url 请求的路径
   * @param body 请求体，默认为空对象
   * @returns 响应体
   */
  private async request(method, url, body = {}) {
    //1. 准备商户号、商户公钥和商户私钥
    //2. 构造签名串
    // 第一步，获取HTTP请求的方法（GET，POST，PUT）等 method
    // 第二步，获取请求的绝对URL，并去除域名部分得到参与签名的URL url
    // 第三步，获取发起请求时的系统当前时间戳
    const timestamp = Math.floor(Date.now() / 1000).toString();
    // 第四步，生成一个请求随机串
    const nonce_str = Math.random().toString(36).substring(2, 17);
    // 第五步，获取请求中的请求报文主体（request body）。 body
    const signature = this.sign(method, url, nonce_str, timestamp, body);
    logger.info(`signature`, signature);
    //  生成认证信息
    const Authorization = `WECHATPAY2-SHA256-RSA2048 mchid="${this.mchid}",nonce_str="${nonce_str}",timestamp="${timestamp}",serial_no="${this.serial_no}",signature="${signature}"`;
    logger.info("Authorization", Authorization);
    const headers = {
      Authorization,
    };
    const response = await wechatPayAPI.request({
      method, // 请求的方法
      url, // 请求的路径
      data: body, // 指定请求体
      headers,
    });
    // 返回响应体
    return response.data;
  }

  /**
   * # 签名方法
   * @param {string} method - 请求方法
   * @param {string} url - 请求URL
   * @param {string} nonce_str - 随机字符串
   * @param {string} timestamp - 时间戳
   * @param {object} body - 请求体
   * @returns {string} - 签名值
   */
  private sign(
    method: "GET" | "POST" | "POT",
    url: string,
    nonce_str: string,
    timestamp: Date | string,
    body
  ) {
    // 第六步，按照前述规则，构造的请求签名串为：
    let requestSignStr = `${method}\n${url}\n${timestamp}\n${nonce_str}\n`;
    requestSignStr +=
      method !== "GET" && body ? `${JSON.stringify(body)}\n` : "\n";
    logger.info("requestSignStr", requestSignStr);

    // 3. 计算签名值
    // 使用商户私钥对待签名串进行SHA256 with RSA签名，并对签名结果进行Base64编码得到签名值
    const rsaSha = crypto.createSign("RSA-SHA256");
    // 输入待签名串
    rsaSha.update(requestSignStr);
    // 按base64格式输出签名的结果
    // rsaSha.sign(privatekey, "base64") 相当于做了生成摘要和加密两个动作是吗？
    return rsaSha.sign(this.privateKey, "base64");
  }

  /**
   * # 发起原生支付交易
   * @param {Object} params - 请求参数
   * @returns {Promise} - 返回支付结果的Promise对象
   */
  async transactions_native(params) {
    const url = `/v3/pay/transactions/native`;
    // 准备请求体
    const requestParams = {
      appid: this.appid, // 应用ID
      mchid: this.mchid, // 商户ID
      ...params,
    };
    // 文档地址：https://pay.weixin.qq.com/docs/merchant/apis/platform-certificate/api-v3-get-certificates/get.html
    return await this.request("POST", url, requestParams);
  }

  /**
   * # 读取微信的公钥
   * 异步方法：fetchWechatPayPublicKey
   * 根据传入的序列号获取微信支付平台的公钥
   * @param serial 序列号
   * @returns 微信支付平台的公钥
   */
  private async fetchWechatPayPublicKey(serial) {
    // 首先尝试从缓存中读取微信的公钥
    const wechatPayPublicKey = CERTIFICATES[serial];
    // 如果有则直接返回此公钥
    if (wechatPayPublicKey) return wechatPayPublicKey;
    // 获取商户当前可用的微信支付平台证书列表

    const result = await this.request("GET", "/v3/certificates");
    logger.info("certificates.result", result);
    // 获取证书列表
    const certificates: Array<CERTIFICATES_type> = result.data;

    certificates.forEach(({ serial_no, encrypt_certificate }) => {
      // 解密证书
      const certificate = this.decrypt(encrypt_certificate);
      logger.info("certificate", certificate);
      // 取出解密后的证书中的公钥，转成PEM格式并缓存在CERTIFICATES中
      CERTIFICATES[serial_no] = Certificate.fromPEM(
        certificate as unknown as Buffer
      ).publicKey.toPEM();
    });
    // 返回此序列号对应的微信平台公钥
    return CERTIFICATES[serial];
  }

  /**
   * # 解密加密的数据
   * @param encrypted 加密后的数据对象
   * @returns 解密后的数据字符串
   */
  public decrypt(encrypted) {
    //algorithm=AEAD_AES_256_GCM
    //ciphertext=加密后的证书内容,nonce加密证书的随机串】 对应到加密算法中的IV。
    //加密算法中的IV就是加盐，即使原文一样，密钥一样，因为盐值的不同，密文也不一样
    const { ciphertext, associated_data, nonce } = encrypted;
    // 将加密后的证书内容转换为Buffer对象
    const encryptedBuffer = Buffer.from(ciphertext, "base64");
    //encryptedBuffer分成二部分，最后的16个字节是认证标签
    const authTag = encryptedBuffer.subarray(encryptedBuffer.length - 16);
    //前面的才是加密后的内容
    //AEAD_AES_256_GCM 提供了认证加密的功能，在这个模块式，除了加密的数据本身外，还生成一个认证标签的额外数据
    //用于保证数据的完整性的真实性
    //AAD附加认证数据 AAD是在加密过程中使用的数据，但不会被加密
    const encryptedData = encryptedBuffer.subarray(
      0,
      encryptedBuffer.length - 16
    );
    // 创建解密器，使用AES-256-GCM算法和密钥对加密数据进行解密
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      /** V3密钥 */
      this.secretKey,
      nonce
    );
    //设置认证标签
    decipher.setAuthTag(authTag);

    decipher.setAAD(Buffer.from(associated_data)); //设置附加认证数据
    //开始解密，得到解密结果
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);
    const decryptedString = decrypted.toString("utf8");
    return decryptedString;
  }

  /**
   * 验证签名
   * @param {Object} params - 参数对象
   * @param {Object} params.body - 请求体
   * @param {string} params.signature - 签名
   * @param {string} params.serial - 序列号
   * @param {string} params.nonce - 一次性随机数
   * @param {string} params.timestamp - 时间戳
   * @returns {Promise<boolean>} - 验签结果
   */
  public async verifySign({
    body,
    signature,
    serial,
    nonce,
    timestamp,
  }: {
    body: object;
    signature: string;
    serial: string;
    nonce: string;
    timestamp: string;
  }) {
    // 构造验签名串
    const wechatPayPublicKey = await this.fetchWechatPayPublicKey(serial);
    logger.info("wechatPayPublicKey", wechatPayPublicKey);
    /**
     * 应答时间戳\n
     * 应答随机串\n
     * 应答报文主体\n
     */
    const verifySignStr = `${timestamp}\n${nonce}\n${JSON.stringify(body)}\n`;
    logger.info("verifySignStr", verifySignStr);
    // 获取应答签名,使用 base64 解码 Wechatpay-Signature 字段值，得到应答签名。
    // 最后，验证签名，得到验签结果。
    // 创建验证对象
    const verify = crypto.createVerify("RSA-SHA256");
    // 更新验证数据
    verify.update(verifySignStr);
    // 微信平台的公钥,签名，编码
    return verify.verify(wechatPayPublicKey, signature, "base64");
  }

  /**
   * # 查询订单
   * @param orderNo 订单号
   * @returns Promise 返回查询结果
   * 文档地址： https://pay.weixin.qq.com/docs/merchant/apis/native-payment/query-by-out-trade-no.html
   */
  async queryOrder(orderNo: string) {
    const url = `/v3/pay/transactions/out-trade-no/${orderNo}?mchid=${this.mchid}`;
    return await this.request("GET", url);
  }

  /**
   * # 关闭订单
   * @param orderNo 订单号
   * @returns Promise 返回请求结果
   */
  async orderClose(orderNo: string) {
    const url = `/v3/pay/transactions/out-trade-no/${orderNo}/close`;
    return await this.request("POST", url, {
      mchid: this.mchid
    });
  }
}

export { WechatPay };

/**
微信支付API v3 要求商户对请求进行签名，微信支付会在收到请求后进行签名的验证。
如果签名验证不通过，微信支付API v3将会拒绝处理请求，并返回401 Unauthorized。

微信支付商户API v3要求请求通过HTTP Authorization头来传递签名。
Authorization由认证类型和签名信息两个部分组成。
Authorization: 认证类型 签名信息
Authorization: WECHATPAY2-SHA256-RSA2048 
Authorization: WECHATPAY2-SHA256-RSA2048 
mchid="1900009191",
nonce_str="593BEC0C930BF1AFEB40B4A08C8FB242",
signature="sign",
timestamp="1554208460",
serial_no="1DDE55AD98ED71D6EDD4A4A16996DE7B47773A8C"
 */
