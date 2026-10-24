import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfileThunk, deleteAccountThunk } from "../../store/slice/user/user.thunk";
import { closeSocket } from "../../store/slice/socket/socket.slice";
import { useNavigate } from "react-router-dom";
import {
  IoClose,
  IoCamera,
  IoArrowBack,
  IoCheckmark,
  IoPencil,
  IoWarning,
} from "react-icons/io5";

const AVATAR_PRESETS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Luna",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Milo",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Zoe",
  "https://avatar.iran.liara.run/public/boy?username=alex",
  "https://avatar.iran.liara.run/public/girl?username=emma",
  "https://avatar.iran.liara.run/public/boy?username=david",
  "https://avatar.iran.liara.run/public/girl?username=sophia",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Chloe",
];

const ProfileModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userProfile, buttonLoading } = useSelector((state) => state.userReducer);

  const [previewAvatar, setPreviewAvatar] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingField, setEditingField] = useState(null); // 'name' | 'username' | null
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userProfile) {
      setPreviewAvatar(
        userProfile.avatar ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile.username}`
      );
      setFullName(userProfile.fullName || "");
      setUsername(userProfile.username || "");
      setEmail(userProfile.email || "");
    }
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; }
        } else {
          if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setPreviewAvatar(compressedDataUrl);
        setShowAvatarPicker(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setEditingField(null);
    const result = await dispatch(
      updateProfileThunk({
        avatar: previewAvatar,
        fullName: fullName.trim() || userProfile?.fullName,
        username: username.trim() || userProfile?.username,
        email: email.trim() || userProfile?.email,
      })
    );
    if (result?.meta?.requestStatus === "fulfilled") {
      onClose();
    }
  };

  const handleDeleteAccount = async () => {
    dispatch(closeSocket());
    const result = await dispatch(deleteAccountThunk());
    if (result?.meta?.requestStatus === "fulfilled") {
      onClose();
      navigate("/signup");
    }
  };

  return (
    <div className="wa-modal-backdrop animate-fade-in">
      <div
        className="animate-scale-in"
        style={{
          background: "#111B21",
          width: "100%",
          maxWidth: 420,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
          borderRadius: 8,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          style={{
            background: "var(--wa-teal)",
            padding: "24px 20px 20px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <IoArrowBack style={{ fontSize: 24 }} />
          </button>
          <h2 style={{ fontSize: 19, fontWeight: 400, color: "white", margin: 0 }}>
            Profile
          </h2>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Avatar section */}
          <div
            style={{
              background: "var(--wa-panel-bg)",
              display: "flex",
              justifyContent: "center",
              padding: "30px 0 24px",
            }}
          >
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "var(--wa-hover)",
                  cursor: "pointer",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
                }}
                onClick={() => setShowAvatarPicker(true)}
              >
                <img
                  src={previewAvatar}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <button
                onClick={() => setShowAvatarPicker(true)}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--wa-online)",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "white",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }}
              >
                <IoCamera style={{ fontSize: 16 }} />
              </button>
            </div>
          </div>

          {/* Avatar picker */}
          {showAvatarPicker && (
            <div
              style={{
                background: "var(--wa-panel-bg)",
                padding: "16px 20px",
                marginBottom: 8,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: "var(--wa-online)",
                  marginBottom: 12,
                  fontWeight: 500,
                }}
              >
                Choose Avatar
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                {AVATAR_PRESETS.map((presetUrl, idx) => {
                  const isSelected = previewAvatar === presetUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setPreviewAvatar(presetUrl); setShowAvatarPicker(false); }}
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: isSelected ? "2px solid var(--wa-online)" : "2px solid transparent",
                        background: "var(--wa-hover)",
                        cursor: "pointer",
                        padding: 0,
                        position: "relative",
                        transition: "border-color 0.15s",
                      }}
                    >
                      <img src={presetUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {isSelected && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0,168,132,0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <IoCheckmark style={{ color: "white", fontSize: 20 }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "transparent",
                  border: "none",
                  color: "var(--wa-online)",
                  cursor: "pointer",
                  fontSize: 14,
                  padding: "8px 0",
                  fontFamily: "inherit",
                }}
              >
                <IoCamera style={{ fontSize: 18 }} />
                Upload from device
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>
          )}

          {/* Profile fields */}
          <div style={{ background: "var(--wa-panel-bg)", padding: "4px 0", marginBottom: 8 }}>
            <div style={{ padding: "4px 20px 0" }}>
              <p style={{ fontSize: 12, color: "var(--wa-online)", margin: "0 0 4px", fontWeight: 500 }}>
                Your name
              </p>
            </div>
            <div
              style={{
                padding: "8px 20px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderBottom: "1px solid var(--wa-divider)",
              }}
            >
              {editingField === "name" ? (
                <>
                  <input
                    autoFocus
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="wa-form-input"
                    placeholder="Your full name"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingField(null)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--wa-online)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <IoCheckmark style={{ fontSize: 22 }} />
                  </button>
                </>
              ) : (
                <>
                  <span
                    style={{ flex: 1, fontSize: 17, color: "var(--wa-text-primary)" }}
                    onClick={() => setEditingField("name")}
                  >
                    {fullName || "Your name"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingField("name")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--wa-icon)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <IoPencil style={{ fontSize: 18 }} />
                  </button>
                </>
              )}
            </div>
            <p
              style={{
                fontSize: 12,
                color: "var(--wa-text-secondary)",
                padding: "8px 20px 12px",
                margin: 0,
              }}
            >
              This is not your username or PIN. This name will be visible to your WhatsApp contacts.
            </p>
          </div>

          {/* Username field */}
          <div style={{ background: "var(--wa-panel-bg)", padding: "4px 0", marginBottom: 8 }}>
            <div style={{ padding: "4px 20px 0" }}>
              <p style={{ fontSize: 12, color: "var(--wa-online)", margin: "0 0 4px", fontWeight: 500 }}>
                Username
              </p>
            </div>
            <div
              style={{
                padding: "8px 20px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {editingField === "username" ? (
                <>
                  <input
                    autoFocus
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="wa-form-input"
                    placeholder="username"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingField(null)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--wa-online)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <IoCheckmark style={{ fontSize: 22 }} />
                  </button>
                </>
              ) : (
                <>
                  <span
                    style={{ flex: 1, fontSize: 17, color: "var(--wa-text-primary)" }}
                    onClick={() => setEditingField("username")}
                  >
                    @{username || "username"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingField("username")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--wa-icon)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <IoPencil style={{ fontSize: 18 }} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Email field */}
          <div style={{ background: "var(--wa-panel-bg)", padding: "4px 0", marginBottom: 8 }}>
            <div style={{ padding: "4px 20px 0" }}>
              <p style={{ fontSize: 12, color: "var(--wa-online)", margin: "0 0 4px", fontWeight: 500 }}>
                Email
              </p>
            </div>
            <div style={{ padding: "8px 20px 14px" }}>
              <span style={{ fontSize: 17, color: "var(--wa-text-secondary)" }}>
                {email || "—"}
              </span>
            </div>
          </div>

          {/* Danger zone */}
          <div style={{ background: "var(--wa-panel-bg)", padding: "0", marginBottom: 8 }}>
            <div
              style={{
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                cursor: "pointer",
                color: "#f15c6d",
                borderTop: "1px solid var(--wa-divider)",
              }}
              onClick={() => setShowDeleteConfirm(true)}
            >
              <IoWarning style={{ fontSize: 22, flexShrink: 0 }} />
              <span style={{ fontSize: 16 }}>Delete Account Permanently</span>
            </div>
          </div>

          {/* Save button */}
          <div style={{ padding: "8px 20px 24px" }}>
            <button
              type="button"
              onClick={handleSave}
              disabled={buttonLoading}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 8,
                background: "var(--wa-online)",
                border: "none",
                color: "white",
                fontWeight: 600,
                fontSize: 15,
                cursor: buttonLoading ? "not-allowed" : "pointer",
                opacity: buttonLoading ? 0.7 : 1,
                fontFamily: "inherit",
                transition: "opacity 0.15s",
              }}
            >
              {buttonLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirm Dialog */}
      {showDeleteConfirm && (
        <div
          className="wa-modal-backdrop animate-fade-in"
          style={{ zIndex: 60 }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="wa-modal animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wa-modal-body" style={{ padding: "24px" }}>
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: "var(--wa-text-primary)",
                  marginBottom: 12,
                }}
              >
                Delete your account?
              </h3>
              <ul
                style={{
                  paddingLeft: 20,
                  color: "var(--wa-text-secondary)",
                  fontSize: 14,
                  lineHeight: 2,
                  marginBottom: 20,
                }}
              >
                <li>Delete your account</li>
                <li>Erase your message history</li>
                <li>Remove you from all chats</li>
              </ul>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: "8px 18px",
                    background: "transparent",
                    border: "none",
                    color: "var(--wa-online)",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  CANCEL
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={buttonLoading}
                  style={{
                    padding: "8px 18px",
                    background: "transparent",
                    border: "none",
                    color: "#f15c6d",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: buttonLoading ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {buttonLoading ? "Deleting..." : "DELETE ACCOUNT"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileModal;
