import * as fs from "fs";
import * as os from "os";
import * as path from "path";
const dir = path.resolve(__dirname, "../../");

function handleError(error) {
  fs.mkdirSync(dir, { recursive: true });
  const logFile = path.join(dir, "error.log");

  const date = new Date()
    .toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(/\//g, "-");
  console.log(logFile, "===>", `${date} - ${error.toString()}\n`);
  fs.appendFile(
    logFile,
    `日期:${date}
      设备信息:${os.type()} ${os.platform()} ${os.release()}
      架构信息:${os.cpus()[0].model}${os.arch()}
      报错信息:${error?.toString()}\n`,
    (err) => {
      if (err) console.log(err);
    }
  );
}
process.on("unhandledRejection", handleError);

process.on("uncaughtException", handleError);