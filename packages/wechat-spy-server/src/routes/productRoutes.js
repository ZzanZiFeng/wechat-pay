const express = require("express");
const Product = require("../models/Product");
const router = express.Router();
/**
 * @swagger
 * /api/products:
 *   post:
 *     tags:
 *       - Product
 *     summary: 创建新产品
 *     description: 添加一个新产品到产品列表。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: 创建成功，返回新创建的产品
 *       400:
 *         description: 创建失败
 */
router.post("/", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).send(product);
  } catch (error) {
    res.status(400).send(error);
  }
});
/**
 * @swagger
 * /api/products:
 *   get:
 *     tags:
 *       - Product
 *     summary: 获取产品列表
 *     description: 检索产品列表。
 *     responses:
 *       200:
 *         description: 产品列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: 产品名称
 *                   price:
 *                     type: number
 *                     description: 产品价格
 */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ _id: -1 });
    res.send(products);
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags:
 *       - Product
 *     summary: 获取单个产品
 *     description: 根据 ID 检索单个产品。
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 产品ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 返回请求的产品
 *       404:
 *         description: 未找到产品
 *       500:
 *         description: 服务器错误
 */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send();
    }
    res.send(product);
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags:
 *       - Product
 *     summary: 更新产品信息
 *     description: 根据 ID 更新产品信息。
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 产品ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: 更新成功，返回更新后的产品
 *       400:
 *         description: 更新失败
 *       404:
 *         description: 未找到产品
 */
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).send();
    }
    res.send(product);
  } catch (error) {
    res.status(400).send(error);
  }
});
/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags:
 *       - Product
 *     summary: 删除单个产品
 *     description: 根据 ID 删除单个产品。
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 产品ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 删除成功
 *       404:
 *         description: 未找到产品
 *       500:
 *         description: 服务器错误
 */
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).send();
    }
    res.send(product);
  } catch (error) {
    res.status(500).send(error);
  }
});
/**
 * @swagger
 * /api/products:
 *   delete:
 *     tags:
 *       - Product
 *     summary: 删除所有产品
 *     description: 删除所有产品。
 *     responses:
 *       200:
 *         description: 删除成功
 *       404:
 *         description: 未找到产品
 *       500:
 *         description: 服务器错误
 */
router.delete("/", async (req, res) => {
  try {
    const product = await Product.deleteMany({});
    if (!product) {
      return res.status(404).send();
    }
    res.send(product);
  } catch (error) {
    res.status(500).send(error);
  }
});
module.exports = router;
