import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUserThunk } from "../../store/slice/user/user.thunk";
import toast from "react-hot-toast";
import { IoChatbubblesSharp } from "react-icons/io5";
import { FiUser, FiAtSign, FiLock, FiEye, FiEyeOff, FiMail } from "react-icons/fi";
import { FaMars, FaVenus } from "react-icons/fa";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, buttonLoading } = useSelector(
    (state) => state.userReducer
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [signupData, setSignupData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "male",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    setSignupData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignup = async (e) => {
    if (e) e.preventDefault();

    if (!signupData.fullName.trim() || !signupData.username.trim() || !signupData.password.trim()) {
      return toast.error("Please fill in all required fields");
    }

    if (signupData.password !== signupData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    const response = await dispatch(registerUserThunk(signupData));
    if (response?.payload?.success) {
      navigate("/");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-10 overflow-hidden">
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Main card */}
      <div className="relative w-full max-w-[480px] glass-card-glow rounded-3xl p-8 sm:p-10 flex flex-col gap-6 z-10 transition-all duration-300">
        
        {/* Brand header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
            <IoChatbubblesSharp className="text-2xl text-white" />
          </div>
          <span className="text-xs font-semibold tracking-widest uppercase bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mt-1">
            GupShup Messenger
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Create an account
          </h2>
          <p className="text-sm text-slate-400">
            Connect and chat with friends in real-time
          </p>
        </div>

        {/* Signup form */}
        <form onSubmit={handleSignup} className="flex flex-col gap-4 mt-1">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300 ml-1">
              Full Name
            </label>
            <div className="glass-input rounded-xl px-3.5 py-3 flex items-center gap-3">
              <FiUser className="text-slate-400 text-lg flex-shrink-0" />
              <input
                type="text"
                name="fullName"
                className="w-full bg-transparent outline-none text-sm text-white placeholder-slate-500"
                placeholder="e.g. John Doe"
                value={signupData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300 ml-1">
              Username
            </label>
            <div className="glass-input rounded-xl px-3.5 py-3 flex items-center gap-3">
              <FiAtSign className="text-slate-400 text-lg flex-shrink-0" />
              <input
                type="text"
                name="username"
                autoComplete="username"
                className="w-full bg-transparent outline-none text-sm text-white placeholder-slate-500"
                placeholder="Choose a unique username"
                value={signupData.username}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300 ml-1">
              Email Address
            </label>
            <div className="glass-input rounded-xl px-3.5 py-3 flex items-center gap-3">
              <FiMail className="text-slate-400 text-lg flex-shrink-0" />
              <input
                type="email"
                name="email"
                autoComplete="email"
                className="w-full bg-transparent outline-none text-sm text-white placeholder-slate-500"
                placeholder="Enter your email (e.g. name@example.com)"
                value={signupData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Password & Confirm Password Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300 ml-1">
                Password
              </label>
              <div className="glass-input rounded-xl px-3.5 py-3 flex items-center gap-2">
                <FiLock className="text-slate-400 text-base flex-shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full bg-transparent outline-none text-sm text-white placeholder-slate-500 min-w-0"
                  placeholder="Password"
                  value={signupData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                >
                  {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300 ml-1">
                Confirm
              </label>
              <div className="glass-input rounded-xl px-3.5 py-3 flex items-center gap-2">
                <FiLock className="text-slate-400 text-base flex-shrink-0" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  className="w-full bg-transparent outline-none text-sm text-white placeholder-slate-500 min-w-0"
                  placeholder="Repeat"
                  value={signupData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
              </div>
            </div>
          </div>

          {/* Gender Selection */}
          <div className="flex flex-col gap-1.5 mt-1">
            <label className="text-xs font-medium text-slate-300 ml-1">
              Select Gender
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl cursor-pointer transition-all duration-200 border text-sm font-medium ${
                  signupData.gender === "male"
                    ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-sm shadow-indigo-500/20"
                    : "glass-input text-slate-400 hover:text-slate-200"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={signupData.gender === "male"}
                  onChange={handleInputChange}
                  className="hidden"
                />
                <FaMars className="text-base" />
                <span>Male</span>
              </label>

              <label
                className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl cursor-pointer transition-all duration-200 border text-sm font-medium ${
                  signupData.gender === "female"
                    ? "bg-pink-600/20 border-pink-500/50 text-pink-300 shadow-sm shadow-pink-500/20"
                    : "glass-input text-slate-400 hover:text-slate-200"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={signupData.gender === "female"}
                  onChange={handleInputChange}
                  className="hidden"
                />
                <FaVenus className="text-base" />
                <span>Female</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={buttonLoading}
            className="mt-3 w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {buttonLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                <span>Creating account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-white/5">
          <p className="text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Signup;