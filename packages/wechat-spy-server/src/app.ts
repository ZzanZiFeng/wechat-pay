import * as express from "express";
import * as morgan from "morgan";
import * as cros from "cors";
import "./error/handleError";
import { logger, requestLog } from "./logger";
import { swagger } from "./swagger";
import "./models";
import * as productRoutes from "./routes/productRoutes";
import * as orderRoutes from "./routes/orderRoutes";
import * as paymentRoutes from "./routes/paymentRoutes";
const app = express();
swagger(app);
app.use(morgan("dev"));
app.use(cros());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.get("/", (rep, res) => {
  res.send("wechatpay");
});
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
//# 如果有四个参数，第一个是错误
app.use((error, req, res, next) => {
  logger.error("Error", error);
  res.status(500).send(error);
});

app.use((error, req, res, next) => {
  res.status(400).send(`404:Page Not Found`);
});
app.all("*", function (request: any, response, next) {
  requestLog.info("request-originalUrl", request.originalUrl);
  next()
});
export { app };
