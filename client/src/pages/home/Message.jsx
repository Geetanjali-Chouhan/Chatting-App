import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { IoCheckmarkSharp, IoCheckmarkDoneSharp, IoLockClosed } from "react-icons/io5";
import { decryptMessage, isEncryptedMessage } from "../../components/utitlities/crypto";

const Message = ({ messageDetails }) => {
  const messageRef = useRef(null);
  const { userProfile, selectedUser } = useSelector(
    (state) => state.userReducer
  );
  const { onlineUsers } = useSelector((state) => state.socketReducer);

  const isMe = String(userProfile?._id) === String(messageDetails?.senderId?._id || messageDetails?.senderId);
  const isReceiverOnline = Boolean(
    selectedUser?._id &&
      onlineUsers?.some((id) => String(id) === String(selectedUser._id))
  );
  const isEncrypted = isEncryptedMessage(messageDetails?.message);

  const [displayText, setDisplayText] = useState(() => {
    if (isEncrypted) return "🔒 Decrypting...";
    return messageDetails?.message || "";
  });

  useEffect(() => {
    let isMounted = true;
    const runDecryption = async () => {
      if (!messageDetails?.message) return;
      const otherId = isMe ? messageDetails?.receiverId : messageDetails?.senderId;
      const text = await decryptMessage(
        messageDetails.message,
        userProfile?._id,
        otherId
      );
      if (isMounted) {
        setDisplayText(text);
      }
    };
    runDecryption();
    return () => {
      isMounted = false;
    };
  }, [messageDetails?.message, messageDetails?.senderId, messageDetails?.receiverId, isMe, userProfile?._id]);

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messageDetails, displayText]);

  // Format timestamp safely
  const formattedTime = (() => {
    if (!messageDetails?.createdAt) return "";
    try {
      const date = new Date(messageDetails.createdAt);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  })();

  return (
    <div
      ref={messageRef}
      className={`flex items-end gap-2 my-0.5 transition-all duration-200 ${
        isMe ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Message bubble - Telegram style: green for sent, white for received */}
      <div className={`flex flex-col max-w-[75%] sm:max-w-[65%] ${isMe ? "items-end" : "items-start"}`}>
        <div
          className={`px-3.5 py-2 text-sm leading-relaxed break-words relative ${
            isMe
              ? "bg-[#EFFDDE] text-slate-800 rounded-2xl rounded-br-sm shadow-sm"
              : "bg-white text-slate-800 rounded-2xl rounded-bl-sm shadow-sm"
          }`}
          style={{
            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          }}
        >
          <div className="pr-1">{displayText}</div>

          <div
            className={`flex items-center gap-1 justify-end mt-0.5 -mb-0.5 text-[10px] select-none ${
              isMe ? "text-green-700/70" : "text-slate-400"
            }`}
          >
            <span>{formattedTime}</span>

            {/* Telegram Tick Marks for Sent Messages */}
            {isMe && (
              <span className="flex items-center text-sm ml-0.5">
                {messageDetails?.seen ? (
                  <IoCheckmarkDoneSharp
                    className="text-green-600 transition-all duration-300"
                    title="Seen (Read)"
                  />
                ) : isReceiverOnline ? (
                  <IoCheckmarkDoneSharp
                    className="text-slate-400 transition-all duration-300"
                    title="Delivered"
                  />
                ) : (
                  <IoCheckmarkSharp
                    className="text-slate-400 transition-all duration-300"
                    title="Sent"
                  />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
