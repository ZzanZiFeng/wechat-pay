const express = require("express");
const Order = require("../models/Order");
const router = express.Router();
/**
 * @swagger
 * /orders:
 *   post:
 *     tags:
 *       - Order
 *     summary: 创建一个新订单
 *     description: 添加一个新订单到数据库。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: 创建成功，返回新创建的订单
 *       400:
 *         description: 请求错误
 */
router.post("/", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).send(order);
  } catch (error) {
    res.status(400).send(error);
  }
});
/**
 * @swagger
 * /orders:
 *   get:
 *     tags:
 *       - Order
 *     summary: 获取所有订单
 *     description: 从数据库中检索所有订单。
 *     responses:
 *       200:
 *         description: 成功检索所有订单
 *       500:
 *         description: 服务器错误
 */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find({}).populate("product").sort({ _id: -1 });
    res.send(orders);
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     tags:
 *       - Order
 *     summary: 获取特定订单
 *     description: 根据订单ID获取特定订单。
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 订单ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功检索订单
 *       404:
 *         description: 未找到订单
 *       500:
 *         description: 服务器错误
 */
router.get("//:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("product");
    if (!order) {
      return res.status(404).send();
    }
    res.send(order);
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     tags:
 *       - Order
 *     summary: 更新特定订单
 *     description: 根据订单ID更新订单信息。
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 订单ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: 成功更新订单
 *       400:
 *         description: 请求错误
 *       404:
 *         description: 未找到订单
 */
router.put("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!order) {
      return res.status(404).send();
    }
    res.send(order);
  } catch (error) {
    res.status(400).send(error);
  }
});
/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     tags:
 *       - Order
 *     summary: 删除特定订单
 *     description: 根据订单ID删除特定订单。
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 订单ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功删除订单
 *       404:
 *         description: 未找到订单
 *       500:
 *         description: 服务器错误
 */
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).send();
    }
    res.send(order);
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * @swagger
 * /orders:
 *   delete:
 *     tags:
 *       - Order
 *     summary: 删除所有订单
 *     description: 删除数据库中的所有订单。
 *     responses:
 *       200:
 *         description: 成功删除所有订单
 *       500:
 *         description: 服务器错误
 */
router.delete("/", async (req, res) => {
  try {
    const result = await Order.deleteMany({});
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});
module.exports = router;
