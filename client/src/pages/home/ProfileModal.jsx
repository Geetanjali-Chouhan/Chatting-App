import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfileThunk, deleteAccountThunk } from "../../store/slice/user/user.thunk";
import { closeSocket } from "../../store/slice/socket/socket.slice";
import { useNavigate } from "react-router-dom";
import {
  IoClose,
  IoCamera,
  IoCloudUploadOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { FiUser, FiAtSign, FiMail, FiTrash2, FiAlertTriangle } from "react-icons/fi";

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
  const [confirmUsername, setConfirmUsername] = useState("");

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

  // Handle local image file upload & compress with canvas
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
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setPreviewAvatar(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Save profile edits
  const handleSave = async (e) => {
    e.preventDefault();
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

  // Delete account permanently
  const handleDeleteAccount = async () => {
    dispatch(closeSocket());
    const result = await dispatch(deleteAccountThunk());
    if (result?.meta?.requestStatus === "fulfilled") {
      onClose();
      navigate("/signup");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-lg bg-[#0e1424] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden text-slate-100 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background ambient glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Edit Profile & Account</h2>
            <p className="text-xs text-slate-400">Manage your avatar, account details, and settings</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <IoClose className="text-xl" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto pr-1 my-3 flex flex-col gap-5">
          {/* Avatar Preview & Upload */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload custom picture"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-indigo-500/40 bg-slate-800 shadow-xl shadow-indigo-950/50">
                <img
                  src={previewAvatar}
                  alt="Profile Preview"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs gap-1">
                <IoCamera className="text-xl" />
                <span>Change</span>
              </div>
              <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-indigo-600 border-2 border-slate-900 flex items-center justify-center text-white shadow-md">
                <IoCamera className="text-xs" />
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors py-1 px-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20"
            >
              <IoCloudUploadOutline className="text-sm" />
              Upload Photo from Computer
            </button>
          </div>

          {/* Ready Avatar Presets */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Choose from Ready Avatars:
            </label>
            <div className="grid grid-cols-5 gap-2 max-h-28 overflow-y-auto p-1 bg-slate-950/40 rounded-xl border border-white/5">
              {AVATAR_PRESETS.map((presetUrl, idx) => {
                const isSelected = previewAvatar === presetUrl;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPreviewAvatar(presetUrl)}
                    className={`relative aspect-square rounded-xl overflow-hidden bg-slate-800 transition-all duration-150 ${
                      isSelected
                        ? "ring-2 ring-indigo-400 scale-105 shadow-md shadow-indigo-500/30"
                        : "hover:ring-1 hover:ring-slate-500 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img src={presetUrl} alt="Preset" className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute top-0.5 right-0.5 text-indigo-400 bg-slate-900/90 rounded-full">
                        <IoCheckmarkCircle className="text-xs" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Inputs (Full Name, Username, Email) */}
          <div className="flex flex-col gap-3">
            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-300 ml-1">
                Display Name
              </label>
              <div className="bg-[#151b2d] border border-white/10 focus-within:border-indigo-500 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
                <FiUser className="text-slate-400 text-sm flex-shrink-0" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-300 ml-1">
                Username
              </label>
              <div className="bg-[#151b2d] border border-white/10 focus-within:border-indigo-500 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
                <FiAtSign className="text-slate-400 text-sm flex-shrink-0" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-300 ml-1">
                Email Address
              </label>
              <div className="bg-[#151b2d] border border-white/10 focus-within:border-indigo-500 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5">
                <FiMail className="text-slate-400 text-sm flex-shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Danger Zone: Delete Account Permanently */}
          <div className="mt-2 p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex flex-col gap-2.5">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 mt-0.5">
                <FiAlertTriangle className="text-base" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-rose-300">
                  Delete Account Permanently
                </h4>
                <p className="text-xs text-rose-200/70 mt-0.5 leading-relaxed">
                  Once deleted, your account, messages, media, and all conversations will be erased forever and cannot be recovered.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-1 self-start px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <FiTrash2 className="text-sm" />
              <span>Delete My Account Permanently</span>
            </button>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={buttonLoading}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {buttonLoading ? "Saving Changes..." : "Save Profile Changes"}
          </button>
        </div>

        {/* Delete Confirmation Modal Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 text-center animate-fade-in">
            <div className="max-w-sm flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center text-2xl mb-1 shadow-lg shadow-rose-950/50">
                <IoWarningOutline />
              </div>

              <h3 className="text-lg font-bold text-white">
                Delete Account Permanently?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                This will delete your user profile (<span className="text-rose-300 font-semibold">@{userProfile?.username}</span>), all messages, and chat history. This action is irreversible.
              </p>

              <div className="flex items-center gap-3 w-full mt-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={buttonLoading}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <IoTrashOutline className="text-base" />
                  <span>Yes, Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfileModal;
