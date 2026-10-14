import { createSlice } from "@reduxjs/toolkit";
import { getMessageThunk, sendMessageThunk } from "./message.thunk";

const initialState = {
  buttonLoading: false,
  screenLoading: false,
  messages: null,
};

export const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setNewMessage: (state, action) => {
      const oldMessages = state.messages ?? [];
      state.messages = [...oldMessages, action.payload];
    },
    markAllSeenForUser: (state, action) => {
      const { readerId } = action.payload;
      if (state.messages && Array.isArray(state.messages)) {
        state.messages = state.messages.map((msg) => {
          const recId =
            typeof msg.receiverId === "object"
              ? msg.receiverId?._id
              : msg.receiverId;
          if (recId?.toString() === readerId?.toString()) {
            return { ...msg, seen: true, seenAt: new Date().toISOString() };
          }
          return msg;
        });
      }
    },
  },
  extraReducers: (builder) => {
    // send message
    builder.addCase(sendMessageThunk.pending, (state, action) => {
      state.buttonLoading = true;
    });
    builder.addCase(sendMessageThunk.fulfilled, (state, action) => {
      const oldMessages = state.messages ?? [];
      state.messages = [...oldMessages, action.payload?.responseData];
      state.buttonLoading = false;
    });
    builder.addCase(sendMessageThunk.rejected, (state, action) => {
      state.buttonLoading = false;
    });

    // get messages
    builder.addCase(getMessageThunk.pending, (state, action) => {
      state.buttonLoading = true;
    });
    builder.addCase(getMessageThunk.fulfilled, (state, action) => {
      state.messages = action.payload?.responseData?.messages;
      state.buttonLoading = false;
    });
    builder.addCase(getMessageThunk.rejected, (state, action) => {
      state.buttonLoading = false;
    });
  },
});

export const { setNewMessage, markAllSeenForUser } = messageSlice.actions;

export default messageSlice.reducer;