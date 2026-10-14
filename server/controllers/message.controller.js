import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import { asyncHandler } from "../utilities/asyncHandler.utilities.js";
import { errorHandler } from "../utilities/errorHandler.utilities.js";
import {getSocketId, io} from '../socket/socket.js'

export const sendMessage = asyncHandler(async (req, res, next) => {
  const senderId = req.user._id;
  const receiverId = req.params.receiverId;
  const message = req.body.message;

  if (!senderId || !receiverId || !message) {
    return next(new errorHandler("All fields are required", 400));
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  const newMessage = await Message.create({
    senderId,
    receiverId,
    message,
  });

  if (newMessage) {
    conversation.messages.push(newMessage._id);
    await conversation.save();
  }

  // socket.io
  const socketId = getSocketId(receiverId);
  if (socketId) {
    io.to(socketId).emit("newMessage", newMessage);
  }
  io.to(receiverId.toString()).emit("newMessage", newMessage);

  res.status(200).json({
    success: true,
    responseData: newMessage,
  });
});

export const getMessages = asyncHandler(async (req, res, next) => {
  const myId = req.user._id;
  const otherParticipantId = req.params.otherParticipantId;

  if (!myId || !otherParticipantId) {
    return next(new errorHandler("All fields are required", 400));
  }

  // Mark all unread messages from otherParticipantId to me as seen
  const updateResult = await Message.updateMany(
    {
      senderId: otherParticipantId,
      receiverId: myId,
      seen: false,
    },
    {
      $set: { seen: true, seenAt: new Date() },
    }
  );

  if (updateResult.modifiedCount > 0) {
    const senderSocketId = getSocketId(otherParticipantId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", {
        readerId: myId.toString(),
      });
    }
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [myId, otherParticipantId] },
  }).populate("messages");

  res.status(200).json({
    success: true,
    responseData: conversation,
  });
});

export const markMessagesAsSeen = asyncHandler(async (req, res, next) => {
  const myId = req.user._id;
  const senderId = req.params.senderId;

  if (!myId || !senderId) {
    return next(new errorHandler("All fields are required", 400));
  }

  const updateResult = await Message.updateMany(
    {
      senderId,
      receiverId: myId,
      seen: false,
    },
    {
      $set: { seen: true, seenAt: new Date() },
    }
  );

  if (updateResult.modifiedCount > 0) {
    const senderSocketId = getSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", {
        readerId: myId.toString(),
      });
    }
  }

  res.status(200).json({
    success: true,
    message: "Messages marked as seen",
  });
});