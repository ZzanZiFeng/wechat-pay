export const MAX_CHECKOUT_COUNT = 10;
export enum TRADE_STATE {
  SUCCESS = "SUCCESS",
  NOTPAY = "NOTPAY",
}
export enum ORDER_STATUS {
  UN_PAID = "UN_PAID", //订单刚创建未支付
  PAID = "PAID", //已支付
  CLOSE = "CLOSE", //已关闭
}
