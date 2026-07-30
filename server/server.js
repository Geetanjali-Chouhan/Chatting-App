// import dotenv from 'dotenv';
// dotenv.config();
// import express from 'express';
// import { connectDB } from './db/connection1.db.js';
// connectDB();
// const app = express();

// app.use(express.json());

// const PORT = process.env.PORT|| 5000;
// // console.log(PORT)

// // routes
// import userRoute from './routes/user.route.js'
// app.use('/api/v1/user',userRoute) 

// // middleware
// import { errorMiddleware } from './middlewares/error.middleware.js';
// app.use(errorMiddleware); 

// app.listen(PORT, () => {
//   console.log(`Your server listening on port ${PORT}`)
// })

import { app, server } from "./socket/socket.js";
import express from "express";
import { connectDB } from "./db/connection1.db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

connectDB();

app.use(
  cors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

// routes
import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";
app.use("/api/v1/user", userRoute);
app.use("/api/v1/message", messageRoute);

// middlwares
import { errorMiddleware } from "./middlewares/error.middlware.js";
app.use(errorMiddleware);

server.listen(PORT, () => {
  console.log(`your server listening at port ${PORT}`);
});