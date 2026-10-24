import { createSlice } from "@reduxjs/toolkit";
import {
  getOtherUsersThunk,
  getUserProfileThunk,
  loginUserThunk,
  logoutUserThunk,
  registerUserThunk,
  updateProfileThunk,
  verifyOtpThunk,
  // resendOtpThunk,
  // forgotPasswordThunk,
  resetPasswordThunk,
  socialLoginThunk,
  deleteAccountThunk,
  deleteOtherUserThunk,
} from "./user.thunk";

const initialState = {
  isAuthenticated: false,
  userProfile: null,
  otherUsers: null,
  selectedUser: JSON.parse(localStorage.getItem("selectedUser")),
  buttonLoading: false,
  screenLoading: false,
  isAuthChecked: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      localStorage.setItem("selectedUser", JSON.stringify(action.payload));
      state.selectedUser = action.payload;
      if (action.payload?._id && state.otherUsers) {
        state.otherUsers = state.otherUsers.map((user) => {
          if (user._id?.toString() === action.payload._id?.toString()) {
            return { ...user, unreadCount: 0 };
          }
          return user;
        });
      }
    },
    updateUserLastMessage: (state, action) => {
      const { message, currentUserId, selectedUserId } = action.payload;
      if (!state.otherUsers || !Array.isArray(state.otherUsers)) return;

      const senderIdStr = String(message.senderId?._id || message.senderId || "");
      const receiverIdStr = String(message.receiverId?._id || message.receiverId || "");
      const currentUserIdStr = String(currentUserId?._id || currentUserId || "");
      const otherUserIdStr =
        senderIdStr === currentUserIdStr ? receiverIdStr : senderIdStr;

      let targetUser = null;
      const remainingUsers = [];

      for (const user of state.otherUsers) {
        if (String(user._id) === otherUserIdStr) {
          const isIncoming = senderIdStr !== currentUserIdStr;
          const isNotCurrentlyOpen =
            String(selectedUserId || "") !== otherUserIdStr;
          targetUser = {
            ...user,
            lastMessage: message,
            unreadCount:
              isIncoming && isNotCurrentlyOpen
                ? (user.unreadCount || 0) + 1
                : isIncoming
                ? 0
                : user.unreadCount,
          };
        } else {
          remainingUsers.push(user);
        }
      }

      if (targetUser) {
        // Move the user with the most recent message/notification directly to the top!
        state.otherUsers = [targetUser, ...remainingUsers];
      }
    },
    resetUserUnreadCount: (state, action) => {
      const userId = action.payload;
      if (!state.otherUsers || !Array.isArray(state.otherUsers)) return;
      state.otherUsers = state.otherUsers.map((user) => {
        if (user._id?.toString() === userId?.toString()) {
          return { ...user, unreadCount: 0 };
        }
        return user;
      });
    },
    markSidebarLastMessageSeen: (state, action) => {
      const { readerId } = action.payload;
      if (!state.otherUsers || !Array.isArray(state.otherUsers)) return;
      state.otherUsers = state.otherUsers.map((user) => {
        if (
          user._id?.toString() === readerId?.toString() &&
          user.lastMessage
        ) {
          return {
            ...user,
            lastMessage: {
              ...user.lastMessage,
              seen: true,
            },
          };
        }
        return user;
      });
    },
  },
  extraReducers: (builder) => {
    // login user
    builder.addCase(loginUserThunk.pending, (state) => {
      state.buttonLoading = true;
    });
    builder.addCase(loginUserThunk.fulfilled, (state, action) => {
      state.buttonLoading = false;
      // If direct login without OTP (e.g. fallback)
      if (!action.payload?.requireOtp && action.payload?.responseData?.user) {
        state.userProfile = action.payload.responseData.user;
        state.isAuthenticated = true;
        state.screenLoading = false;
        state.isAuthChecked = true;
      }
    });
    builder.addCase(loginUserThunk.rejected, (state) => {
      state.buttonLoading = false;
    });

    // verify OTP
    builder.addCase(verifyOtpThunk.pending, (state) => {
      state.buttonLoading = true;
    });
    builder.addCase(verifyOtpThunk.fulfilled, (state, action) => {
      state.userProfile = action.payload?.responseData?.user;
      state.isAuthenticated = true;
      state.buttonLoading = false;
      state.screenLoading = false;
      state.isAuthChecked = true;
    });
    builder.addCase(verifyOtpThunk.rejected, (state) => {
      state.buttonLoading = false;
    });

    // reset password
    builder.addCase(resetPasswordThunk.pending, (state) => {
      state.buttonLoading = true;
    });
    builder.addCase(resetPasswordThunk.fulfilled, (state, action) => {
      state.userProfile = action.payload?.responseData?.user;
      state.isAuthenticated = true;
      state.buttonLoading = false;
      state.screenLoading = false;
      state.isAuthChecked = true;
    });
    builder.addCase(resetPasswordThunk.rejected, (state) => {
      state.buttonLoading = false;
    });

    // social login
    builder.addCase(socialLoginThunk.pending, (state) => {
      state.buttonLoading = true;
    });
    builder.addCase(socialLoginThunk.fulfilled, (state, action) => {
      state.userProfile = action.payload?.responseData?.user;
      state.isAuthenticated = true;
      state.buttonLoading = false;
      state.screenLoading = false;
      state.isAuthChecked = true;
    });
    builder.addCase(socialLoginThunk.rejected, (state) => {
      state.buttonLoading = false;
    });

    // register user
    builder.addCase(registerUserThunk.pending, (state) => {
      state.buttonLoading = true;
    });
    builder.addCase(registerUserThunk.fulfilled, (state, action) => {
      state.userProfile = action.payload?.responseData?.user;
      state.isAuthenticated = true;
      state.buttonLoading = false;
      state.screenLoading = false;
      state.isAuthChecked = true;
    });
    builder.addCase(registerUserThunk.rejected, (state) => {
      state.buttonLoading = false;
    });

    // logout user
    builder.addCase(logoutUserThunk.pending, (state) => {
      state.buttonLoading = true;
    });
    builder.addCase(logoutUserThunk.fulfilled, (state) => {
      state.userProfile = null;
      state.selectedUser = null;
      state.otherUsers = null;
      state.isAuthenticated = false;
      state.buttonLoading = false;
      state.screenLoading = false;
      state.isAuthChecked = true;
      localStorage.clear();
    });
    builder.addCase(logoutUserThunk.rejected, (state) => {
      state.buttonLoading = false;
    });

    // get user profile
    builder.addCase(getUserProfileThunk.pending, (state) => {
      // Don't block screen with full loading blocker
      state.buttonLoading = false;
    });
    builder.addCase(getUserProfileThunk.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.screenLoading = false;
      state.isAuthChecked = true;
      state.userProfile = action.payload?.responseData;
    });
    builder.addCase(getUserProfileThunk.rejected, (state) => {
      state.isAuthenticated = false;
      state.screenLoading = false;
      state.isAuthChecked = true;
    });

    // get other users
    builder.addCase(getOtherUsersThunk.pending, (state) => {
      state.screenLoading = false;
    });
    builder.addCase(getOtherUsersThunk.fulfilled, (state, action) => {
      state.screenLoading = false;
      const users = action.payload?.responseData || [];
      state.otherUsers = [...users].sort((a, b) => {
        const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
        if (timeB !== timeA) return timeB - timeA;
        return (b.unreadCount || 0) - (a.unreadCount || 0);
      });
    });
    builder.addCase(getOtherUsersThunk.rejected, (state) => {
      state.screenLoading = false;
    });

    // update profile
    builder.addCase(updateProfileThunk.pending, (state) => {
      state.buttonLoading = true;
    });
    builder.addCase(updateProfileThunk.fulfilled, (state, action) => {
      state.buttonLoading = false;
      const updatedUser = action.payload?.responseData;
      if (updatedUser) {
        state.userProfile = updatedUser;
        if (state.otherUsers && Array.isArray(state.otherUsers)) {
          state.otherUsers = state.otherUsers.map((u) =>
            u._id === updatedUser._id ? { ...u, ...updatedUser } : u
          );
        }
      }
    });
    builder.addCase(updateProfileThunk.rejected, (state) => {
      state.buttonLoading = false;
    });

    // delete account
    builder.addCase(deleteAccountThunk.pending, (state) => {
      state.buttonLoading = true;
    });
    builder.addCase(deleteAccountThunk.fulfilled, (state) => {
      state.userProfile = null;
      state.selectedUser = null;
      state.otherUsers = null;
      state.isAuthenticated = false;
      state.buttonLoading = false;
      state.screenLoading = false;
      state.isAuthChecked = true;
      localStorage.clear();
    });
    builder.addCase(deleteAccountThunk.rejected, (state) => {
      state.buttonLoading = false;
    });

    // delete other user / chat
    builder.addCase(deleteOtherUserThunk.fulfilled, (state, action) => {
      const deletedId = action.payload?.userId;
      if (deletedId && state.otherUsers && Array.isArray(state.otherUsers)) {
        state.otherUsers = state.otherUsers.filter(
          (u) => String(u._id) !== String(deletedId)
        );
      }
      if (state.selectedUser && String(state.selectedUser._id) === String(deletedId)) {
        state.selectedUser = null;
        localStorage.removeItem("selectedUser");
      }
    });
  },
});

export const {
  setSelectedUser,
  updateUserLastMessage,
  resetUserUnreadCount,
  markSidebarLastMessageSeen,
} = userSlice.actions;

export default userSlice.reducer;