import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUserThunk,
  verifyOtpThunk,
  resendOtpThunk,
  forgotPasswordThunk,
  resetPasswordThunk,
  socialLoginThunk,
} from "../../store/slice/user/user.thunk";
import toast from "react-hot-toast";
import { IoChatbubblesSharp, IoShieldCheckmarkSharp } from "react-icons/io5";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiRefreshCw,
  FiCheckCircle,
  FiX,
  FiKey,
} from "react-icons/fi";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, buttonLoading } = useSelector(
    (state) => state.userReducer
  );

  // Flow step: 'credentials' | 'verify-otp' | 'forgot-password' | 'reset-password'
  const [step, setStep] = useState("credentials");

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Social login modals
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showFacebookModal, setShowFacebookModal] = useState(false);
  const [socialCustomEmail, setSocialCustomEmail] = useState("");

  // Form credentials
  const [loginData, setLoginData] = useState({
    email: "chouhangeetanjali39@gmail.com",
    password: "",
  });

  // Login OTP State
  const [otpData, setOtpData] = useState({
    userId: "",
    email: "",
    previewOtp: "",
  });

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetData, setResetData] = useState({
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
    previewOtp: "",
  });

  // 6-digit OTP boxes for Login
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  // Resend OTP countdown
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Resend timer countdown
  useEffect(() => {
    let timer;
    if (step === "verify-otp" && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  // Handle credentials form change
  const handleInputChange = (e) => {
    setLoginData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ================= STEP 1: LOGIN SUBMIT =================
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!loginData.email.trim() || !loginData.password.trim()) {
      return toast.error("Please enter your email and password");
    }

    const actionResult = await dispatch(
      loginUserThunk({
        email: loginData.email.trim(),
        password: loginData.password,
      })
    );

    if (actionResult?.payload?.success) {
      if (actionResult.payload.requireOtp) {
        setOtpData({
          userId: actionResult.payload.responseData?.userId || "",
          email:
            actionResult.payload.responseData?.email || loginData.email.trim(),
          previewOtp: actionResult.payload.responseData?.previewOtp || "",
        });
        setOtp(["", "", "", "", "", ""]);
        setStep("verify-otp");
        setResendCooldown(60);
        setTimeout(() => {
          if (inputRefs.current[0]) inputRefs.current[0].focus();
        }, 150);
      } else {
        navigate("/");
      }
    }
  };

  // ================= STEP 2: OTP DIGIT HANDLING =================
  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    if (value.length > 1) {
      const digits = value.slice(0, 6).split("");
      digits.forEach((digit, idx) => {
        if (index + idx < 6) newOtp[index + idx] = digit;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(index + digits.length, 5);
      if (inputRefs.current[nextFocus]) inputRefs.current[nextFocus].focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      handleVerifyOtpSubmit(e);
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, 6).split("");
    const newOtp = [...otp];
    digits.forEach((digit, idx) => {
      newOtp[idx] = digit;
    });
    setOtp(newOtp);

    const nextFocus = Math.min(digits.length, 5);
    if (inputRefs.current[nextFocus]) {
      inputRefs.current[nextFocus].focus();
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      return toast.error("Please enter the complete 6-digit verification code");
    }

    const actionResult = await dispatch(
      verifyOtpThunk({
        userId: otpData.userId,
        email: otpData.email,
        otp: fullOtp,
      })
    );

    if (actionResult?.payload?.success) {
      navigate("/");
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      const actionResult = await dispatch(
        resendOtpThunk({
          userId: otpData.userId,
          email: otpData.email,
        })
      );
      if (actionResult?.payload?.success) {
        setResendCooldown(60);
        if (actionResult.payload.responseData?.previewOtp) {
          setOtpData((prev) => ({
            ...prev,
            previewOtp: actionResult.payload.responseData.previewOtp,
          }));
        }
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleAutoFillOtp = () => {
    if (!otpData.previewOtp) return;
    const digits = otpData.previewOtp.slice(0, 6).split("");
    setOtp(digits);
    if (inputRefs.current[5]) inputRefs.current[5].focus();
  };

  // ================= FORGOT PASSWORD WORKFLOW =================
  const handleOpenForgotPassword = () => {
    setForgotEmail(loginData.email || "");
    setResetData({
      otp: "",
      newPassword: "",
      confirmNewPassword: "",
      previewOtp: "",
    });
    setStep("forgot-password");
  };

  const handleSendForgotPasswordCode = async (e) => {
    if (e) e.preventDefault();
    if (!forgotEmail.trim()) {
      return toast.error("Please enter your registered email address");
    }

    const actionResult = await dispatch(
      forgotPasswordThunk({ email: forgotEmail.trim() })
    );

    if (actionResult?.payload?.success) {
      if (actionResult.payload.responseData?.previewOtp) {
        setResetData((prev) => ({
          ...prev,
          previewOtp: actionResult.payload.responseData.previewOtp,
          otp: actionResult.payload.responseData.previewOtp, // auto-fill preview
        }));
      }
      setStep("reset-password");
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!resetData.otp.trim()) {
      return toast.error("Please enter the 6-digit reset code");
    }
    if (!resetData.newPassword.trim()) {
      return toast.error("Please enter a new password");
    }
    if (resetData.newPassword !== resetData.confirmNewPassword) {
      return toast.error("Passwords do not match");
    }

    const actionResult = await dispatch(
      resetPasswordThunk({
        email: forgotEmail.trim(),
        otp: resetData.otp.trim(),
        newPassword: resetData.newPassword,
      })
    );

    if (actionResult?.payload?.success) {
      navigate("/");
    }
  };

  // ================= SOCIAL LOGIN (GOOGLE / FACEBOOK) =================
  const handlePerformSocialLogin = async (provider, emailToUse, nameToUse) => {
    const email = emailToUse || loginData.email || "chouhangeetanjali39@gmail.com";
    const fullName =
      nameToUse ||
      (email.includes("geetanjali")
        ? "Geetanjali Chouhan"
        : email.split("@")[0]);

    setShowGoogleModal(false);
    setShowFacebookModal(false);

    const actionResult = await dispatch(
      socialLoginThunk({
        provider,
        email,
        fullName,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
      })
    );

    if (actionResult?.payload?.success) {
      navigate("/");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-8 overflow-hidden bg-[#070a13]">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 -left-28 w-96 h-96 bg-purple-700/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-28 w-96 h-96 bg-indigo-600/25 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative w-full max-w-[440px] bg-[#0f1423]/90 border border-white/10 shadow-2xl shadow-purple-950/40 rounded-[2.5rem] p-7 sm:p-9 flex flex-col gap-6 z-10 backdrop-blur-2xl transition-all duration-300">

        {/* ================= STEP 1: LOGIN (EMAIL & PASSWORD) ================= */}
        {step === "credentials" && (
          <>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-500 flex items-center justify-center shadow-xl shadow-purple-600/35 ring-1 ring-white/20">
                <IoChatbubblesSharp className="text-3xl text-white drop-shadow" />
              </div>
              <span className="text-[11px] font-bold tracking-widest uppercase bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent mt-2">
                GUPSHUP MESSENGER
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">
                Welcome back
              </h1>
              <p className="text-xs text-slate-400">
                Sign in to start chatting with your friends
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 mt-1">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300 ml-1">
                  Email
                </label>
                <div className="bg-[#151b2d] border border-white/10 hover:border-purple-500/40 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 rounded-2xl px-4 py-3 flex items-center gap-3 transition-all">
                  <FiMail className="text-slate-400 text-lg flex-shrink-0" />
                  <input
                    type="text"
                    name="email"
                    autoComplete="email"
                    className="w-full bg-transparent outline-none text-sm text-white placeholder-slate-500"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300 ml-1">
                  Password
                </label>
                <div className="bg-[#151b2d] border border-white/10 hover:border-purple-500/40 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 rounded-2xl px-4 py-3 flex items-center gap-3 transition-all">
                  <FiLock className="text-slate-400 text-lg flex-shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    className="w-full bg-transparent outline-none text-sm text-white placeholder-slate-500"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <FiEyeOff className="text-base" />
                    ) : (
                      <FiEye className="text-base" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs px-1 pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#151b2d] border-white/20 text-purple-600 focus:ring-purple-500/30 accent-purple-600"
                  />
                  <span>Remember Me</span>
                </label>

                <button
                  type="button"
                  onClick={handleOpenForgotPassword}
                  className="text-slate-400 hover:text-purple-300 transition-colors cursor-pointer font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={buttonLoading}
                className="mt-2 w-full py-3.5 px-4 rounded-2xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {buttonLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-slate-500 font-medium lowercase">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Social Logins */}
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setShowFacebookModal(true)}
                className="w-12 h-12 rounded-2xl bg-[#151b2d] border border-white/10 hover:border-blue-500/50 hover:bg-blue-600/10 flex items-center justify-center text-slate-300 hover:text-blue-400 transition-all shadow-md active:scale-95 cursor-pointer group"
                title="Sign in with Facebook"
              >
                <FaFacebookF className="text-lg group-hover:scale-110 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                className="w-12 h-12 rounded-2xl bg-[#151b2d] border border-white/10 hover:border-purple-500/50 hover:bg-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md active:scale-95 cursor-pointer group"
                title="Sign in with Google"
              >
                <FcGoogle className="text-2xl group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Footer */}
            <div className="text-center pt-2 border-t border-white/5">
              <p className="text-xs sm:text-sm text-slate-400">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1 hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </>
        )}

        {/* ================= STEP 2: VERIFY YOUR EMAIL (OTP SCREEN) ================= */}
        {step === "verify-otp" && (
          <>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep("credentials")}
                className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              >
                <FiArrowLeft className="text-base" />
                <span>Back</span>
              </button>
              <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
                Step 2 of 2
              </span>
            </div>

            {/* Glowing 3D Padlock */}
            <div className="flex flex-col items-center text-center mt-1">
              <div className="relative mb-5 flex items-center justify-center">
                <div className="absolute w-28 h-28 bg-purple-600/40 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-900/60 via-purple-600/40 to-indigo-600/60 border border-purple-400/40 shadow-2xl shadow-purple-600/50 flex items-center justify-center backdrop-blur-xl">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/60">
                    <IoShieldCheckmarkSharp className="text-3xl text-white drop-shadow" />
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-lg bg-indigo-500/80 border border-white/20 flex items-center justify-center text-[10px] text-white shadow">
                    OTP
                  </div>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Verify Your Email
              </h2>
              <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
                We've sent a 6-digit verification code to
              </p>
              <div className="mt-1 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-300">
                {otpData.email}
              </div>
            </div>

            {/* Dev Mode OTP auto-fill badge */}
            {otpData.previewOtp && (
              <div
                onClick={handleAutoFillOtp}
                className="bg-indigo-950/70 border border-indigo-500/30 rounded-2xl p-2.5 text-center cursor-pointer hover:bg-indigo-900/50 hover:border-indigo-400/50 transition-all select-none"
                title="Click to automatically fill code"
              >
                <p className="text-[11px] text-indigo-300">
                  <span className="font-semibold text-purple-300">
                    Dev Mode Code:
                  </span>{" "}
                  <span className="font-mono font-bold tracking-widest text-white text-sm bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/40">
                    {otpData.previewOtp}
                  </span>
                  <span className="block text-[10px] text-indigo-400/80 mt-0.5">
                    (Click to auto-fill)
                  </span>
                </p>
              </div>
            )}

            {/* 6-Digit OTP Boxes */}
            <form onSubmit={handleVerifyOtpSubmit} className="flex flex-col gap-5 mt-1">
              <div
                className="grid grid-cols-6 gap-2 sm:gap-2.5"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`w-full aspect-square text-center text-lg sm:text-xl font-bold rounded-2xl bg-[#151b2d] border transition-all outline-none text-white ${
                      digit
                        ? "border-purple-500 ring-2 ring-purple-500/30 bg-purple-950/20 shadow-md shadow-purple-950/50"
                        : "border-white/10 hover:border-white/25 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    }`}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={buttonLoading || otp.join("").length !== 6}
                className="w-full py-3.5 px-4 rounded-2xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {buttonLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  "Verify Code"
                )}
              </button>
            </form>

            <div className="text-center pt-1 flex flex-col items-center gap-1.5">
              <p className="text-xs text-slate-400">
                Didn't receive the code?{" "}
                {resendCooldown > 0 ? (
                  <span className="text-slate-500 font-medium">
                    Resend in{" "}
                    <span className="text-purple-300 font-mono">
                      {resendCooldown}s
                    </span>
                  </span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="text-purple-400 hover:text-purple-300 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    {isResending && <FiRefreshCw className="animate-spin text-xs" />}
                    <span>Resend</span>
                  </button>
                )}
              </p>

              <button
                type="button"
                onClick={() => setStep("credentials")}
                className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors underline cursor-pointer mt-1"
              >
                Use a different email / password
              </button>
            </div>
          </>
        )}

        {/* ================= FORGOT PASSWORD: STEP A (ENTER EMAIL) ================= */}
        {step === "forgot-password" && (
          <>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep("credentials")}
                className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              >
                <FiArrowLeft className="text-base" />
                <span>Back to Login</span>
              </button>
              <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
                Reset Password
              </span>
            </div>

            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-xl shadow-purple-600/35 ring-1 ring-white/20 mb-3">
                <FiKey className="text-3xl text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Forgot Password?
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                Enter your registered email address and we'll send you a 6-digit verification code to reset your password.
              </p>
            </div>

            <form onSubmit={handleSendForgotPasswordCode} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300 ml-1">
                  Email Address
                </label>
                <div className="bg-[#151b2d] border border-white/10 hover:border-purple-500/40 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 rounded-2xl px-4 py-3 flex items-center gap-3 transition-all">
                  <FiMail className="text-slate-400 text-lg flex-shrink-0" />
                  <input
                    type="email"
                    className="w-full bg-transparent outline-none text-sm text-white placeholder-slate-500"
                    placeholder="Enter your registered email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={buttonLoading || !forgotEmail.trim()}
                className="mt-2 w-full py-3.5 px-4 rounded-2xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {buttonLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    <span>Sending Code...</span>
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </button>
            </form>
          </>
        )}

        {/* ================= FORGOT PASSWORD: STEP B (RESET WITH OTP) ================= */}
        {step === "reset-password" && (
          <>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep("forgot-password")}
                className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              >
                <FiArrowLeft className="text-base" />
                <span>Change Email</span>
              </button>
              <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
                New Password
              </span>
            </div>

            <div className="flex flex-col items-center text-center mt-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Set New Password
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Code sent to <span className="text-purple-300 font-medium">{forgotEmail}</span>
              </p>
            </div>

            {/* Dev Mode OTP auto-fill badge */}
            {resetData.previewOtp && (
              <div
                onClick={() =>
                  setResetData((prev) => ({ ...prev, otp: prev.previewOtp }))
                }
                className="bg-indigo-950/70 border border-indigo-500/30 rounded-2xl p-2.5 text-center cursor-pointer hover:bg-indigo-900/50 hover:border-indigo-400/50 transition-all select-none"
              >
                <p className="text-[11px] text-indigo-300">
                  <span className="font-semibold text-purple-300">
                    Reset Code:
                  </span>{" "}
                  <span className="font-mono font-bold tracking-widest text-white text-sm bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/40">
                    {resetData.previewOtp}
                  </span>
                  <span className="block text-[10px] text-indigo-400/80 mt-0.5">
                    (Click to auto-fill)
                  </span>
                </p>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="flex flex-col gap-3.5 mt-1">
              {/* Reset Code Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300 ml-1">
                  6-Digit Verification Code
                </label>
                <div className="bg-[#151b2d] border border-white/10 hover:border-purple-500/40 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 rounded-2xl px-4 py-3 flex items-center gap-3 transition-all">
                  <FiKey className="text-slate-400 text-lg flex-shrink-0" />
                  <input
                    type="text"
                    maxLength={6}
                    className="w-full bg-transparent outline-none text-sm text-white placeholder-slate-500 font-mono tracking-widest font-semibold"
                    placeholder="123456"
                    value={resetData.otp}
                    onChange={(e) =>
                      setResetData((prev) => ({
                        ...prev,
                        otp: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    required
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300 ml-1">
                  New Password
                </label>
                <div className="bg-[#151b2d] border border-white/10 hover:border-purple-500/40 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 rounded-2xl px-4 py-3 flex items-center gap-3 transition-all">
                  <FiLock className="text-slate-400 text-lg flex-shrink-0" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="w-full bg-transparent outline-none text-sm text-white placeholder-slate-500"
                    placeholder="Enter new password"
                    value={resetData.newPassword}
                    onChange={(e) =>
                      setResetData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300 ml-1">
                  Confirm New Password
                </label>
                <div className="bg-[#151b2d] border border-white/10 hover:border-purple-500/40 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 rounded-2xl px-4 py-3 flex items-center gap-3 transition-all">
                  <FiLock className="text-slate-400 text-lg flex-shrink-0" />
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    className="w-full bg-transparent outline-none text-sm text-white placeholder-slate-500"
                    placeholder="Repeat new password"
                    value={resetData.confirmNewPassword}
                    onChange={(e) =>
                      setResetData((prev) => ({
                        ...prev,
                        confirmNewPassword: e.target.value,
                      }))
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmNewPassword(!showConfirmNewPassword)
                    }
                    className="text-slate-400 hover:text-slate-200"
                  >
                    {showConfirmNewPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  buttonLoading ||
                  !resetData.otp ||
                  !resetData.newPassword ||
                  !resetData.confirmNewPassword
                }
                className="mt-2 w-full py-3.5 px-4 rounded-2xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {buttonLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  "Reset Password & Sign In"
                )}
              </button>
            </form>
          </>
        )}

      </div>

      {/* ================= GOOGLE SIGN-IN POPUP MODAL ================= */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#161a2b] border border-white/15 rounded-3xl p-6 shadow-2xl shadow-black/80 flex flex-col gap-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FcGoogle className="text-2xl" />
                <span className="text-sm font-semibold text-slate-200">
                  Sign in with Google
                </span>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Choose an account to continue to <span className="font-semibold text-slate-200">GupShup Messenger</span>
            </p>

            {/* Default detected account */}
            <div
              onClick={() =>
                handlePerformSocialLogin(
                  "google",
                  loginData.email || "chouhangeetanjali39@gmail.com",
                  "Geetanjali Chouhan"
                )
              }
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow">
                G
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold truncate text-white">
                  Geetanjali Chouhan
                </h4>
                <p className="text-xs text-slate-400 truncate">
                  {loginData.email || "chouhangeetanjali39@gmail.com"}
                </p>
              </div>
              <FiCheckCircle className="text-purple-400 text-lg flex-shrink-0" />
            </div>

            {/* Custom Google account input */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <label className="text-[11px] text-slate-400 font-medium">
                Or sign in with another Google account:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  className="flex-1 bg-[#0f1423] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                  value={socialCustomEmail}
                  onChange={(e) => setSocialCustomEmail(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!socialCustomEmail.trim()) {
                      return toast.error("Please enter a valid Gmail address");
                    }
                    handlePerformSocialLogin("google", socialCustomEmail.trim());
                  }}
                  className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-xs font-semibold text-white cursor-pointer shadow"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= FACEBOOK SIGN-IN POPUP MODAL ================= */}
      {showFacebookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#161a2b] border border-white/15 rounded-3xl p-6 shadow-2xl shadow-black/80 flex flex-col gap-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                  <FaFacebookF />
                </div>
                <span className="text-sm font-semibold text-slate-200">
                  Log in with Facebook
                </span>
              </div>
              <button
                onClick={() => setShowFacebookModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Continue to GupShup Messenger using your Facebook profile.
            </p>

            <button
              onClick={() =>
                handlePerformSocialLogin(
                  "facebook",
                  loginData.email || "chouhangeetanjali39@gmail.com",
                  "Geetanjali Chouhan"
                )
              }
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
            >
              <FaFacebookF className="text-base" />
              <span>Continue as Geetanjali</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;