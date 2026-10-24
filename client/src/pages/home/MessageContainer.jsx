import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMessageThunk, sendMessageThunk } from "../../store/slice/message/message.thunk";
import { setSelectedUser, updateUserLastMessage } from "../../store/slice/user/user.slice";
import { deleteOtherUserThunk } from "../../store/slice/user/user.thunk";
import Message from "./Message";
import SendMessage from "./SendMessage";
import {
  IoCall,
  IoVideocam,
  IoEllipsisHorizontal,
  IoArrowBack,
  IoLocationOutline,
  IoLogoSkype,
  IoLogoWhatsapp,
  IoLogoFacebook,
  IoClose,
  IoMic,
  IoMicOff,
  IoVideocamOff,
  IoImagesOutline,
  IoDownloadOutline,
  IoChatbubblesOutline,
} from "react-icons/io5";
import { MdCallEnd } from "react-icons/md";
import toast from "react-hot-toast";

const MessageContainer = () => {
  const dispatch = useDispatch();
  const { selectedUser, userProfile } = useSelector((state) => state.userReducer);
  const { messages } = useSelector((state) => state.messageReducer);
  const { onlineUsers } = useSelector((state) => state.socketReducer);

  const messagesEndRef = useRef(null);

  // Modals state
  const [activeCallModal, setActiveCallModal] = useState(null); // 'voice' | 'video' | null
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

  const isUserOnline = Boolean(
    selectedUser?._id && onlineUsers?.some((id) => String(id) === String(selectedUser._id))
  );

  useEffect(() => {
    if (selectedUser?._id) {
      dispatch(getMessageThunk({ recieverId: selectedUser._id }));
    }
  }, [selectedUser, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Call timer effect
  useEffect(() => {
    let timer;
    if (activeCallModal) {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeCallModal]);

  const handleBack = () => {
    dispatch(setSelectedUser(null));
  };

  const handleQuickReply = (text) => {
    // Quick send 'OK' or response
    if (!selectedUser?._id) return;
    dispatch(sendMessageThunk({ recieverId: selectedUser._id, message: text })).then(
      (actionResult) => {
        if (actionResult?.payload?.responseData) {
          dispatch(
            updateUserLastMessage({
              message: actionResult.payload.responseData,
              currentUserId: userProfile?._id,
              selectedUserId: selectedUser?._id,
            })
          );
        }
      }
    );
  };

  const formatCallTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? `0${secs}` : secs}`;
  };

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    if (!messages?.length) return [];
    const groups = [];
    let currentDate = null;
    messages.forEach((msg) => {
      const msgDate = msg.createdAt ? new Date(msg.createdAt).toDateString() : null;
      if (msgDate && msgDate !== currentDate) {
        currentDate = msgDate;
        const dateObj = new Date(msg.createdAt);
        const now = new Date();
        let label;
        if (dateObj.toDateString() === now.toDateString()) label = "Today";
        else {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          label =
            dateObj.toDateString() === yesterday.toDateString()
              ? "Yesterday"
              : dateObj.toLocaleDateString([], {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                });
        }
        groups.push({ type: "date", label });
      }
      groups.push({ type: "message", data: msg });
    });
    return groups;
  }, [messages]);

  // If no chat selected
  if (!selectedUser) {
    return (
      <div
        className="chat-center-column"
        style={{
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          textAlign: "center",
          padding: 32,
        }}
      >
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: "50%",
            background: "var(--pill-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            color: "var(--brand-purple)",
            marginBottom: 16,
          }}
        >
          <IoChatbubblesOutline />
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-dark)", marginBottom: 8 }}>
          Select a chat to start conversation
        </h3>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)", maxWidth: 360, lineHeight: 1.5 }}>
          Choose a contact from the list or start an instant meeting with your team.
        </p>
      </div>
    );
  }

  // Pre-fill user profile info or sensible fallbacks matching reference UI
  const displayAvatar =
    selectedUser?.avatar ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedUser?.username}`;
  const displayRole = selectedUser?.role || "Web Designer";
  const displayLocation = selectedUser?.location || "Pune, India";
  const displayPhone = selectedUser?.phone || "+91 9876543210";
  const displayEmail = selectedUser?.email || `${selectedUser?.username || "user"}@gmail.com`;
  const displayDob = selectedUser?.dob || "01.01.2000";

  return (
    <>
      {/* ── Center Chat Column ── */}
      <div className="chat-center-column">
        {/* Chat Top Header */}
        <div className="chat-top-header">
          <div className="chat-partner-info">
            {/* Mobile back button */}
            <button
              onClick={handleBack}
              className="chat-action-btn"
              style={{ marginRight: 2 }}
              title="Back"
            >
              <IoArrowBack style={{ fontSize: 20 }} />
            </button>

            <div className="partner-avatar-wrap">
              <img
                src={displayAvatar}
                alt={selectedUser.fullName}
                className="partner-avatar-img"
              />
            </div>
            <div className="partner-text-info">
              <div className="partner-name">{selectedUser.fullName}</div>
              <div className={`partner-status ${isUserOnline ? "online" : ""}`}>
                {isUserOnline ? "Online" : "Offline"}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="chat-header-actions">
            {/* Phone Call */}
            <button
              type="button"
              className="chat-action-btn"
              onClick={() => setActiveCallModal("voice")}
              title="Voice Call"
            >
              <IoCall />
            </button>

            {/* Video Call */}
            <button
              type="button"
              className="chat-action-btn"
              onClick={() => setActiveCallModal("video")}
              title="Video Call"
            >
              <IoVideocam />
            </button>

            {/* 3-dots Menu */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="chat-action-btn"
                onClick={() => setShowMenuDropdown((v) => !v)}
                title="Options"
              >
                <IoEllipsisHorizontal />
              </button>

              {showMenuDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: 6,
                    background: "#ffffff",
                    borderRadius: 14,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                    border: "1px solid var(--border-light)",
                    padding: "6px 0",
                    width: 170,
                    zIndex: 50,
                  }}
                  onClick={() => setShowMenuDropdown(false)}
                >
                  <button
                    className="dropdown-item"
                    style={{
                      width: "100%",
                      padding: "8px 16px",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      fontSize: 13,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "var(--text-dark)",
                    }}
                    onClick={() => setShowMediaGallery(true)}
                  >
                    View Media & Files
                  </button>
                  <button
                    className="dropdown-item"
                    style={{
                      width: "100%",
                      padding: "8px 16px",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      fontSize: 13,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "var(--text-dark)",
                    }}
                    onClick={() => toast.success("Notifications muted for this chat")}
                  >
                    Mute Notifications
                  </button>
                  <div style={{ height: 1, background: "var(--border-light)", margin: "4px 0" }} />
                  <button
                    className="dropdown-item"
                    style={{
                      width: "100%",
                      padding: "8px 16px",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      fontSize: 13,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#ef4444",
                    }}
                    onClick={async () => {
                      if (window.confirm(`Delete chat with ${selectedUser.fullName}?`)) {
                        await dispatch(deleteOtherUserThunk(selectedUser._id));
                        dispatch(setSelectedUser(null));
                        toast.success("Chat deleted");
                      }
                    }}
                  >
                    Delete Chat
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="chat-scroll-area">
          {groupedMessages.length > 0 ? (
            groupedMessages.map((item, idx) =>
              item.type === "date" ? (
                <div key={`d-${idx}`} className="chat-date-separator">
                  <span className="chat-date-pill">{item.label}</span>
                </div>
              ) : (
                <Message
                  key={item.data?._id || idx}
                  messageDetails={item.data}
                  onQuickReply={handleQuickReply}
                />
              )
            )
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                gap: 10,
              }}
            >
              <div
                style={{
                  background: "var(--pill-bg)",
                  padding: "10px 20px",
                  borderRadius: 20,
                  fontSize: 13.5,
                  fontWeight: 500,
                }}
              >
                Say hello to {selectedUser.fullName}! 👋
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <SendMessage />
      </div>

      {/* ── Column 3: Right Profile Panel ── */}
      <div className="profile-column">
        {/* User Card */}
        <div className="profile-avatar-card">
          <div className="profile-large-avatar-wrap">
            <img
              src={displayAvatar}
              alt={selectedUser.fullName}
              className="profile-large-avatar-img"
            />
          </div>
          <div className="profile-name-text">{selectedUser.fullName}</div>
          <div className="profile-role-text">{displayRole}</div>
          <div className="profile-location-text">
            <IoLocationOutline style={{ fontSize: 14, color: "#ef4444" }} />
            {displayLocation}
          </div>

          {/* Social icons */}
          <div className="profile-social-row">
            <button
              type="button"
              className="social-pill-btn social-skype"
              onClick={() => toast.success(`Connecting Skype call with ${selectedUser.fullName}...`)}
              title="Skype"
            >
              <IoLogoSkype />
            </button>
            <button
              type="button"
              className="social-pill-btn social-whatsapp"
              onClick={() => toast.success(`Opening WhatsApp chat with ${selectedUser.fullName}...`)}
              title="WhatsApp"
            >
              <IoLogoWhatsapp />
            </button>
            <button
              type="button"
              className="social-pill-btn social-fb"
              onClick={() => toast.success(`Opening Facebook profile of ${selectedUser.fullName}...`)}
              title="Facebook"
            >
              <IoLogoFacebook />
            </button>
          </div>
        </div>

        {/* Contact Details Section */}
        <div className="profile-details-block">
          <div className="detail-line">
            <span className="detail-label">Phone:</span>
            <span className="detail-value">{displayPhone}</span>
          </div>
          <div className="detail-line">
            <span className="detail-label">E-mail:</span>
            <span className="detail-value">{displayEmail}</span>
          </div>
          <div className="detail-line">
            <span className="detail-label">DOB:</span>
            <span className="detail-value">{displayDob}</span>
          </div>
        </div>

        {/* Media (28) Section */}
        <div className="profile-media-block">
          <div className="media-header-line">
            <span className="media-title">Media (28)</span>
            <button
              type="button"
              className="media-see-all-btn"
              onClick={() => setShowMediaGallery(true)}
            >
              See all &gt;
            </button>
          </div>
          <div className="media-thumbnails-grid">
            <div className="media-thumb-card" onClick={() => setShowMediaGallery(true)}>
              <img
                src="https://images.unsplash.com/photo-1542744094-3a31f272c490?w=300&auto=format&fit=crop&q=80"
                alt="Workspace"
                className="media-thumb-img"
              />
            </div>
            <div className="media-thumb-card" onClick={() => setShowMediaGallery(true)}>
              <img
                src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=300&auto=format&fit=crop&q=80"
                alt="Design sketch"
                className="media-thumb-img"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── VOICE / VIDEO CALL MODAL (Interactive) ── */}
      {activeCallModal && (
        <div className="purple-modal-backdrop" onClick={() => setActiveCallModal(null)}>
          <div
            className="purple-modal-card"
            style={{ maxWidth: 420, textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-purple">
              <span className="modal-title-text">
                {activeCallModal === "video" ? "Video Call" : "Voice Call"}
              </span>
              <button
                className="modal-close-icon"
                onClick={() => setActiveCallModal(null)}
              >
                <IoClose />
              </button>
            </div>

            <div className="modal-body-content" style={{ alignItems: "center", padding: "36px 24px" }}>
              <div className="call-avatar-pulse">
                <img
                  src={displayAvatar}
                  alt={selectedUser.fullName}
                  className="call-avatar-img"
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-dark)" }}>
                  {selectedUser.fullName}
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                  {activeCallModal === "video" ? "Video calling..." : "Connected..."} {formatCallTime(callDuration)}
                </p>
              </div>

              {/* Call Controls */}
              <div className="call-actions-row">
                {/* Mute button */}
                <button
                  type="button"
                  className="call-btn-circle call-btn-mute"
                  onClick={() => setIsMuted((v) => !v)}
                  title={isMuted ? "Unmute" : "Mute"}
                  style={{ background: isMuted ? "#ef4444" : "#6b7280" }}
                >
                  {isMuted ? <IoMicOff /> : <IoMic />}
                </button>

                {/* Video disable button */}
                {activeCallModal === "video" && (
                  <button
                    type="button"
                    className="call-btn-circle call-btn-video"
                    onClick={() => setIsVideoDisabled((v) => !v)}
                    title={isVideoDisabled ? "Enable Camera" : "Disable Camera"}
                    style={{ background: isVideoDisabled ? "#ef4444" : "var(--brand-accent)" }}
                  >
                    {isVideoDisabled ? <IoVideocamOff /> : <IoVideocam />}
                  </button>
                )}

                {/* End call button */}
                <button
                  type="button"
                  className="call-btn-circle call-btn-end"
                  onClick={() => {
                    setActiveCallModal(null);
                    toast.error("Call ended");
                  }}
                  title="End Call"
                >
                  <MdCallEnd />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MEDIA & FILES GALLERY MODAL ── */}
      {showMediaGallery && (
        <div className="purple-modal-backdrop" onClick={() => setShowMediaGallery(false)}>
          <div
            className="purple-modal-card"
            style={{ maxWidth: 640 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-purple">
              <span className="modal-title-text">
                Shared Media & Files ({selectedUser.fullName})
              </span>
              <button
                className="modal-close-icon"
                onClick={() => setShowMediaGallery(false)}
              >
                <IoClose />
              </button>
            </div>

            <div className="modal-body-content" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=400&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&auto=format&fit=crop&q=80",
                ].map((src, i) => (
                  <div
                    key={i}
                    style={{
                      height: 110,
                      borderRadius: 12,
                      overflow: "hidden",
                      position: "relative",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <img
                      src={src}
                      alt={`Media ${i}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <a
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        position: "absolute",
                        bottom: 6,
                        right: 6,
                        background: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        borderRadius: "50%",
                        width: 26,
                        height: 26,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                      }}
                      title="Download"
                    >
                      <IoDownloadOutline />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageContainer;
