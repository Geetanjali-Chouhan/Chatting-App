import React, { useState, useRef } from "react";
import {
  IoSend,
  IoHappyOutline,
  IoAttachOutline,
  IoMicOutline,
  IoCloseCircle,
  IoCheckmarkCircle,
} from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { sendMessageThunk } from "../../store/slice/message/message.thunk";
import { updateUserLastMessage } from "../../store/slice/user/user.slice";
import { encryptMessage } from "../../components/utitlities/crypto";
import toast from "react-hot-toast";

const QUICK_EMOJIS = ["😍", "😎", "😂", "🙏", "👍", "🤙", "❤️", "🔥"];

const SendMessage = () => {
  const dispatch = useDispatch();
  const { selectedUser, userProfile } = useSelector((state) => state.userReducer);
  const { buttonLoading } = useSelector((state) => state.messageReducer);
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);

  const handleSendMessage = async (textToSend) => {
    const rawText = (typeof textToSend === "string" ? textToSend : message).trim();
    if (!rawText || !selectedUser?._id) return;

    setMessage("");

    const cipherText = await encryptMessage(
      rawText,
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

    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessage((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  // Attachment upload simulation
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.success(`Attached "${file.name}"! Sending...`);
    handleSendMessage(`📎 ${file.name}`);
    e.target.value = "";
  };

  // Voice recording simulation
  const startRecording = () => {
    setIsRecording(true);
    setRecordSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);
  };

  const cancelRecording = () => {
    clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordSeconds(0);
    toast("Voice recording cancelled", { icon: "🛑" });
  };

  const sendVoiceNote = () => {
    clearInterval(timerRef.current);
    setIsRecording(false);
    const duration = recordSeconds || 1;
    setRecordSeconds(0);
    handleSendMessage(`🎤 Voice Message (${duration}s)`);
    toast.success("Voice note sent!");
  };

  return (
    <div className="chat-bottom-input-wrap">
      {/* Quick Emoji Reaction Pill Bar (matching reference UI) */}
      <div className="quick-emoji-bar">
        {QUICK_EMOJIS.map((emoji, index) => (
          <button
            key={index}
            type="button"
            className="quick-emoji-btn"
            onClick={() => handleEmojiClick(emoji)}
            title={`React ${emoji}`}
          >
            {emoji}
          </button>
        ))}
        <button
          type="button"
          className="quick-emoji-btn"
          style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 700 }}
          onClick={() => setShowEmojiPicker((v) => !v)}
          title="More emojis"
        >
          •••
        </button>
      </div>

      {/* Hidden file input for paperclip */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Input Pill Bar */}
      {isRecording ? (
        /* Voice Recording Active Bar */
        <div
          className="chat-input-pill"
          style={{ background: "#fef2f2", borderColor: "#fecaca" }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#ef4444",
              animation: "pulseRing 1s infinite",
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#b91c1c", flex: 1 }}>
            Recording voice note... 0:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds}
          </span>
          <button
            type="button"
            className="input-icon-btn"
            onClick={cancelRecording}
            title="Cancel"
            style={{ color: "#ef4444" }}
          >
            <IoCloseCircle style={{ fontSize: 22 }} />
          </button>
          <button
            type="button"
            className="chat-send-btn"
            onClick={sendVoiceNote}
            title="Send voice note"
            style={{ background: "#22c55e" }}
          >
            <IoCheckmarkCircle style={{ fontSize: 22 }} />
          </button>
        </div>
      ) : (
        /* Normal Text Input Pill */
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="chat-input-pill"
        >
          {/* Smiley emoji icon */}
          <button
            type="button"
            className="input-icon-btn"
            onClick={() => handleEmojiClick("😊")}
            title="Add emoji"
          >
            <IoHappyOutline style={{ fontSize: 21 }} />
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            className="chat-actual-input"
            placeholder="Type a message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />

          {/* Attachment Paperclip */}
          <button
            type="button"
            className="input-icon-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file or photo"
          >
            <IoAttachOutline style={{ fontSize: 22 }} />
          </button>

          {/* Microphone Icon */}
          <button
            type="button"
            className="input-icon-btn"
            onClick={startRecording}
            title="Record voice message"
          >
            <IoMicOutline style={{ fontSize: 21 }} />
          </button>

          {/* Circular Purple Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || buttonLoading}
            className="chat-send-btn"
            title="Send"
          >
            <IoSend style={{ fontSize: 16, transform: "translateX(1px)" }} />
          </button>
        </form>
      )}
    </div>
  );
};

export default SendMessage;