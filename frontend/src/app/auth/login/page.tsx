"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, Lock, Mail, Smartphone, ArrowRight, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function StudentLoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"password" | "otp">("password");

  // Email / Password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Mobile / OTP state
  const [mobile, setMobile] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetchApi("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      localStorage.setItem("examhub_token", res.access_token);
      localStorage.setItem("examhub_user", JSON.stringify(res.user));
      window.location.href = "/dashboard";
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid email or password");
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
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetchApi("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ mobile: mobile.trim(), otp: otp.trim() }),
      });
      localStorage.setItem("examhub_token", res.access_token);
      localStorage.setItem("examhub_user", JSON.stringify(res.user));
      window.location.href = "/dashboard";
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-8 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#102D59] text-white flex items-center justify-center mx-auto shadow-md border border-blue-900/40">
            <Award className="w-6 h-6 text-amber-300" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Student Login</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Access your saved scorecards, admit cards & documents</p>
        </div>

        {/* Auth method tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400">
          <button
            onClick={() => { setActiveTab("password"); setErrorMsg(null); }}
            className={`py-2 rounded-lg transition-all ${
              activeTab === "password" ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm" : "hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Email & Password
          </button>
          <button
            onClick={() => { setActiveTab("otp"); setErrorMsg(null); }}
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

        {/* Email & Password Form */}
        {activeTab === "password" ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@examhub.in"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end text-xs">
              <Link href="/auth/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#102D59] hover:bg-blue-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Sign In to Vault</span>}
            </button>
          </form>
        ) : (
          /* Mobile OTP Form */
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Mobile Number (10 Digits)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-500 dark:text-slate-400 font-bold">+91</span>
                    <input
                      type="tel"
                      value={mobile}
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
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    required
                    className="w-full text-center tracking-widest text-lg font-bold py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify & Login</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-center text-xs text-slate-500 dark:text-slate-400 hover:underline"
                >
                  Change Mobile Number
                </button>
              </form>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          <span>Don't have an account? </span>
          <Link href="/auth/register" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
