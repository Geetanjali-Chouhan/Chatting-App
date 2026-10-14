import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAuthChecked } = useSelector(
    (state) => state.userReducer
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthChecked && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isAuthChecked, navigate]);

  if (!isAuthChecked) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0b0f19] text-white gap-3 select-none">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center ring-1 ring-indigo-500/30">
          <span className="loading loading-spinner text-indigo-400"></span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 animate-pulse">
          Loading GupShup...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
};

export default ProtectedRoute;