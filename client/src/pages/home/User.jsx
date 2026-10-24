import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../../store/slice/user/user.slice";
import { deleteOtherUserThunk } from "../../store/slice/user/user.thunk";
import { IoCheckmarkSharp, IoCheckmarkDoneSharp } from "react-icons/io5";
import { decryptMessage, isEncryptedMessage } from "../../components/utitlities/crypto";

const User = ({ userDetails, isHeader = false }) => {
  const dispatch = useDispatch();
  const { selectedUser, userProfile } = useSelector((state) => state.userReducer);
  const { onlineUsers } = useSelector((state) => state.socketReducer);

  const isUserOnline = Boolean(
    userDetails?._id && onlineUsers?.some((id) => String(id) === String(userDetails._id))
  );
  const isSelected = userDetails?._id === selectedUser?._id;

  const handleUserClick = () => {
    if (!isHeader) dispatch(setSelectedUser(userDetails));
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      const now = new Date();
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
      return date.toLocaleDateString([], { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };

  const lastMsg = userDetails?.lastMessage;
  const isLastMsgMe =
    lastMsg &&
    (lastMsg.senderId === userProfile?._id || lastMsg.senderId?._id === userProfile?._id);

  const [decryptedLastMessage, setDecryptedLastMessage] = useState(() => {
    if (isEncryptedMessage(lastMsg?.message)) return "🔒 Encrypted";
    return lastMsg?.message || "";
  });

  useEffect(() => {
    let mounted = true;
    const decrypt = async () => {
      if (!lastMsg?.message) {
        setDecryptedLastMessage("");
        return;
      }
      const text = await decryptMessage(lastMsg.message, userProfile?._id, userDetails?._id);
      if (mounted) setDecryptedLastMessage(text);
    };
    decrypt();
    return () => {
      mounted = false;
    };
  }, [lastMsg?.message, userDetails?._id, userProfile?._id]);

  /* ── Header mode ── */
  if (isHeader) {
    return (
      <div className="chat-partner-info">
        <div className="partner-avatar-wrap">
          <img
            src={
              userDetails?.avatar ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${userDetails?.username}`
            }
            alt={userDetails?.fullName}
            className="partner-avatar-img"
          />
        </div>
        <div className="partner-text-info">
          <div className="partner-name">{userDetails?.fullName}</div>
          <div className={`partner-status ${isUserOnline ? "online" : ""}`}>
            {isUserOnline ? "Online" : "Offline"}
          </div>
        </div>
      </div>
    );
  }

  /* ── Chat list item ── */
  return (
    <div
      className={`contact-item-card ${isSelected ? "active" : ""}`}
      onClick={handleUserClick}
    >
      {/* Avatar with status indicator */}
      <div className="contact-avatar-wrapper">
        <img
          src={
            userDetails?.avatar ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${userDetails?.username}`
          }
          alt={userDetails?.fullName}
          className="contact-avatar-img"
        />
        <span className={`contact-status-dot ${isUserOnline ? "online" : ""}`} />
      </div>

      {/* Info col */}
      <div className="contact-info-col">
        <div className="contact-top-line">
          <span className="contact-name-text">{userDetails?.fullName}</span>
          <span className="contact-time-text">
            {formatTime(lastMsg?.createdAt || userDetails?.updatedAt)}
          </span>
        </div>

        <div className={`contact-status-text ${isUserOnline ? "online" : ""}`}>
          {isUserOnline ? "Online" : "Offline"}
        </div>

        <div className="contact-msg-row">
          <div className="contact-last-msg">
            {isLastMsgMe && <span style={{ opacity: 0.7, marginRight: 4 }}>You: </span>}
            {decryptedLastMessage || "No messages yet"}
          </div>
          {(userDetails?.unreadCount || 0) > 0 && (
            <span className="contact-unread-badge">
              {userDetails.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default User;