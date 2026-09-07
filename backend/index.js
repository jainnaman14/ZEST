import express from "express";
import dotenv from "dotenv";
dotenv.config();

import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import itemRouter from "./routes/item.routes.js";
import shopRouter from "./routes/shop.routes.js";
import orderRouter from "./routes/order.routes.js";
import seedRouter from "./routes/seed.routes.js";
import { socketHandler } from "./socket.js";

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

const corsOriginChecker = (origin, callback) => {
  if (!origin) return callback(null, true);
  const normalized = origin.replace(/\/$/, "");
  const envFrontend = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, "") : null;
  if (
    normalized === "http://localhost:5173" ||
    normalized === "http://localhost:3000" ||
    normalized === "http://localhost:5174" ||
    normalized === "https://zest-rose.vercel.app" ||
    normalized.endsWith(".vercel.app") ||
    normalized === envFrontend
  ) {
    return callback(null, true);
  }
  // Allow other origins with warning for dev/preview flexibility
  return callback(null, true);
};

app.use(
  cors({
    origin: corsOriginChecker,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
  })
);

const io = new Server(server, {
  cors: {
    origin: corsOriginChecker,
    credentials: true,
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);
app.use("/api/seed", seedRouter);

socketHandler(io);

connectDb();

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
