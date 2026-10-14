import express from "express";
import {
  getOtherUsers,
  getProfile,
  login,
  logout,
  register,
  updateProfile,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  socialLogin,
  deleteAccount,
  deleteOtherUser,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/auth.middlware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/social-login", socialLogin);
router.post("/logout", isAuthenticated, logout);
router.delete("/delete-account", isAuthenticated, deleteAccount);
router.delete("/delete-user/:userId", isAuthenticated, deleteOtherUser);
router.get("/get-profile", isAuthenticated, getProfile);
router.get("/get-other-users", isAuthenticated, getOtherUsers);
router.put("/update-profile", isAuthenticated, updateProfile);

export default router;