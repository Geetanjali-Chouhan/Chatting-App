import React, { useEffect, useState, useRef } from "react";
import UserSidebar from "./UserSidebar";
import MessageContainer from "./MessageContainer";
import ProfileModal from "./ProfileModal";
import { useDispatch, useSelector } from "react-redux";
import {
  initializeSocket,
  setOnlineUsers,
  getSocket,
  closeSocket,
} from "../../store/slice/socket/socket.slice";
import {
  setNewMessage,
  markAllSeenForUser,
} from "../../store/slice/message/message.slice";
import {
  updateUserLastMessage,
  resetUserUnreadCount,
  markSidebarLastMessageSeen,
  setSelectedUser,
} from "../../store/slice/user/user.slice";
import { logoutUserThunk } from "../../store/slice/user/user.thunk";
import {
  IoHomeOutline,
  IoPeopleOutline,
  IoChatbubbleEllipses,
  IoDocumentTextOutline,
  IoVideocamOutline,
  IoNotificationsOutline,
  IoSettingsOutline,
  IoSearch,
  IoClose,
  IoLogOutOutline,
  IoDownloadOutline,
} from "react-icons/io5";
import toast from "react-hot-toast";

const Home = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, userProfile, selectedUser } = useSelector(
    (state) => state.userReducer
  );
  const { isConnected } = useSelector((state) => state.socketReducer);

  // Navigation and search states
  const [activeTab, setActiveTab] = useState("chat");
  const [globalSearch, setGlobalSearch] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Sayali Sontakke sent you a message", time: "10m ago", read: false },
    { id: 2, text: "UI/UX Designing group scheduled a meeting", time: "1h ago", read: false },
    { id: 3, text: "Rohit Agarwal joined GupShup", time: "3h ago", read: true },
  ]);

  const selectedUserRef = useRef(selectedUser);
  const userProfileRef = useRef(userProfile);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    userProfileRef.current = userProfile;
  }, [userProfile]);

  useEffect(() => {
    if (!isAuthenticated || !userProfile?._id) return;
    dispatch(initializeSocket(userProfile._id));
  }, [isAuthenticated, userProfile?._id, dispatch]);

  useEffect(() => {
    const socket = getSocket();
    if (selectedUser?._id && socket) {
      socket.emit("markMessagesSeen", { senderId: selectedUser._id });
      dispatch(resetUserUnreadCount(selectedUser._id));
    }
  }, [selectedUser, isConnected, dispatch]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("getOnlineUsers");
    const handleConnect = () => {
      socket.emit("getOnlineUsers");
    };
    socket.on("connect", handleConnect);
    socket.on("onlineUsers", (onlineUsers) => {
      dispatch(setOnlineUsers(onlineUsers));
    });

    socket.on("newMessage", (newMessage) => {
      const currentSelected = selectedUserRef.current;
      const currentProfile = userProfileRef.current;
      const isCurrentChat =
        currentSelected?._id?.toString() === newMessage.senderId?.toString();

      if (isCurrentChat) {
        dispatch(setNewMessage(newMessage));
        socket.emit("markMessagesSeen", { senderId: newMessage.senderId });
      } else {
        // Add notification
        setNotifications((prev) => [
          {
            id: Date.now(),
            text: `New message received`,
            time: "Just now",
            read: false,
          },
          ...prev,
        ]);
      }

      dispatch(
        updateUserLastMessage({
          message: newMessage,
          currentUserId: currentProfile?._id,
          selectedUserId: currentSelected?._id,
        })
      );
    });

    socket.on("messagesSeen", ({ readerId }) => {
      dispatch(markAllSeenForUser({ readerId }));
      dispatch(markSidebarLastMessageSeen({ readerId }));
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("onlineUsers");
      socket.off("newMessage");
      socket.off("messagesSeen");
    };
  }, [isConnected, dispatch]);

  const handleLogout = async () => {
    dispatch(closeSocket());
    await dispatch(logoutUserThunk());
    toast.success("Logged out successfully");
  };

  const loggedInName = userProfile?.fullName || "Dipak Palve";
  const loggedInAvatar =
    userProfile?.avatar ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile?.username || "dipak"}`;

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="purple-app-viewport">
      <div className="dashboard-window">
        {/* ── Top Header Bar ── */}
        <header className="top-header-bar">
          {/* Logo Area */}
          <div className="header-logo-area">
            <span className="header-logo-text">LOGO</span>
          </div>

          {/* Center Search Pill */}
          <div className="header-search-container">
            <IoSearch className="header-search-icon" />
            <input
              type="text"
              className="header-search-input"
              placeholder="Search User, Events and more..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
            {globalSearch && (
              <button
                type="button"
                className="header-search-clear"
                onClick={() => setGlobalSearch("")}
              >
                <IoClose />
              </button>
            )}
          </div>

          {/* Current User Profile in Top Right */}
          <div
            className="header-user-profile"
            onClick={() => setIsProfileOpen(true)}
            title="Open Profile Settings"
          >
            <div className="header-user-info">
              <span className="header-user-name">{loggedInName}</span>
              <span className="header-user-status">Online</span>
            </div>
            <div className="header-avatar-wrap">
              <img
                src={loggedInAvatar}
                alt={loggedInName}
                className="header-avatar-img"
              />
            </div>
          </div>
        </header>

        {/* ── Main Dashboard Body (Left Rail + 3-Panel Card) ── */}
        <div
          className={`dashboard-main-body ${
            selectedUser ? "mobile-hide-contacts" : "mobile-show-contacts"
          }`}
        >
          {/* Left Navigation Rail */}
          <aside className="left-nav-rail">
            <div className="nav-rail-icons">
              {/* Home */}
              <div
                className={`rail-btn-wrapper ${activeTab === "home" ? "active" : ""}`}
              >
                <button
                  type="button"
                  className="rail-icon-btn"
                  onClick={() => {
                    setActiveTab("home");
                    dispatch(setSelectedUser(null));
                  }}
                  title="Home Dashboard"
                >
                  <IoHomeOutline />
                </button>
              </div>

              {/* Users */}
              <div
                className={`rail-btn-wrapper ${activeTab === "users" ? "active" : ""}`}
              >
                <button
                  type="button"
                  className="rail-icon-btn"
                  onClick={() => {
                    setActiveTab("users");
                    toast("Contacts view active", { icon: "👥" });
                  }}
                  title="Contacts & Users"
                >
                  <IoPeopleOutline />
                </button>
              </div>

              {/* Chat (Active tab matching reference UI with cutout) */}
              <div
                className={`rail-btn-wrapper ${activeTab === "chat" ? "active" : ""}`}
              >
                <button
                  type="button"
                  className="rail-icon-btn"
                  onClick={() => setActiveTab("chat")}
                  title="Chats"
                >
                  <IoChatbubbleEllipses />
                </button>
              </div>

              {/* Documents */}
              <div
                className={`rail-btn-wrapper ${activeTab === "docs" ? "active" : ""}`}
              >
                <button
                  type="button"
                  className="rail-icon-btn"
                  onClick={() => {
                    setActiveTab("docs");
                    setShowDocumentsModal(true);
                  }}
                  title="Documents & Files"
                >
                  <IoDocumentTextOutline />
                </button>
              </div>

              {/* Video */}
              <div
                className={`rail-btn-wrapper ${activeTab === "video" ? "active" : ""}`}
              >
                <button
                  type="button"
                  className="rail-icon-btn"
                  onClick={() => {
                    setActiveTab("video");
                    toast("Click 'Meeting' button below contacts to start an instant video call!", {
                      icon: "📹",
                    });
                  }}
                  title="Video Calls"
                >
                  <IoVideocamOutline />
                </button>
              </div>

              {/* Notifications */}
              <div
                className={`rail-btn-wrapper ${activeTab === "notif" ? "active" : ""}`}
              >
                <button
                  type="button"
                  className="rail-icon-btn"
                  onClick={() => {
                    setActiveTab("notif");
                    setShowNotifications((v) => !v);
                  }}
                  title="Notifications"
                >
                  <IoNotificationsOutline />
                  {unreadNotifCount > 0 && <span className="rail-badge" />}
                </button>
              </div>

              {/* Settings */}
              <div
                className={`rail-btn-wrapper ${activeTab === "settings" ? "active" : ""}`}
              >
                <button
                  type="button"
                  className="rail-icon-btn"
                  onClick={() => setIsProfileOpen(true)}
                  title="Settings & Profile"
                >
                  <IoSettingsOutline />
                </button>
              </div>
            </div>

            {/* User Profile Avatar at bottom of rail */}
            <div
              className="rail-bottom-user"
              onClick={() => setIsProfileOpen(true)}
              title="Profile & Settings"
            >
              <img
                src={loggedInAvatar}
                alt={loggedInName}
                className="rail-bottom-avatar"
              />
              <span className="rail-bottom-name">{loggedInName}</span>
            </div>
          </aside>

          {/* White Main Content Card (Columns 1, 2, 3) */}
          <main className="main-content-card">
            {/* Column 1: Contacts & Groups */}
            <UserSidebar searchTerm={globalSearch} />

            {/* Column 2 (Center Chat) & Column 3 (Right Profile) */}
            <MessageContainer />
          </main>
        </div>
      </div>

      {/* ── NOTIFICATIONS POPOVER ── */}
      {showNotifications && (
        <div
          className="purple-modal-backdrop"
          onClick={() => setShowNotifications(false)}
        >
          <div
            className="purple-modal-card"
            style={{ maxWidth: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-purple">
              <span className="modal-title-text">Notifications</span>
              <button
                className="modal-close-icon"
                onClick={() => setShowNotifications(false)}
              >
                <IoClose />
              </button>
            </div>

            <div className="modal-body-content" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: n.read ? "var(--pill-bg)" : "#f5f0ff",
                    borderLeft: n.read ? "none" : "3px solid var(--brand-purple)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onClick={() => {
                    setNotifications((prev) =>
                      prev.map((item) =>
                        item.id === n.id ? { ...item, read: true } : item
                      )
                    );
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, margin: 0, color: "var(--text-dark)" }}>
                      {n.text}
                    </p>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {n.time}
                    </span>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn-schedule"
                style={{ width: "100%", marginTop: 8 }}
                onClick={() => {
                  setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
                  toast.success("All marked as read");
                }}
              >
                Mark all as read
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DOCUMENTS & FILES MODAL ── */}
      {showDocumentsModal && (
        <div
          className="purple-modal-backdrop"
          onClick={() => setShowDocumentsModal(false)}
        >
          <div
            className="purple-modal-card"
            style={{ maxWidth: 520 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-purple">
              <span className="modal-title-text">Documents & Resources</span>
              <button
                className="modal-close-icon"
                onClick={() => setShowDocumentsModal(false)}
              >
                <IoClose />
              </button>
            </div>

            <div className="modal-body-content" style={{ maxHeight: "65vh", overflowY: "auto" }}>
              {[
                { name: "Project_Requirements.pdf", size: "2.4 MB", date: "Today" },
                { name: "UI_Design_System_v2.fig", size: "14.8 MB", date: "Yesterday" },
                { name: "Sprint_Roadmap_Q4.xlsx", size: "1.1 MB", date: "Oct 22" },
                { name: "Brand_Assets_Pack.zip", size: "38.2 MB", date: "Oct 18" },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "var(--pill-bg)",
                    border: "1px solid var(--pill-border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: "var(--brand-purple)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                      }}
                    >
                      <IoDocumentTextOutline />
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-dark)" }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {doc.size} • {doc.date}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--brand-purple)",
                      fontSize: 18,
                      cursor: "pointer",
                      padding: 6,
                    }}
                    onClick={() => toast.success(`Downloading ${doc.name}...`)}
                    title="Download"
                  >
                    <IoDownloadOutline />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PROFILE & SETTINGS MODAL ── */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default Home;
