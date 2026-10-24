import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { IoCheckmarkSharp, IoCheckmarkDoneSharp } from "react-icons/io5";
import { decryptMessage, isEncryptedMessage } from "../../components/utitlities/crypto";

const Message = ({ messageDetails, onQuickReply }) => {
  const messageRef = useRef(null);
  const { userProfile, selectedUser } = useSelector((state) => state.userReducer);
  const { onlineUsers } = useSelector((state) => state.socketReducer);

  const isMe =
    String(userProfile?._id) ===
    String(messageDetails?.senderId?._id || messageDetails?.senderId);
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
  }, [
    messageDetails?.message,
    messageDetails?.senderId,
    messageDetails?.receiverId,
    isMe,
    userProfile?._id,
  ]);

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messageDetails, displayText]);

  const formattedTime = (() => {
    if (!messageDetails?.createdAt) return "";
    try {
      const date = new Date(messageDetails.createdAt);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  })();

  const senderAvatar = isMe
    ? userProfile?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile?.username}`
    : selectedUser?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedUser?.username}`;

  const senderName = isMe ? "You" : selectedUser?.fullName || "Friend";

  const TickIcon = () => {
    if (!isMe) return null;
    if (messageDetails?.seen) {
      return (
        <IoCheckmarkDoneSharp
          style={{ fontSize: 14, color: "#60a5fa" }}
          title="Seen"
        />
      );
    }
    if (isReceiverOnline) {
      return (
        <IoCheckmarkDoneSharp
          style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}
          title="Delivered"
        />
      );
    }
    return (
      <IoCheckmarkSharp
        style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}
        title="Sent"
      />
    );
  };

  return (
    <div ref={messageRef} style={{ width: "100%" }}>
      {isMe ? (
        /* Sent Message (Outgoing) */
        <div className="msg-row-sent">
          <div className="msg-sent-body">
            <div className="msg-sent-meta">
              <span className="msg-timestamp">{formattedTime}</span>
              <span className="msg-sent-title">{senderName}</span>
              <TickIcon />
            </div>
            <div className="msg-bubble-sent">
              {displayText}
            </div>
            {/* Quick action button like 'OK' in reference UI */}
            {onQuickReply && (
              <button
                type="button"
                className="msg-quick-chip"
                onClick={() => onQuickReply("OK")}
              >
                OK
              </button>
            )}
          </div>
          <img
            src={senderAvatar}
            alt={senderName}
            className="msg-sender-avatar"
          />
        </div>
      ) : (
        /* Received Message (Incoming) */
        <div className="msg-row-received">
          <img
            src={senderAvatar}
            alt={senderName}
            className="msg-sender-avatar"
          />
          <div className="msg-received-body">
            <div className="msg-sender-meta">
              <span className="msg-sender-title">{senderName}</span>
              <span className="msg-timestamp">{formattedTime}</span>
            </div>
            <div className="msg-bubble-received">
              {displayText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
