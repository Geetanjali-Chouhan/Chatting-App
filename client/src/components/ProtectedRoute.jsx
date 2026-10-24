import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAuthChecked } = useSelector(
    (state) => state.userReducer
  );

  if (!isAuthChecked) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#341b52] text-white gap-3 select-none">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center ring-1 ring-white/20">
          <span className="loading loading-spinner text-white"></span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-purple-200 animate-pulse">
          Loading Chat App...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;