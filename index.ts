import express from "express";
import cors from "cors";
import { db } from "./src/db/connection.js";
import { config } from "./config/index.js";
import roomRouter from "./src/api/room/roomRouter.js";
import bookingRouter from "./src/api/booking/bookingRouter.js";
import authRouter from "./src/api/auth/authRouter.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1", roomRouter);
app.use("/api/v1", bookingRouter);
app.use("/auth", authRouter);
async function start() {
  try {
    await db.authenticate();
    await db.sync();
    app.listen(config.port || "3000");
  } catch {
  }
}

start();
