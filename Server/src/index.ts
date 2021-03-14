import { mongoSetup, startServer } from "./config/server";
import { config } from "dotenv";

(async () => {
  config();
  await mongoSetup();
  await startServer();
})();
