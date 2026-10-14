import React, { useEffect, useRef } from "react";
import UserSidebar from "./UserSidebar";
import MessageContainer from "./MessageContainer";
import { useDispatch, useSelector } from "react-redux";
import {
  initializeSocket,
  setOnlineUsers,
} from "../../store/slice/socket/socket.slice";
import {
  setNewMessage,
  markAllSeenForUser,
} from "../../store/slice/message/message.slice";
import {
  updateUserLastMessage,
  resetUserUnreadCount,
  markSidebarLastMessageSeen,
} from "../../store/slice/user/user.slice";

const Home = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, userProfile, selectedUser } = useSelector(
    (state) => state.userReducer
  );
  const { socket } = useSelector((state) => state.socketReducer);

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
    if (selectedUser?._id && socket) {
      socket.emit("markMessagesSeen", { senderId: selectedUser._id });
      dispatch(resetUserUnreadCount(selectedUser._id));
    }
  }, [selectedUser, socket, dispatch]);

  useEffect(() => {
    if (!socket) return;

    // Immediately ask server for current online users
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
  }, [socket, dispatch]);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#0b0f19]">
      <UserSidebar />
      <MessageContainer />
    </div>
  );
};

export default Home;
