import dotenv from "dotenv";
dotenv.config();

import { app, server } from "./socket/socket.js";
import express from "express";
import { connectDB } from "./db/connection1.db.js";
import cookieParser from "cookie-parser";
import cors from "cors";


connectDB();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.status(200).send("Backend is running successfully!");
});

// routes
import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";
app.use("/api/v1/user", userRoute);
app.use("/api/v1/message", messageRoute);

const PORT = process.env.PORT || 5000;

// middlwares
import { errorMiddleware } from "./middlewares/error.middlware.js";
app.use(errorMiddleware);

server.listen(PORT, () => {
  console.log(`your server listening at port ${PORT}`);
});