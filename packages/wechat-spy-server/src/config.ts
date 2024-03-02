import * as dotenv from "dotenv";
dotenv.config();
console.log(
  "%c [ process.env ]-6-「e:/学习/wechat/wechat-spy-server/config」",
  "font-size:15px; background:#37f40c; color:#7bff50;",
  process.env
);

const Config = {
  /** 后台服务的端口号 */
  PORT: process.env.PORT || 8000,
  /** 数据库地址 */
  DB_URL: process.env.DB_URL,
  /** 微信服务号ID */
  WECHAT_APP_ID: process.env.WECHAT_APP_ID,
  /** 微信商户号ID */
  WECHAT_MCH_ID: process.env.WECHAT_MCH_ID,
  /** 支付成功微信回调的地址 */
  WECHAT_NOTIFY_URL: process.env.WECHAT_NOTIFY_URL,
  /** V3密钥用来进行对称加密 */
  SECRET_KEY: process.env.SECRET_KEY,
};

export { Config };
