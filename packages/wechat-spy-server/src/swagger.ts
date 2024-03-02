// 用来创建swgger文档对象
import * as swaggerJsDoc from "swagger-jsdoc";
//提供展示API文档的UI界面
import * as swaggerUI from "swagger-ui-express";
import { Config } from "./config";

//# 设置swagger文档的基础信息

const swaggerDefinition = {
  /** 指定使用的OpenAPI3.0版本 */
  openapi: "3.0.0",
  info: {
    title: "微信支付后台",
    description: "微信支付后台接口文档",
    version: "1.0.0",
  },
  tags: [
    {
      /** 产品 */
      name: "Product",
      description: "产品管理",
    },
    {
      /** 订单 */
      name: "Order",
      description: "订单管理",
    },
    {
      /** 支付 */
      name: "Payment",
      description: "支付",
    },
  ],
  servers: [
    {
      url: `http://localhost:${Config.PORT}`,
    },
  ],
  host: `localhost:${Config.PORT}`,
  basePath: "/",
};

//# 配置swagger选项
const swaggerOptions = {
  swaggerDefinition,
  /** 指定包含API注释的文件路径 */
  apis: ["./routes/*.js"],
};

//# 使用配置选项创建swagger文档规范对象
const swaggerSpec = swaggerJsDoc(swaggerOptions);
const swagger = (app) => {
  //使用中间件
  //swaggerUI.serve 提供静态资源的 HTML CSS JS
  // swaggerUI.setup(swaggerSpec) 提供API文档的UI界面
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
};
export { swagger };
