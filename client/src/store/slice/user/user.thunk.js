import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../../../components/utitlities/axiosInstance";

export const loginUserThunk = createAsyncThunk(
  "user/login",
  async ({ email, username, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/user/login", {
        email: email || username,
        username: username || email,
        password,
      });
      if (response.data?.message) {
        toast.success(response.data.message);
      }
      return response.data;
    } catch (error) {
      console.error(error);
      const errorOutput = error?.response?.data?.errMessage || "Login failed";
      toast.error(errorOutput);
      return rejectWithValue(errorOutput);
    }
  }
);

export const verifyOtpThunk = createAsyncThunk(
  "user/verifyOtp",
  async ({ userId, email, otp }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/user/verify-otp", {
        userId,
        email,
        otp,
      });
      toast.success(response.data?.message || "Verified successfully!");
      return response.data;
    } catch (error) {
      console.error(error);
      const errorOutput = error?.response?.data?.errMessage || "Invalid verification code";
      toast.error(errorOutput);
      return rejectWithValue(errorOutput);
    }
  }
);

export const resendOtpThunk = createAsyncThunk(
  "user/resendOtp",
  async ({ userId, email }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/user/resend-otp", {
        userId,
        email,
      });
      toast.success(response.data?.message || "Verification code resent!");
      return response.data;
    } catch (error) {
      console.error(error);
      const errorOutput = error?.response?.data?.errMessage || "Failed to resend code";
      toast.error(errorOutput);
      return rejectWithValue(errorOutput);
    }
  }
);

export const forgotPasswordThunk = createAsyncThunk(
  "user/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/user/forgot-password", {
        email,
      });
      toast.success(response.data?.message || "Reset code sent to your email!");
      return response.data;
    } catch (error) {
      console.error(error);
      const errorOutput =
        error?.response?.data?.errMessage || "Failed to send reset code";
      toast.error(errorOutput);
      return rejectWithValue(errorOutput);
    }
  }
);

export const resetPasswordThunk = createAsyncThunk(
  "user/resetPassword",
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/user/reset-password", {
        email,
        otp,
        newPassword,
      });
      toast.success(response.data?.message || "Password reset successfully!");
      return response.data;
    } catch (error) {
      console.error(error);
      const errorOutput =
        error?.response?.data?.errMessage || "Password reset failed";
      toast.error(errorOutput);
      return rejectWithValue(errorOutput);
    }
  }
);

export const socialLoginThunk = createAsyncThunk(
  "user/socialLogin",
  async ({ provider, email, fullName, avatar }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/user/social-login", {
        provider,
        email,
        fullName,
        avatar,
      });
      toast.success(response.data?.message || "Signed in successfully!");
      return response.data;
    } catch (error) {
      console.error(error);
      const errorOutput =
        error?.response?.data?.errMessage || "Social sign-in failed";
      toast.error(errorOutput);
      return rejectWithValue(errorOutput);
    }
  }
);

export const registerUserThunk = createAsyncThunk(
  "user/signup",
  async ({ fullName, username, email, password, gender }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/user/register", {
        fullName,
        username,
        email,
        password,
        gender,
      });
      toast.success("Account created successfully!");
      return response.data;
    } catch (error) {
      console.error(error);
      const errorOutput = error?.response?.data?.errMessage || "Registration failed";
      toast.error(errorOutput);
      return rejectWithValue(errorOutput);
    }
  }
);

export const logoutUserThunk = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/user/logout");
      toast.success("Logout successfull!!");
      return response.data;
    } catch (error) {
      console.error(error);
      const errorOutput = error?.response?.data?.errMessage;
      toast.error(errorOutput);
      return rejectWithValue(errorOutput);
    }
  }
);

export const getUserProfileThunk = createAsyncThunk(
  "user/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/user/get-profile");
      return response.data;
    } catch (error) {
      console.error(error);
      const errorOutput = error?.response?.data?.errMessage;
      // toast.error(errorOutput);
      return rejectWithValue(errorOutput);
    }
  }
);

export const getOtherUsersThunk = createAsyncThunk(
  "user/getOtherUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/user/get-other-users");
      return response.data;
    } catch (error) {
      console.error(error);
      const errorOutput = error?.response?.data?.errMessage;
      // toast.error(errorOutput);
      return rejectWithValue(errorOutput);
    }
  }
);

export const updateProfileThunk = createAsyncThunk(
  "user/updateProfile",
  async ({ avatar, fullName, username, email }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put("/user/update-profile", {
        avatar,
        fullName,
        username,
        email,
      });
      toast.success(response.data?.message || "Profile updated successfully!");
      return response.data;
    } catch (error) {
      console.error(error);
      const errorOutput =
        error?.response?.data?.errMessage || "Failed to update profile";
      toast.error(errorOutput);
      return rejectWithValue(errorOutput);
    }
  }
);

export const deleteAccountThunk = createAsyncThunk(
  "user/deleteAccount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete("/user/delete-account");
      toast.success(response.data?.message || "Account permanently deleted!");
      return response.data;
    } catch (error) {
      console.error(error);
      const errorOutput =
        error?.response?.data?.errMessage || "Failed to delete account";
      toast.error(errorOutput);
      return rejectWithValue(errorOutput);
    }
  }
);

export const deleteOtherUserThunk = createAsyncThunk(
  "user/deleteOtherUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/user/delete-user/${userId}`);
      toast.success(response.data?.message || "Chat removed!");
      return { ...response.data, userId };
    } catch (error) {
      console.error(error);
      const errorOutput =
        error?.response?.data?.errMessage || "Failed to remove user";
      toast.error(errorOutput);
      return rejectWithValue(errorOutput);
    }
  }
);