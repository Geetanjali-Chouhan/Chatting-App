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

  const avatarUrl = isMe
    ? userProfile?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile?.username}`
    : selectedUser?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedUser?.username}`;

  return (
    <div
      ref={messageRef}
      className={`flex items-end gap-2.5 my-1.5 transition-all duration-200 ${
        isMe ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/10 bg-slate-800">
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Message bubble + time */}
      <div className={`flex flex-col max-w-[75%] sm:max-w-[65%] ${isMe ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed break-words transition-all duration-200 relative ${
            isMe
              ? "bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white rounded-2xl rounded-br-xs shadow-md shadow-indigo-900/30"
              : "bg-slate-800/90 text-slate-100 border border-white/5 rounded-2xl rounded-bl-xs shadow-md shadow-black/20"
          }`}
        >
          <div className="pr-1">{displayText}</div>

          <div
            className={`flex items-center gap-1 justify-end mt-1 -mb-0.5 text-[10px] select-none ${
              isMe ? "text-indigo-200/90" : "text-slate-400"
            }`}
          >
            <span>{formattedTime}</span>

            {/* WhatsApp Tick Marks for Sent Messages */}
            {isMe && (
              <span className="flex items-center text-sm ml-0.5">
                {messageDetails?.seen ? (
                  <IoCheckmarkDoneSharp
                    className="text-sky-400 filter drop-shadow-[0_0_2px_rgba(56,189,248,0.5)] transition-all duration-300"
                    title="Seen (Read)"
                  />
                ) : isReceiverOnline ? (
                  <IoCheckmarkDoneSharp
                    className="text-slate-300/80 transition-all duration-300"
                    title="Delivered"
                  />
                ) : (
                  <IoCheckmarkSharp
                    className="text-slate-300/80 transition-all duration-300"
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
