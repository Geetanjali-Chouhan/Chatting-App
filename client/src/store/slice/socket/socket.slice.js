import { createSlice } from "@reduxjs/toolkit";
import io from "socket.io-client";

const initialState = {
  socket: null,
  onlineUsers: [],
};

export const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    initializeSocket: (state, action) => {
      if (state.socket) {
        try {
          state.socket.disconnect();
        } catch (e) {
          console.error("Error disconnecting previous socket:", e);
        }
      }
      const socket = io(import.meta.env.VITE_DB_ORIGIN, {
        query: {
          userId: action.payload,
        },
      });
      state.socket = socket;
    },

    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload || [];
    },

    closeSocket: (state) => {
      if (state.socket) {
        try {
          state.socket.disconnect();
        } catch (e) {
          console.error("Error closing socket:", e);
        }
      }
      state.socket = null;
      state.onlineUsers = [];
    },
  },
});

export const { initializeSocket, setOnlineUsers, closeSocket } = socketSlice.actions;

export default socketSlice.reducer;