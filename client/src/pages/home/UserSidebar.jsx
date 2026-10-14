import React, { useEffect, useState, useMemo } from "react";
import { IoSearch, IoCloseCircle, IoCamera } from "react-icons/io5";
import { IoChatbubblesSharp } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import User from "./User";
import ProfileModal from "./ProfileModal";
import { useDispatch, useSelector } from "react-redux";
import {
  getOtherUsersThunk,
  logoutUserThunk,
} from "../../store/slice/user/user.thunk";

import { closeSocket } from "../../store/slice/socket/socket.slice";

const UserSidebar = () => {
  const [searchValue, setSearchValue] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dispatch = useDispatch();
  const { otherUsers, userProfile, buttonLoading } = useSelector(
    (state) => state.userReducer
  );
  const { onlineUsers } = useSelector((state) => state.socketReducer);

  const handleLogout = async () => {
    dispatch(closeSocket());
    await dispatch(logoutUserThunk());
  };

  const users = useMemo(() => {
    let list = [...(otherUsers || [])];

    // Sort by recent message/notification timestamp so most recent appears on top
    list.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      if (timeB !== timeA) {
        return timeB - timeA;
      }
      return (b.unreadCount || 0) - (a.unreadCount || 0);
    });

    if (!searchValue.trim()) {
      return list;
    }

    const search = searchValue.toLowerCase();
    return list.filter((user) => {
      return (
        user.username?.toLowerCase().includes(search) ||
        user.fullName?.toLowerCase().includes(search)
      );
    });
  }, [searchValue, otherUsers]);

  useEffect(() => {
    dispatch(getOtherUsersThunk());
  }, [dispatch]);

  return (
    <div className="w-full md:w-80 lg:w-96 h-screen flex flex-col bg-slate-900/60 backdrop-blur-xl border-r border-white/10 flex-shrink-0 transition-all duration-300">
      
      {/* Sidebar Top Header */}
      <div className="p-4 sm:p-5 pb-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <IoChatbubblesSharp className="text-xl text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              GupShup
            </h1>
            <p className="text-[11px] font-medium text-slate-400">
              {onlineUsers?.length ? `${onlineUsers.length} online` : "Chat Network"}
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-3 sm:px-4">
        <div className="glass-input rounded-xl px-3 py-2 flex items-center gap-2.5">
          <IoSearch className="text-slate-400 text-lg flex-shrink-0" />
          <input
            onChange={(e) => setSearchValue(e.target.value)}
            type="text"
            className="w-full bg-transparent outline-none text-xs sm:text-sm text-white placeholder-slate-400"
            placeholder="Search conversations..."
            value={searchValue}
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue("")}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <IoCloseCircle className="text-base" />
            </button>
          )}
        </div>
      </div>

      {/* Section Subheader */}
      <div className="px-4 py-1.5 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <span>Chats</span>
        <span className="bg-slate-800 text-slate-400 text-[11px] px-2 py-0.5 rounded-full">
          {users?.length || 0}
        </span>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-3 py-1 flex flex-col gap-1.5">
        {users?.length > 0 ? (
          users.map((userDetails) => {
            return <User key={userDetails?._id} userDetails={userDetails} />;
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4 text-slate-500">
            <p className="text-sm">No users found</p>
            <span className="text-xs text-slate-600 mt-1">Try a different name</span>
          </div>
        )}
      </div>

      {/* Bottom Profile Bar */}
      <div className="p-3 sm:p-4 border-t border-white/5 bg-slate-900/80 backdrop-blur-md flex items-center justify-between gap-3">
        <div
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1 p-1 -m-1 rounded-2xl hover:bg-white/5 transition-colors"
          title="Click to edit profile photo"
        >
          {/* Avatar with Camera badge */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-indigo-500/40 group-hover:ring-indigo-400 bg-slate-800 transition-all">
              <img
                src={userProfile?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile?.username}`}
                alt={userProfile?.fullName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-indigo-600 border border-slate-900 rounded-full flex items-center justify-center text-white text-[9px] shadow-sm">
              <IoCamera />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-semibold text-white truncate group-hover:text-indigo-200 transition-colors">
                {userProfile?.fullName || userProfile?.username}
              </h2>
            </div>
            <p className="text-xs text-slate-400 truncate flex items-center gap-1">
              <span>@{userProfile?.username}</span>
              <span className="text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">• Edit Photo</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsProfileOpen(true)}
            title="Change Profile Photo"
            className="flex-shrink-0 p-2.5 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all duration-200 cursor-pointer"
          >
            <IoCamera className="text-lg" />
          </button>

          <button
            onClick={handleLogout}
            disabled={buttonLoading}
            title="Sign Out"
            className="flex-shrink-0 p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200 cursor-pointer"
          >
            <FiLogOut className="text-lg" />
          </button>
        </div>
      </div>

      {/* Profile Photo Edit Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

    </div>
  );
};

export default UserSidebar;
