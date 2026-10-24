import React, { useEffect } from "react";
import User from "./User";
import Message from "./Message";
import { useDispatch, useSelector } from "react-redux";
import { getMessageThunk } from "../../store/slice/message/message.thunk";
import SendMessage from "./SendMessage";
import { setSelectedUser } from "../../store/slice/user/user.slice";
import { IoChatbubblesSharp, IoSparkles, IoLockClosedOutline, IoFlashOutline } from "react-icons/io5";
import { FiArrowLeft } from "react-icons/fi";

const MessageContainer = () => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((state) => state.userReducer);
  const { messages } = useSelector((state) => state.messageReducer);

  useEffect(() => {
    if (selectedUser?._id) {
      dispatch(getMessageThunk({ recieverId: selectedUser?._id }));
    }
  }, [selectedUser, dispatch]);

  const handleBackToSidebar = () => {
    dispatch(setSelectedUser(null));
  };

  return (
    <div className={`flex-1 h-screen flex flex-col bg-[#e8ecf2] ${!selectedUser ? "hidden md:flex" : "flex"}`}>
      {!selectedUser ? (
        // Empty State Screen
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden bg-[#e8ecf2]">
          {/* Ambient Glows */}
          <div className="absolute w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Hero */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#2AABEE] via-[#229ED9] to-[#1E88E5] flex items-center justify-center shadow-2xl shadow-blue-500/30 ring-1 ring-white/40">
              <IoChatbubblesSharp className="text-5xl text-white drop-shadow-md" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-xl bg-[#2AABEE] flex items-center justify-center text-white shadow-lg shadow-blue-400/50">
              <IoSparkles className="text-sm" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">
            Welcome to GupShup
          </h2>
          <p className="text-slate-500 max-w-md mt-2 text-sm leading-relaxed">
            Select a conversation from the sidebar to start exchanging real-time messages, media, and stay connected.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8 max-w-lg">
            <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/80 border border-slate-200 text-slate-600 shadow-sm">
              <IoFlashOutline className="text-amber-500" /> Instant Real-Time
            </span>
            <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/80 border border-slate-200 text-slate-600 shadow-sm">
              <IoLockClosedOutline className="text-emerald-500" /> Private & Secure
            </span>
            <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/80 border border-slate-200 text-slate-600 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Online Status
            </span>
          </div>
        </div>
      ) : (
        // Active Chat Screen
        <div className="h-screen w-full flex flex-col min-w-0">
          
          {/* Top Header - Telegram style */}
          <div className="px-4 py-3 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between z-10 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={handleBackToSidebar}
                className="md:hidden p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Back to conversations"
              >
                <FiArrowLeft className="text-xl" />
              </button>
              <User userDetails={selectedUser} isHeader={true} />
            </div>
          </div>

          {/* Messages Scroll Area - Telegram style wallpaper */}
          <div
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col gap-3 min-h-0"
            style={{
              backgroundColor: '#c8d9e6',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23aec5d6' fill-opacity='0.25'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            {/* Encryption Notice Banner - Telegram style */}
            <div className="flex justify-center my-1 sm:my-2 px-2 select-none">
              <div className="flex items-center gap-2 max-w-md bg-white/60 backdrop-blur-sm border border-slate-200/60 text-slate-500 text-[11px] sm:text-xs px-3.5 py-2 rounded-xl text-center shadow-sm">
                <IoLockClosedOutline className="text-slate-400 text-sm flex-shrink-0" />
                <span>
                  Messages are end-to-end encrypted. No one outside of this chat, not even GupShup, can read them.
                </span>
              </div>
            </div>

            {messages && messages.length > 0 ? (
              messages.map((messageDetails) => {
                return (
                  <Message
                    key={messageDetails?._id}
                    messageDetails={messageDetails}
                  />
                );
              })
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="w-16 h-16 rounded-2xl bg-white/70 border border-slate-200 flex items-center justify-center text-2xl text-blue-400 mb-3 shadow-sm">
                  💬
                </div>
                <h3 className="text-base font-semibold text-slate-700">
                  No messages yet
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Say hello to <span className="text-slate-600 font-medium">{selectedUser?.fullName}</span> to start this conversation!
                </p>
              </div>
            )}
          </div>

          {/* Send Input Bar */}
          <SendMessage />

        </div>
      )}
    </div>
  );
};

export default MessageContainer;
