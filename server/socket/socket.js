import dotenv from "dotenv";
dotenv.config();

import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, "http://localhost:5173", "http://127.0.0.1:5173"].filter(Boolean),
    credentials: true,
  },
});

const userSocketMap = {
  // userId : Set of socketIds
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (!userId || userId === "undefined") return;

  if (!userSocketMap[userId]) {
    userSocketMap[userId] = new Set();
  }
  userSocketMap[userId].add(socket.id);
  socket.join(userId);

  // Broadcast to all clients whenever a user comes online
  io.emit("onlineUsers", Object.keys(userSocketMap));

  // Allow client to request currently online users at any time
  socket.on("getOnlineUsers", () => {
    socket.emit("onlineUsers", Object.keys(userSocketMap));
  });

  socket.on("markMessagesSeen", async ({ senderId }) => {
    try {
      if (!userId || !senderId) return;
      const Message = (await import("../models/message.model.js")).default;
      await Message.updateMany(
        {
          senderId,
          receiverId: userId,
          seen: false,
        },
        {
          $set: { seen: true, seenAt: new Date() },
        }
      );

      // Notify the sender room and socket
      io.to(senderId.toString()).emit("messagesSeen", {
        readerId: userId.toString(),
      });
      const senderSocketId = getSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesSeen", {
          readerId: userId.toString(),
        });
      }
    } catch (err) {
      console.error("Error in markMessagesSeen socket event:", err);
    }
  });

  socket.on("disconnect", () => {
    if (userSocketMap[userId]) {
      userSocketMap[userId].delete(socket.id);
      if (userSocketMap[userId].size === 0) {
        delete userSocketMap[userId];
      }
    }
    // Broadcast updated list when someone goes offline
    io.emit("onlineUsers", Object.keys(userSocketMap));
  });
});

const getSocketId = (userId) => {
  if (!userSocketMap[userId] || userSocketMap[userId].size === 0) return null;
  return Array.from(userSocketMap[userId])[0];
};

export { io, app, server, getSocketId };