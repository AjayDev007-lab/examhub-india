"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  KeyRound, Lock, Mail, ArrowRight, AlertCircle, 
  CheckCircle2, RefreshCw, Zap, Award, ArrowLeft, ShieldCheck
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [identifier, setIdentifier] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Step 1: Request recovery token
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg("Please enter your registered email address or mobile number");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetchApi("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      setSuccessMsg(res.message || "Recovery instructions dispatched.");
      if (res.debug_reset_token) {
        setResetToken(res.debug_reset_token);
      }
      setStep("reset");
    } catch (err: any) {
      setErrorMsg(err.message || "Unable to request password recovery. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Set new password with token
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters");
      return;
    }
    if (!resetToken.trim()) {
      setErrorMsg("Recovery token is required");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetchApi("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token: resetToken.trim(),
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      setSuccessMsg(res.message || "Password successfully reset!");
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password. Token may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#070F26] text-white flex flex-col justify-between selection:bg-cyan-500 selection:text-black font-sans">
      {/* 1. Ambient Background Glow & Geometric Web Lines */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[160px]" />
        <div className="absolute -bottom-20 right-10 w-[450px] h-[450px] bg-red-600/15 rounded-full blur-[150px]" />
        
        {/* Geometric Web SVG Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50%" cy="50%" r="200" fill="none" stroke="#06B6D4" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="50%" cy="50%" r="400" fill="none" stroke="#06B6D4" strokeWidth="1" strokeDasharray="6 6" />
          <line x1="50%" y1="50%" x2="0%" y2="0%" stroke="#38BDF8" strokeWidth="1" />
          <line x1="50%" y1="50%" x2="100%" y2="0%" stroke="#38BDF8" strokeWidth="1" />
          <line x1="50%" y1="50%" x2="0%" y2="100%" stroke="#38BDF8" strokeWidth="1" />
          <line x1="50%" y1="50%" x2="100%" y2="100%" stroke="#38BDF8" strokeWidth="1" />
        </svg>
      </div>

      {/* 2. Top Nav Bar */}
      <header className="relative z-20 max-w-5xl w-full mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 via-blue-700 to-cyan-500 p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#070F26] rounded-[14px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <span className="font-black text-sm tracking-widest uppercase bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
              EXAMHUB INDIA
            </span>
            <p className="text-[10px] text-cyan-400/80 font-semibold tracking-wider uppercase">
              Account Security & Recovery
            </p>
          </div>
        </Link>

        <Link
          href="/auth/login"
          className="text-xs text-slate-300 hover:text-cyan-300 font-semibold transition-colors flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>
      </header>

      {/* 3. Main Glass Card */}
      <main className="relative z-10 max-w-md w-full mx-auto px-4 py-8 my-auto">
        <div className="relative rounded-[28px] bg-slate-900/80 backdrop-blur-2xl border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.18)] p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-1.5 pb-2 border-b border-cyan-500/20">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-0.5 mx-auto shadow-md">
              <div className="w-full h-full bg-[#070F26] rounded-[14px] flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white pt-1">
              {step === "request" ? "Recover Your Password" : "Set New Secure Password"}
            </h1>
            <p className="text-xs text-cyan-200/80">
              {step === "request" 
                ? "Enter your registered email address or 10-digit mobile number." 
                : "Enter your single-use recovery token and choose a new password."}
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-500/60 text-red-300 text-xs rounded-xl flex items-center space-x-2 shadow-inner">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs rounded-xl flex items-center space-x-2 shadow-inner">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === "request" ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-200">
                  Registered Email or Mobile
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400/70" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="[ student@examhub.in or mobile ]"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-cyan-500/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-white/[0.1] transition-all shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm tracking-widest uppercase text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:from-blue-500 hover:via-cyan-500 hover:to-blue-600 border border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.4)] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>[ SEND RECOVERY INSTRUCTIONS ]</span>
                    <ArrowRight className="w-4 h-4 text-cyan-200" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-200">
                  Recovery Token *
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400/70" />
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="[ Enter recovery token ]"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-cyan-500/30 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-white/[0.1] transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-200">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400/70" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="[ Min 8 characters ]"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-cyan-500/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-white/[0.1] transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-200">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400/70" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="[ Re-type new password ]"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-cyan-500/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-white/[0.1] transition-all shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm tracking-widest uppercase text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:from-blue-500 hover:via-cyan-500 hover:to-blue-600 border border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.4)] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <span>[ UPDATE PASSWORD & LOGIN ]</span>
                )}
              </button>
            </form>
          )}

          {/* Footer Back Link */}
          <div className="pt-2 border-t border-cyan-500/20 text-center">
            <Link
              href="/auth/login"
              className="text-xs text-cyan-300 hover:text-white font-bold transition-colors inline-flex items-center space-x-1"
            >
              <span>← Return to Student Login</span>
            </Link>
          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-4 py-3 text-center text-[11px] text-slate-500 border-t border-cyan-500/10">
        <span>© 2026 EXAMHUB INDIA. 256-Bit Encrypted Account Recovery. 100% Free.</span>
      </footer>
    </div>
  );
}
