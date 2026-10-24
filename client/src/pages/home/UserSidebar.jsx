import React, { useEffect, useState, useMemo } from "react";
import {
  IoSearch,
  IoClose,
  IoVideocamOutline,
  IoCalendarOutline,
  IoAdd,
  IoCopyOutline,
  IoCheckmark,
} from "react-icons/io5";
import User from "./User";
import { useDispatch, useSelector } from "react-redux";
import { getOtherUsersThunk } from "../../store/slice/user/user.thunk";
import { setSelectedUser } from "../../store/slice/user/user.slice";
import toast from "react-hot-toast";

const INITIAL_GROUPS = [
  {
    id: "group-1",
    name: "UI/UX Designing",
    iconLetter: "U",
    bgColor: "#f97316",
    membersCount: "+2",
  },
  {
    id: "group-2",
    name: "Web Development",
    iconLetter: "W",
    bgColor: "#8b5cf6",
    membersCount: "+6",
  },
];

const UserSidebar = ({ searchTerm = "" }) => {
  const [searchValue, setSearchValue] = useState("");
  const dispatch = useDispatch();
  const { otherUsers, selectedUser } = useSelector((state) => state.userReducer);
  const { onlineUsers } = useSelector((state) => state.socketReducer);

  // Modals
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Groups state
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [newGroupName, setNewGroupName] = useState("");

  // Schedule state
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const meetingLink = `https://meet.gupshup.io/room-${Math.floor(100000 + Math.random() * 900000)}`;

  useEffect(() => {
    dispatch(getOtherUsersThunk());
  }, [dispatch]);

  // Combine top-bar search with local sidebar search
  const effectiveSearch = (searchTerm || searchValue).trim().toLowerCase();

  const users = useMemo(() => {
    let list = [...(otherUsers || [])];
    list.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const timeB = b.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      if (timeB !== timeA) return timeB - timeA;
      return (b.unreadCount || 0) - (a.unreadCount || 0);
    });
    if (!effectiveSearch) return list;
    return list.filter(
      (u) =>
        u.username?.toLowerCase().includes(effectiveSearch) ||
        u.fullName?.toLowerCase().includes(effectiveSearch)
    );
  }, [effectiveSearch, otherUsers]);

  const handleCopyMeetingLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopiedLink(true);
    toast.success("Meeting link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const colors = ["#ec4899", "#10b981", "#3b82f6", "#f59e0b", "#6366f1"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName.trim(),
      iconLetter: newGroupName.trim().charAt(0).toUpperCase(),
      bgColor: randomColor,
      membersCount: "+1",
    };
    setGroups((prev) => [...prev, newGroup]);
    setNewGroupName("");
    setShowCreateGroupModal(false);
    toast.success(`Group "${newGroup.name}" created successfully!`);
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!scheduleTitle.trim()) {
      toast.error("Please enter a meeting title");
      return;
    }
    setShowScheduleModal(false);
    toast.success(`Meeting "${scheduleTitle}" scheduled!`);
    setScheduleTitle("");
    setScheduleDate("");
    setScheduleTime("");
  };

  const handleSelectGroup = (grp) => {
    // Select group as active chat simulation
    dispatch(
      setSelectedUser({
        _id: grp.id,
        fullName: grp.name,
        username: grp.name.toLowerCase().replace(/\s+/g, "_"),
        role: "Project Team",
        location: "Virtual Group",
        email: `${grp.name.toLowerCase().replace(/\s+/g, "")}@team.io`,
        phone: "+91 Group Chat",
        dob: "Created recently",
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${grp.name}`,
        isGroup: true,
      })
    );
  };

  return (
    <>
      <div className="contacts-column">
        {/* Header Section */}
        <div className="contacts-header-section">
          <div className="contacts-title-row">
            <h2 className="contacts-main-title">Chat</h2>
            <span className="contacts-online-pill">
              {onlineUsers?.length || 0} online
            </span>
          </div>

          {/* Search Box */}
          <div className="contacts-search-box">
            <IoSearch style={{ fontSize: 16, color: "var(--text-muted)", flexShrink: 0 }} />
            <input
              type="text"
              className="contacts-search-input"
              placeholder="Search Contact..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  display: "flex",
                  padding: 0,
                }}
              >
                <IoClose style={{ fontSize: 16 }} />
              </button>
            )}
          </div>
        </div>

        {/* Contacts Scrollable List */}
        <div className="contacts-list-scroll">
          {users?.length > 0 ? (
            users.map((userDetails) => (
              <User key={userDetails?._id} userDetails={userDetails} />
            ))
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 160,
                gap: 8,
              }}
            >
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
                {searchValue ? "No contacts found" : "No chats yet"}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons: [ Meeting ] & [ Schedule ] */}
        <div className="contacts-actions-row">
          <button
            type="button"
            className="btn-meeting"
            onClick={() => setShowMeetingModal(true)}
            title="Start instant meeting"
          >
            <IoVideocamOutline style={{ fontSize: 17 }} />
            Meeting
          </button>
          <button
            type="button"
            className="btn-schedule"
            onClick={() => setShowScheduleModal(true)}
            title="Schedule a meeting"
          >
            <IoCalendarOutline style={{ fontSize: 16 }} />
            Schedule
          </button>
        </div>

        {/* Groups Section */}
        <div className="contacts-groups-section">
          <div className="groups-header-row">
            <span className="groups-title">Groups ({groups.length})</span>
            <button
              type="button"
              className="groups-add-btn"
              onClick={() => setShowCreateGroupModal(true)}
              title="Create new group"
            >
              <IoAdd />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {groups.map((grp) => (
              <div
                key={grp.id}
                className="group-item-card"
                onClick={() => handleSelectGroup(grp)}
              >
                <div className="group-item-left">
                  <div
                    className="group-icon-badge"
                    style={{ background: grp.bgColor }}
                  >
                    {grp.iconLetter}
                  </div>
                  <span className="group-name">{grp.name}</span>
                </div>
                <span className="group-members-badge">{grp.membersCount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── INSTANT MEETING MODAL ── */}
      {showMeetingModal && (
        <div className="purple-modal-backdrop" onClick={() => setShowMeetingModal(false)}>
          <div
            className="purple-modal-card"
            style={{ maxWidth: 440 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-purple">
              <span className="modal-title-text">Start Instant Meeting</span>
              <button
                className="modal-close-icon"
                onClick={() => setShowMeetingModal(false)}
              >
                <IoClose />
              </button>
            </div>

            <div className="modal-body-content">
              <div
                style={{
                  height: 160,
                  borderRadius: 16,
                  background: "#1e1333",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    marginBottom: 8,
                  }}
                >
                  <IoVideocamOutline />
                </div>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                  Camera preview ready
                </span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                  Meeting Link
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "var(--pill-bg)",
                    padding: "8px 12px",
                    borderRadius: 12,
                    border: "1px solid var(--pill-border)",
                  }}
                >
                  <span style={{ fontSize: 12.5, color: "var(--text-dark)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {meetingLink}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyMeetingLink}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: copiedLink ? "#22c55e" : "var(--brand-purple)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {copiedLink ? <IoCheckmark /> : <IoCopyOutline />}
                    {copiedLink ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  className="btn-schedule"
                  onClick={() => setShowMeetingModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-meeting"
                  onClick={() => {
                    setShowMeetingModal(false);
                    toast.success("Joined meeting room!");
                  }}
                >
                  Join Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SCHEDULE MEETING MODAL ── */}
      {showScheduleModal && (
        <div className="purple-modal-backdrop" onClick={() => setShowScheduleModal(false)}>
          <div
            className="purple-modal-card"
            style={{ maxWidth: 440 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-purple">
              <span className="modal-title-text">Schedule Meeting</span>
              <button
                className="modal-close-icon"
                onClick={() => setShowScheduleModal(false)}
              >
                <IoClose />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="modal-body-content">
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                  Meeting Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Design Review, Sprint Planning"
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  style={{
                    width: "100%",
                    height: 40,
                    padding: "0 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-light)",
                    fontSize: 13.5,
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                  autoFocus
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    style={{
                      width: "100%",
                      height: 40,
                      padding: "0 12px",
                      borderRadius: 12,
                      border: "1px solid var(--border-light)",
                      fontSize: 13,
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    style={{
                      width: "100%",
                      height: 40,
                      padding: "0 12px",
                      borderRadius: 12,
                      border: "1px solid var(--border-light)",
                      fontSize: 13,
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn-schedule"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-meeting">
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE GROUP MODAL ── */}
      {showCreateGroupModal && (
        <div className="purple-modal-backdrop" onClick={() => setShowCreateGroupModal(false)}>
          <div
            className="purple-modal-card"
            style={{ maxWidth: 420 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-purple">
              <span className="modal-title-text">Create New Group</span>
              <button
                className="modal-close-icon"
                onClick={() => setShowCreateGroupModal(false)}
              >
                <IoClose />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="modal-body-content">
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                  Group Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mobile App Dev, Marketing"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  style={{
                    width: "100%",
                    height: 40,
                    padding: "0 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-light)",
                    fontSize: 13.5,
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                  autoFocus
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn-schedule"
                  onClick={() => setShowCreateGroupModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newGroupName.trim()}
                  className="btn-meeting"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserSidebar;
