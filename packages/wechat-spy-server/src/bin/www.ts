#! /use/bin/env node
import { app } from "../app";
import { Config } from "../config";
app.listen(Config.PORT, () => {
  console.log(`Server is Running on Port ${Config.PORT}`);
});
