import React, { useState } from "react";
import { IoSend } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { sendMessageThunk } from "../../store/slice/message/message.thunk";
import { updateUserLastMessage } from "../../store/slice/user/user.slice";
import { encryptMessage } from "../../components/utitlities/crypto";

const SendMessage = () => {
  const dispatch = useDispatch();
  const { selectedUser, userProfile } = useSelector((state) => state.userReducer);
  const { buttonLoading } = useSelector((state) => state.messageReducer);
  const [message, setMessage] = useState("");

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim() || !selectedUser?._id) return;

    const currentMsg = message.trim();
    setMessage("");

    // Encrypt message with AES-GCM 256 before transmission (WhatsApp E2EE)
    const cipherText = await encryptMessage(
      currentMsg,
      userProfile?._id,
      selectedUser?._id
    );

    const actionResult = await dispatch(
      sendMessageThunk({
        recieverId: selectedUser?._id,
        message: cipherText,
      })
    );

    if (actionResult?.payload?.responseData) {
      dispatch(
        updateUserLastMessage({
          message: actionResult.payload.responseData,
          currentUserId: userProfile?._id,
          selectedUserId: selectedUser?._id,
        })
      );
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xl border-t border-white/10">
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 max-w-5xl mx-auto"
      >
        <div className="glass-input flex-1 rounded-2xl px-4 py-3 flex items-center">
          <input
            type="text"
            placeholder={`Message ${selectedUser?.fullName ? `@${selectedUser.fullName}` : "..."}`}
            className="w-full bg-transparent outline-none text-sm text-white placeholder-slate-400"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={!message.trim() || buttonLoading}
          className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          title="Send message"
        >
          <IoSend className="text-lg translate-x-0.5" />
        </button>
      </form>
    </div>
  );
};

export default SendMessage;