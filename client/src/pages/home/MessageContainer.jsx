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
    <div className={`flex-1 h-screen flex flex-col bg-[#0b0f19] ${!selectedUser ? "hidden md:flex" : "flex"}`}>
      {!selectedUser ? (
        // Empty State Screen
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Hero */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 ring-1 ring-white/20">
              <IoChatbubblesSharp className="text-5xl text-white drop-shadow-md" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-xl bg-purple-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/50">
              <IoSparkles className="text-sm" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Welcome to GupShup
          </h2>
          <p className="text-slate-400 max-w-md mt-2 text-sm leading-relaxed">
            Select a conversation from the sidebar to start exchanging real-time messages, media, and stay connected.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8 max-w-lg">
            <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-900/80 border border-white/5 text-slate-300">
              <IoFlashOutline className="text-amber-400" /> Instant Real-Time
            </span>
            <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-900/80 border border-white/5 text-slate-300">
              <IoLockClosedOutline className="text-emerald-400" /> Private & Secure
            </span>
            <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-900/80 border border-white/5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Online Status
            </span>
          </div>
        </div>
      ) : (
        // Active Chat Screen
        <div className="h-screen w-full flex flex-col min-w-0">
          
          {/* Top Header */}
          <div className="px-4 py-3 sm:px-6 bg-slate-900/70 backdrop-blur-xl border-b border-white/10 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={handleBackToSidebar}
                className="md:hidden p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Back to conversations"
              >
                <FiArrowLeft className="text-xl" />
              </button>
              <User userDetails={selectedUser} isHeader={true} />
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col gap-3 min-h-0">
            {/* WhatsApp End-to-End Encryption Notice Banner */}
            <div className="flex justify-center my-1 sm:my-2 px-2 select-none">
              <div className="flex items-center gap-2 max-w-md bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-[11px] sm:text-xs px-3.5 py-2 rounded-xl text-center shadow-sm">
                <IoLockClosedOutline className="text-amber-400 text-sm flex-shrink-0" />
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
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-white/5 flex items-center justify-center text-2xl text-indigo-400 mb-3">
                  💬
                </div>
                <h3 className="text-base font-semibold text-slate-200">
                  No messages yet
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Say hello to <span className="text-slate-300 font-medium">{selectedUser?.fullName}</span> to start this conversation!
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
