//% 订单
const mongoose = require("mongoose");
const OrderSchema = new mongoose.Schema(
  {
    // 产品ID  存放的是产品的主键
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    totalFee: { type: Number }, //总金额
    code_url: { type: String }, // 支付的二维码 
    orderStatus: { type: String }, //订单状态
  },
  { timestamps: true }
);
OrderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
OrderSchema.set("toJSON", {
  virtuals: true,
});
OrderSchema.set("toObject", {
  virtuals: true,
});
const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
