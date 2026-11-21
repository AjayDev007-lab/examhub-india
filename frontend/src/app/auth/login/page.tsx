"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Award, Lock, Mail, Smartphone, ArrowRight, AlertCircle, 
  RefreshCw, CheckCircle2, Eye, EyeOff, Sparkles, ShieldCheck 
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import Student3DMascot, { MascotState } from "@/components/Student3DMascot";

export default function StudentLoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"password" | "otp">("password");

  // 3D Mascot Reactive State
  const [mascotState, setMascotState] = useState<MascotState>("welcome");
  const [typingProgress, setTypingProgress] = useState(0);

  // Email / Password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Mobile / OTP state
  const [mobile, setMobile] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Handle Mascot reaction on email typing
  const handleEmailChange = (val: string) => {
    setEmail(val);
    setTypingProgress(Math.min(val.length / 28, 1));
    if (mascotState !== "email") {
      setMascotState("email");
    }
  };

  // Toggle Password visibility with Mascot reaction
  const togglePasswordVisibility = () => {
    const nextShow = !showPassword;
    setShowPassword(nextShow);
    if (nextShow) {
      setMascotState("password_peek"); // Scene 4: Peeking between fingers
    } else {
      setMascotState("password_hide"); // Scene 3: Covering both eyes
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setMascotState("waiting"); // Scene 5: Excited & hopeful waiting for authentication

    try {
      const res = await fetchApi("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      localStorage.setItem("examhub_token", res.access_token);
      localStorage.setItem("examhub_user", JSON.stringify(res.user));
      
      // Scene 6: Celebration jump, arms raised, confetti!
      setLoginSuccess(true);
      setMascotState("success");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid email or password");
      setMascotState("welcome");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || mobile.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setMascotState("waiting");

    try {
      const res = await fetchApi("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ mobile: mobile.trim() }),
      });
      setOtpSent(true);
      if (res.debug_demo_otp) {
        setDemoOtp(res.debug_demo_otp);
        setOtp(res.debug_demo_otp); // auto-fill for convenience
      }
      setMascotState("email");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send OTP");
      setMascotState("welcome");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setMascotState("waiting"); // Scene 5: Authenticating

    try {
      const res = await fetchApi("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ mobile: mobile.trim(), otp: otp.trim() }),
      });
      localStorage.setItem("examhub_token", res.access_token);
      localStorage.setItem("examhub_user", JSON.stringify(res.user));
      
      // Scene 6: Celebration
      setLoginSuccess(true);
      setMascotState("success");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid or expired OTP");
      setMascotState("welcome");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-slate-50/60 dark:bg-slate-950">
      <div className="max-w-6xl w-full mx-auto">
        {/* Page Top Heading */}
        <div className="text-center mb-8 space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Interactive 3D Student Mascot</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Student Login & Career Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Interact with our animated 3D student mascot while accessing all 100% free government exams, job alerts & results.
          </p>
        </div>

        {/* 16:9 Landscape Composition: Mascot Left, Form Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: 3D Animated Student Mascot & Cinema Reel (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <Student3DMascot
              currentState={mascotState}
              onStateChange={(st) => setMascotState(st)}
              typingProgress={typingProgress}
              showCinemaReelControl={true}
              className="w-full"
            />
          </div>

          {/* RIGHT: Login Card Form (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
            {/* Header info */}
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-[#102D59] text-white flex items-center justify-center shadow-md border border-blue-900/40 shrink-0">
                <Award className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Student Sign In</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">100% Free · No Payment Required</p>
              </div>
            </div>

            {/* Auth method tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400">
              <button
                type="button"
                onClick={() => { 
                  setActiveTab("password"); 
                  setErrorMsg(null); 
                  setMascotState("welcome");
                }}
                className={`py-2 rounded-lg transition-all ${
                  activeTab === "password" ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm" : "hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Email & Password
              </button>
              <button
                type="button"
                onClick={() => { 
                  setActiveTab("otp"); 
                  setErrorMsg(null); 
                  setMascotState("welcome");
                }}
                className={`py-2 rounded-lg transition-all ${
                  activeTab === "otp" ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm" : "hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Mobile OTP
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {loginSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Authentication successful! Redirecting to dashboard...</span>
              </div>
            )}

            {/* Email & Password Form */}
            {activeTab === "password" ? (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                {/* Email Field - Scene 2: Mascot Turns Eyes & Follows Typing */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onFocus={() => setMascotState("email")}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="student@examhub.in"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Password Field - Scene 3 / Scene 4: Mascot Covers Eyes or Peeks */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPassword ? "Hide (Hands on Eyes)" : "Show (Mascot Peeks)"}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onFocus={() => {
                        if (showPassword) {
                          setMascotState("password_peek");
                        } else {
                          setMascotState("password_hide");
                        }
                      }}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end text-xs">
                  <Link href="/auth/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button - Scene 5: Mascot waits eagerly */}
                <button
                  type="submit"
                  disabled={loading || loginSuccess}
                  onMouseEnter={() => {
                    if (mascotState !== "password_hide" && mascotState !== "password_peek") {
                      setMascotState("waiting");
                    }
                  }}
                  className="w-full py-3 bg-[#102D59] hover:bg-blue-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Sign In to Student Vault</span>
                  )}
                </button>
              </form>
            ) : (
              /* Mobile OTP Form */
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                        Mobile Number (10 Digits)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-slate-500 dark:text-slate-400 font-bold">+91</span>
                        <input
                          type="tel"
                          value={mobile}
                          onFocus={() => setMascotState("email")}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="9876543210"
                          maxLength={10}
                          required
                          className="w-full pl-12 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white font-medium"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      onMouseEnter={() => setMascotState("waiting")}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Send OTP</span>}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-200">
                      <span>OTP sent to +91 {mobile}. Valid for 5 minutes.</span>
                      {demoOtp && (
                        <div className="mt-1 font-bold text-emerald-700 dark:text-emerald-400">
                          Auto-filled Demo OTP: {demoOtp}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                        Enter 6-Digit OTP
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onFocus={() => setMascotState("email")}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        required
                        className="w-full text-center tracking-widest text-lg font-bold py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || loginSuccess}
                      onMouseEnter={() => setMascotState("waiting")}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify & Login</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setMascotState("welcome");
                      }}
                      className="w-full text-center text-xs text-slate-500 dark:text-slate-400 hover:underline"
                    >
                      Change Mobile Number
                    </button>
                  </form>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <div>
                <span>Don&apos;t have an account? </span>
                <Link href="/auth/register" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                  Register now (100% Free)
                </Link>
              </div>

              <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-400">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Zero Subscription & Payment-Free Platform Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
