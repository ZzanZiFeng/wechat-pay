import * as log4js from "log4js";
const now = new Date();
//# 获取一个日志记录器管理实例

//# 配置log4js的日志记录器
log4js.configure({
  appenders: {
    // 日志输出到控制台
    // console: {
    //   type: "console",
    //   layout: {
    //     type: "pattern",
    //     pattern: "%d{yyyy-MM-dd hh:mm:ss} [%p] %c - %m",
    //   },
    // },
    out: { type: "stdout" },
    // 日志输出到文件
    fileAppender: {
      type: "file",
      filename: `logs/log-${now.getFullYear()}-${
        now.getMonth() + 1
      }-${now.getDate()}.log`,
      layout: {
        type: "pattern",
        pattern: "%d{yyyy-MM-dd hh:mm:ss} [%p] %c - %m",
      },
    },
    paymentResults: {
      type: "file",
      filename: `logs/requestLog/paymentLog-${now.getFullYear()}-${
        now.getMonth() + 1
      }-${now.getDate()}.log`,
      layout: {
        type: "pattern",
        pattern: "%d{yyyy-MM-dd hh:mm:ss} [%p] %c - %m",
      },
    },
    requestLog: {
      type: "file",
      filename: `logs/requestLog/requestLog-${now.getFullYear()}-${
        now.getMonth() + 1
      }-${now.getDate()}.log`,
      layout: {
        type: "pattern",
        pattern: "%d{yyyy-MM-dd hh:mm:ss} [%p] %c - %m",
      },
    },
  },
  categories: {
    //默认类别
    default: {
      //同时输出到控制台和文件，并且日志记录级别为info
      appenders: ["out", "fileAppender"],
      level: "info",
    },
    requestLog: {
      appenders: ["requestLog"],
      level: "info",
    },
    paymentLog: {
      appenders: ["paymentResults"],
      level: "info",
    },
  },
});
const logger = log4js.getLogger();
const requestLog = log4js.getLogger("requestLog");
const paymentLog = log4js.getLogger("paymentLog");
export { logger, requestLog, paymentLog };
