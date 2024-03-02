//定义商品订单的状态枚举
enum ORDER_STATUS {
  UN_PAID = "UN_PAID", //订单刚创建未支付
  PAID = "PAID", //已支付
  CLOSE = "CLOSE", //已关闭
}
export { ORDER_STATUS };
