const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema(
  {
    /** 端口名称 */
    name: { type: String, default: "" },
    /** 商品名称 */
    cover: { type: String, default: "" },
    /** 商品价格 */
    price: { type: Number, default: 1 },
  },
  /** 自动使用时间戳 */
  { timestamps: true }
);
/** 定义了名为id的虚拟属性 */
ProductSchema.virtual("id").get(function () {
  // mongoose在保存文档的时候，会自动添加一个字段_id
  return this._id.toHexString(); // _id是一个ObjectId对象，toHexString将其转换为16位的字符串
});
//#  Product的toJSON方法，将虚拟属性id添加到JSON中 */
ProductSchema.set("toJSON", {
  virtuals: true,
});
ProductSchema.set("toObject", {
  virtuals: true,
});
//#定义一个Product模型 */
const Product = mongoose.model("Product", ProductSchema);
Product.countDocuments().then((count) => {
  if (count === 0) {
    Product.create({
      name: "小米手机",
      cover: "https://img.yzcdn.cn/vant/ipad.jpeg",
      price: 1,
    });
    Product.create({
      name: "华为手机",
      cover: "https://img.yzcdn.cn/vant/ipad.jpeg",
      price: 2,
    });
    Product.create({
      name: "苹果手机",
      cover: "https://img.yzcdn.cn/vant/ipad.jpeg",
      price: 3,
    });
  }
});
module.exports = Product;
