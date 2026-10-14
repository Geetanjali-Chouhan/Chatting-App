import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import {asyncHandler} from "../utilities/asyncHandler.utilities.js";
import { errorHandler } from "../utilities/errorHandler.utilities.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { sendOtpEmail, sendResetPasswordEmail } from "../utilities/sendEmail.utilities.js";

export const register = asyncHandler(async (req, res, next) => {
  const { fullName, username, email, password, gender } = req.body;

  if (!fullName || !username || !password || !gender) {
    return next(new errorHandler("All fields are required", 400));
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return next(new errorHandler("Username already exists", 400));
  }

  if (email && email.trim()) {
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return next(new errorHandler("Email is already registered", 400));
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const avatarType = gender === "male" ? "boy" : "girl";
  const avatar = `https://avatar.iran.liara.run/public/${avatarType}?username=${username}`;

  const newUser = await User.create({
    username,
    fullName,
    email: email && email.trim() ? email.toLowerCase().trim() : undefined,
    password: hashedPassword,
    gender,
    avatar,
  });

  const tokenData = {
    _id: newUser?._id,
  };

  const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

  res
    .status(200)
    .cookie("token", token, {
      expires: new Date(
        Date.now() + (process.env.COOKIE_EXPIRES || 2) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      responseData: {
        newUser,
        token,
      },
    });
});

export const login = asyncHandler(async (req, res, next) => {
  const identifier = req.body.email || req.body.username;
  const password = req.body.password;

  if (!identifier || !password) {
    return next(
      new errorHandler("Please enter your email and password", 400)
    );
  }

  const trimmed = identifier.trim().toLowerCase();
  const user = await User.findOne({
    $or: [{ email: trimmed }, { username: identifier.trim() }],
  });

  if (!user) {
    return next(
      new errorHandler("Invalid email or password", 400)
    );
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return next(
      new errorHandler("Invalid email or password", 400)
    );
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
  await user.save();

  // Target email for sending OTP
  const targetEmail = user.email || (identifier.includes("@") ? identifier : `${user.username}@gupshup.local`);
  
  // If user didn't have an email in DB but logged in using an email, update it
  if (!user.email && identifier.includes("@")) {
    user.email = identifier.toLowerCase().trim();
    await user.save();
  }

  await sendOtpEmail(targetEmail, otp);

  res.status(200).json({
    success: true,
    requireOtp: true,
    message: `Verification code sent to ${targetEmail}`,
    responseData: {
      userId: user._id,
      email: targetEmail,
      username: user.username,
      previewOtp: otp, // For ease of testing in development
    },
  });
});

export const verifyOtp = asyncHandler(async (req, res, next) => {
  const { userId, email, otp } = req.body;

  if (!otp || (!userId && !email)) {
    return next(new errorHandler("User identifier and OTP are required", 400));
  }

  let user = null;
  if (userId) {
    user = await User.findById(userId);
  } else if (email) {
    const trimmed = email.trim().toLowerCase();
    user = await User.findOne({
      $or: [{ email: trimmed }, { username: email.trim() }],
    });
  }

  if (!user) {
    return next(new errorHandler("User not found", 404));
  }

  if (!user.otp || user.otp !== otp.toString().trim()) {
    return next(new errorHandler("Invalid verification code. Please try again.", 400));
  }

  if (new Date() > new Date(user.otpExpires)) {
    return next(
      new errorHandler("Verification code has expired. Please request a new one.", 400)
    );
  }

  // Clear OTP upon successful verification
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  const tokenData = {
    _id: user._id,
  };

  const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "2d",
  });

  const cookieDays = process.env.COOKIE_EXPIRES ? Number(process.env.COOKIE_EXPIRES) : 2;

  res
    .status(200)
    .cookie("token", token, {
      expires: new Date(Date.now() + cookieDays * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      message: "Email verified & logged in successfully!",
      responseData: {
        user,
        token,
      },
    });
});

export const resendOtp = asyncHandler(async (req, res, next) => {
  const { userId, email } = req.body;

  if (!userId && !email) {
    return next(new errorHandler("User identifier is required", 400));
  }

  let user = null;
  if (userId) {
    user = await User.findById(userId);
  } else if (email) {
    const trimmed = email.trim().toLowerCase();
    user = await User.findOne({
      $or: [{ email: trimmed }, { username: email.trim() }],
    });
  }

  if (!user) {
    return next(new errorHandler("User not found", 404));
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  const targetEmail = user.email || `${user.username}@gupshup.local`;
  await sendOtpEmail(targetEmail, otp);

  res.status(200).json({
    success: true,
    message: `New verification code sent to ${targetEmail}`,
    responseData: {
      userId: user._id,
      email: targetEmail,
      previewOtp: otp,
    },
  });
});

export const getProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const profile = await User.findById(userId);

  res.status(200).json({
    success: true,
    responseData: profile,
  });
});

export const logout = asyncHandler(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logout successfull!",
    });
});

export const getOtherUsers = asyncHandler(async (req, res, next) => {
  const currentUserId = req.user._id;
  const otherUsers = await User.find({ _id: { $ne: currentUserId } })
    .select("-password")
    .lean();

  const conversations = await Conversation.find({
    participants: currentUserId,
  }).populate({
    path: "messages",
    options: { sort: { createdAt: -1 }, limit: 1 },
  });

  const usersWithChatInfo = await Promise.all(
    otherUsers.map(async (user) => {
      const conv = conversations.find((c) =>
        c.participants.some((p) => p.toString() === user._id.toString())
      );
      const lastMessage =
        conv && conv.messages && conv.messages.length > 0 ? conv.messages[0] : null;

      let unreadCount = 0;
      if (conv) {
        unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: currentUserId,
          seen: false,
        });
      }

      return {
        ...user,
        lastMessage,
        unreadCount,
      };
    })
  );

  // Sort users by recent notification/message timestamp (most recent at top)
  usersWithChatInfo.sort((a, b) => {
    const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
    if (timeB !== timeA) {
      return timeB - timeA;
    }
    // If no messages or same time, users with unread messages come first
    if ((b.unreadCount || 0) !== (a.unreadCount || 0)) {
      return (b.unreadCount || 0) - (a.unreadCount || 0);
    }
    return (a.fullName || "").localeCompare(b.fullName || "");
  });

  res.status(200).json({
    success: true,
    responseData: usersWithChatInfo,
  });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { avatar, fullName, username, email } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return next(new errorHandler("User not found", 404));
  }

  if (avatar) {
    user.avatar = avatar;
  }
  if (fullName && fullName.trim()) {
    user.fullName = fullName.trim();
  }
  if (username && username.trim() && username.trim() !== user.username) {
    const existing = await User.findOne({ username: username.trim() });
    if (existing && existing._id.toString() !== userId.toString()) {
      return next(new errorHandler("Username is already taken", 400));
    }
    user.username = username.trim();
  }
  if (email && email.trim() && email.trim().toLowerCase() !== user.email) {
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing && existing._id.toString() !== userId.toString()) {
      return next(new errorHandler("Email is already registered", 400));
    }
    user.email = email.trim().toLowerCase();
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully!",
    responseData: user,
  });
});

export const deleteAccount = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  if (!userId) {
    return next(new errorHandler("Unauthorized request", 401));
  }

  // 1. Delete messages sent or received by this user
  await Message.deleteMany({
    $or: [{ senderId: userId }, { receiverId: userId }],
  });

  // 2. Delete conversations involving this user
  await Conversation.deleteMany({
    participants: userId,
  });

  // 3. Delete user document
  await User.findByIdAndDelete(userId);

  // 4. Clear auth cookie
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      message: "Your account and all associated data have been permanently deleted.",
    });
});

export const deleteOtherUser = asyncHandler(async (req, res, next) => {
  const currentUserId = req.user._id;
  const targetUserId = req.params.userId;

  if (!targetUserId) {
    return next(new errorHandler("Target user ID is required", 400));
  }

  // Delete messages between current user and target user
  await Message.deleteMany({
    $or: [
      { senderId: currentUserId, receiverId: targetUserId },
      { senderId: targetUserId, receiverId: currentUserId },
    ],
  });

  // Delete conversation between them
  await Conversation.findOneAndDelete({
    participants: { $all: [currentUserId, targetUserId] },
  });

  res.status(200).json({
    success: true,
    message: "Conversation and user removed successfully.",
    responseData: {
      deletedUserId: targetUserId,
    },
  });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return next(new errorHandler("Please provide your email address", 400));
  }

  const trimmed = email.trim().toLowerCase();
  const user = await User.findOne({
    $or: [{ email: trimmed }, { username: email.trim() }],
  });

  if (!user) {
    return next(
      new errorHandler("No account found with this email or username", 404)
    );
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordOtp = otp;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
  await user.save();

  const targetEmail =
    user.email ||
    (email.includes("@") ? email.trim() : `${user.username}@gupshup.local`);

  await sendResetPasswordEmail(targetEmail, otp);

  res.status(200).json({
    success: true,
    message: `Password reset verification code sent to ${targetEmail}`,
    responseData: {
      email: targetEmail,
      previewOtp: otp,
    },
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return next(
      new errorHandler(
        "All fields (email, verification code, new password) are required",
        400
      )
    );
  }

  const trimmed = email.trim().toLowerCase();
  const user = await User.findOne({
    $or: [{ email: trimmed }, { username: email.trim() }],
  });

  if (!user) {
    return next(new errorHandler("User not found", 404));
  }

  if (
    !user.resetPasswordOtp ||
    user.resetPasswordOtp !== otp.toString().trim()
  ) {
    return next(
      new errorHandler("Invalid password reset verification code", 400)
    );
  }

  if (new Date() > new Date(user.resetPasswordExpires)) {
    return next(
      new errorHandler(
        "Password reset code has expired. Please request a new code.",
        400
      )
    );
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.resetPasswordOtp = null;
  user.resetPasswordExpires = null;
  await user.save();

  const tokenData = {
    _id: user._id,
  };

  const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "2d",
  });

  const cookieDays = process.env.COOKIE_EXPIRES
    ? Number(process.env.COOKIE_EXPIRES)
    : 2;

  res
    .status(200)
    .cookie("token", token, {
      expires: new Date(Date.now() + cookieDays * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      message: "Password reset successfully! Logged in.",
      responseData: {
        user,
        token,
      },
    });
});

export const socialLogin = asyncHandler(async (req, res, next) => {
  const { provider, email, fullName, avatar } = req.body;

  if (!email) {
    return next(new errorHandler("Email is required for social sign-in", 400));
  }

  const trimmedEmail = email.trim().toLowerCase();
  let user = await User.findOne({ email: trimmedEmail });

  if (!user) {
    // Generate unique username from email
    const baseUsername =
      trimmedEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") || "user";
    let uniqueUsername = baseUsername;
    let counter = 1;
    while (await User.findOne({ username: uniqueUsername })) {
      uniqueUsername = `${baseUsername}_${Math.floor(
        1000 + Math.random() * 9000
      )}`;
      counter++;
      if (counter > 10) break;
    }

    // Generate random secure password for social user
    const randomPassword = await bcrypt.hash(
      Math.random().toString(36).slice(-10),
      10
    );
    const defaultAvatar =
      avatar ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${uniqueUsername}`;

    user = await User.create({
      username: uniqueUsername,
      fullName:
        fullName ||
        (provider === "google" ? "Google User" : "Facebook User"),
      email: trimmedEmail,
      password: randomPassword,
      gender: "male",
      avatar: defaultAvatar,
    });
  }

  const tokenData = {
    _id: user._id,
  };

  const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "2d",
  });

  const cookieDays = process.env.COOKIE_EXPIRES
    ? Number(process.env.COOKIE_EXPIRES)
    : 2;

  res
    .status(200)
    .cookie("token", token, {
      expires: new Date(Date.now() + cookieDays * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      message: `Signed in successfully with ${
        provider === "google" ? "Google" : "Facebook"
      }!`,
      responseData: {
        user,
        token,
      },
    });
});


// import User from "../models/user.model.js";
// import { asyncHandler } from "../utilities/asyncHandler.utilities.js";
// import { errorHandler } from "../utilities/errorHandler.utility.js";

// // named export function create hote h
// export const register = asyncHandler((req,res,next) =>{
// const {fullName ,username,password,gender} = req.body;
//     if(fullName || !username || !password || !gender) {
//     return next(new errorHandler("all fields are required",400))
//     }
//     res.send("hello register")
   
// }); 
// export const login =(req, res,next) =>{
//    res.send("hello I am login route");
// }; 
 