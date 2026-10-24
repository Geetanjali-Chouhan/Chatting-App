import { createSlice } from "@reduxjs/toolkit";
import io from "socket.io-client";

// Store socket OUTSIDE Redux state to avoid Immer proxy breaking it
let _socket = null;

export const getSocket = () => _socket;

const initialState = {
  isConnected: false,
  onlineUsers: [],
};

export const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    initializeSocket: (state, action) => {
      // Disconnect any existing socket
      if (_socket) {
        try {
          _socket.disconnect();
        } catch (e) {
          console.error("Error disconnecting previous socket:", e);
        }
      }
      _socket = io(import.meta.env.VITE_DB_ORIGIN, {
        query: {
          userId: action.payload,
        },
      });
      state.isConnected = true;
    },

    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload || [];
    },

    closeSocket: (state) => {
      if (_socket) {
        try {
          _socket.disconnect();
        } catch (e) {
          console.error("Error closing socket:", e);
        }
      }
      _socket = null;
      state.isConnected = false;
      state.onlineUsers = [];
    },
  },
});

export const { initializeSocket, setOnlineUsers, closeSocket } = socketSlice.actions;

export default socketSlice.reducer;