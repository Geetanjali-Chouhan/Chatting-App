import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../../store/slice/user/user.slice";
import { deleteOtherUserThunk } from "../../store/slice/user/user.thunk";
import { IoCheckmarkSharp, IoCheckmarkDoneSharp, IoLockClosed } from "react-icons/io5";
import { FiTrash2 } from "react-icons/fi";
import { decryptMessage, isEncryptedMessage } from "../../components/utitlities/crypto";

const User = ({ userDetails, isHeader = false }) => {
  const dispatch = useDispatch();
  const { selectedUser, userProfile } = useSelector((state) => state.userReducer);
  const { onlineUsers } = useSelector((state) => state.socketReducer);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const isUserOnline = Boolean(
    userDetails?._id &&
      onlineUsers?.some((id) => String(id) === String(userDetails._id))
  );

  const isSelected = userDetails?._id === selectedUser?._id;

  const handleUserClick = () => {
    if (!isHeader) {
      dispatch(setSelectedUser(userDetails));
    }
  };

  // Format last message timestamp safely
  const formatTime = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      const now = new Date();
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  const lastMsg = userDetails?.lastMessage;
  const isLastMsgMe =
    lastMsg &&
    (lastMsg.senderId === userProfile?._id ||
      lastMsg.senderId?._id === userProfile?._id);

  // Decrypt last message for sidebar preview
  const [decryptedLastMessage, setDecryptedLastMessage] = useState(() => {
    if (isEncryptedMessage(lastMsg?.message)) return "🔒 Encrypted Message";
    return lastMsg?.message || "";
  });

  useEffect(() => {
    let isMounted = true;
    const runDecryption = async () => {
      if (!lastMsg?.message) {
        setDecryptedLastMessage("");
        return;
      }
      const otherId = userDetails?._id;
      const text = await decryptMessage(
        lastMsg.message,
        userProfile?._id,
        otherId
      );
      if (isMounted) {
        setDecryptedLastMessage(text);
      }
    };
    runDecryption();
    return () => {
      isMounted = false;
    };
  }, [lastMsg?.message, userDetails?._id, userProfile?._id]);

  // Header presentation mode - Telegram style light theme
  if (isHeader) {
    return (
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-[#2AABEE]/30 bg-slate-100">
            <img
              src={userDetails?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userDetails?.username}`}
              alt={userDetails?.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          {isUserOnline && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-800 leading-tight">
              {userDetails?.fullName}
            </h2>
            <span
              className="hidden sm:inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-medium select-none"
              title="Messages are end-to-end encrypted. No third party can read them."
            >
              <IoLockClosed className="text-[10px]" /> E2EE
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isUserOnline && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
            <span className={`text-xs font-medium ${isUserOnline ? "text-emerald-600" : "text-slate-400"}`}>
              {isUserOnline ? "Online" : "Offline"}
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-400">@{userDetails?.username}</span>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar list item mode
  return (
    <div
      onClick={handleUserClick}
      className={`group relative flex items-center gap-3.5 p-2.5 rounded-2xl cursor-pointer transition-all duration-200 ${
        isSelected
          ? "bg-indigo-600/20 border border-indigo-500/40 shadow-md shadow-indigo-950/40"
          : "hover:bg-slate-800/60 border border-transparent"
      }`}
    >
      {/* Avatar with status: white dot if online, nothing if offline */}
      <div className="relative flex-shrink-0">
        <div className={`w-11 h-11 rounded-full overflow-hidden transition-all duration-200 bg-slate-800 ${
          isSelected
            ? "ring-2 ring-indigo-400"
            : "group-hover:ring-2 group-hover:ring-slate-600 ring-1 ring-white/10"
        }`}>
          <img
            src={userDetails?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userDetails?.username}`}
            alt={userDetails?.fullName}
            className="w-full h-full object-cover"
          />
        </div>
        {isUserOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-white border-2 border-[#0f172a] rounded-full shadow-sm shadow-white/80" />
        )}
      </div>

      {/* User Information */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <h2 className={`text-sm font-semibold truncate transition-colors ${
            isSelected ? "text-white" : "text-slate-200 group-hover:text-white"
          }`}>
            {userDetails?.fullName}
          </h2>
          {lastMsg?.createdAt ? (
            <span className="text-[10px] text-slate-400 flex-shrink-0">
              {formatTime(lastMsg.createdAt)}
            </span>
          ) : isUserOnline ? (
            <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
              Active
            </span>
          ) : null}
        </div>

        {/* Subtitle: Last message with tick or username */}
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {isLastMsgMe && (
              <span className="flex-shrink-0 text-sm">
                {lastMsg?.seen ? (
                  <IoCheckmarkDoneSharp
                    className="text-sky-400 filter drop-shadow-[0_0_2px_rgba(56,189,248,0.5)]"
                    title="Seen"
                  />
                ) : isUserOnline ? (
                  <IoCheckmarkDoneSharp
                    className="text-slate-400"
                    title="Delivered"
                  />
                ) : (
                  <IoCheckmarkSharp
                    className="text-slate-400"
                    title="Sent"
                  />
                )}
              </span>
            )}

            <p className={`text-xs truncate font-normal ${
              !lastMsg ? "text-slate-400" : isLastMsgMe ? "text-slate-400" : lastMsg.seen ? "text-slate-400" : "text-slate-200 font-medium"
            }`}>
              {decryptedLastMessage ? decryptedLastMessage : `@${userDetails?.username}`}
            </p>
          </div>

          {/* Right action area: delete chat button & unread badge */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Trash button on hover */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirmDelete(true);
              }}
              title="Delete chat permanently"
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
            >
              <FiTrash2 className="text-xs" />
            </button>

            {/* Unread message badge */}
            {userDetails?.unreadCount > 0 && !isSelected && (
              <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-sm shadow-emerald-500/50 min-w-4 text-center">
                {userDetails.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Active right pill indicator */}
      {isSelected && (
        <div className="absolute right-1 w-1 h-6 bg-indigo-500 rounded-full" />
      )}

      {/* Delete Chat Confirmation Modal */}
      {showConfirmDelete && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
        >
          <div className="w-full max-w-xs bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col items-center text-center gap-3 text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center text-xl shadow-lg shadow-rose-950/40">
              <FiTrash2 />
            </div>
            <h4 className="text-sm font-bold text-white">
              Delete chat with @{userDetails?.username}?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              All messages and conversation history with {userDetails?.fullName} will be permanently removed.
            </p>
            <div className="flex items-center gap-2.5 w-full mt-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirmDelete(false);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!userDetails?._id) return;
                  await dispatch(deleteOtherUserThunk(userDetails._id));
                  setShowConfirmDelete(false);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;