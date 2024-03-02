import * as mongoose from "mongoose";
import { Config } from "../config";
import { logger } from "../logger";

(async function connectToMongoDB() {
  try {
    await mongoose.connect(Config.DB_URL);
    logger.info(`MongoDB connected success`);
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.messages}`);
  }
})();
