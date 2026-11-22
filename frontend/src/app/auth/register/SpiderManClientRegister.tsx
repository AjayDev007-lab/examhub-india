"use client";

import React, { useState, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock, Mail, User, Phone, ArrowRight, AlertCircle, RefreshCw,
  CheckCircle2, Eye, EyeOff, Zap, Award, Volume2, VolumeX,
  GraduationCap, BookOpen, ShieldCheck, Check
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import SpiderManLive3DCanvas, { SpiderManActionState } from "@/components/SpiderManLive3DCanvas";
import { soundEngine } from "@/lib/spidermanAudio";

export default function SpiderManClientRegister() {
  const router = useRouter();

  // 3D Superhero Animation Controller State
  const [spiderAction, setSpiderAction] = useState<SpiderManActionState>("idle");
  const [typingProgress, setTypingProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // Form State - Starts completely empty
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Password Strength Calculation
  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "bg-slate-700", textColor: "text-slate-500" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    switch (score) {
      case 1:
        return { score: 1, label: "Weak", color: "bg-red-500", textColor: "text-red-400" };
      case 2:
        return { score: 2, label: "Fair", color: "bg-amber-500", textColor: "text-amber-400" };
      case 3:
        return { score: 3, label: "Good", color: "bg-cyan-400", textColor: "text-cyan-300" };
      case 4:
        return { score: 4, label: "Strong", color: "bg-emerald-400", textColor: "text-emerald-400" };
      default:
        return { score: 0, label: "Very Weak", color: "bg-red-600", textColor: "text-red-500" };
    }
  };

  const pwdStrength = calculatePasswordStrength(password);

  // Sound Engine Toggle
  const toggleSound = () => {
    const nextMuted = soundEngine.toggleMuted();
    setIsMuted(nextMuted);
  };

  // Safe Input Interaction Event Handlers (No private values exposed)
  const handleNameChange = (val: string) => {
    setFullName(val);
    setTypingProgress(Math.min(val.length / 20, 1));
    if (spiderAction !== "type_email") {
      setSpiderAction("type_email");
    }
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    setTypingProgress(Math.min(val.length / 28, 1));
    if (spiderAction !== "type_email") {
      setSpiderAction("type_email");
    }
  };

  const togglePasswordVisibility = () => {
    const nextShow = !showPassword;
    setShowPassword(nextShow);
    if (nextShow) {
      setSpiderAction("peek");
    } else {
      setSpiderAction("cover_eyes");
    }
  };

  const toggleConfirmPasswordVisibility = () => {
    const nextShow = !showConfirmPassword;
    setShowConfirmPassword(nextShow);
    if (nextShow) {
      setSpiderAction("peek");
    } else {
      setSpiderAction("cover_eyes");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMsg("Please enter your full name");
      setSpiderAction("error");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address");
      setSpiderAction("error");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long");
      setSpiderAction("error");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      setSpiderAction("error");
      return;
    }
    if (!termsAccepted) {
      setErrorMsg("Please agree to the Terms of Service and Privacy Policy");
      setSpiderAction("error");
      return;
    }

    setLoading(true);
    setSpiderAction("focused_login"); // Superhero power stance

    try {
      const res = await fetchApi("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          mobile: mobile.trim() || undefined,
          password,
          password_confirm: confirmPassword,
        }),
      });

      localStorage.setItem("examhub_token", res.access_token);
      localStorage.setItem("examhub_user", JSON.stringify(res.user));

      setRegisterSuccess(true);
      setSpiderAction("celebrate"); // High jump and celebratory chimes!

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1600);
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. An account with this email may already exist.");
      setSpiderAction("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#070F26] text-white flex flex-col justify-between selection:bg-cyan-500 selection:text-black font-sans">
      {/* 1. FUTURISTIC BACKGROUND: Web Geometry & Ambient Neon Glow */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[160px]" />
        <div className="absolute -bottom-20 right-10 w-[450px] h-[450px] bg-red-600/15 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-indigo-600/20 rounded-full blur-[130px]" />

        {/* Geometric Web Lines SVG Background */}
        <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="regWebGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.05" />
            </radialGradient>
            <linearGradient id="regStrandGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <circle cx="30%" cy="55%" r="150" fill="none" stroke="url(#regWebGlow)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="30%" cy="55%" r="300" fill="none" stroke="url(#regWebGlow)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="30%" cy="55%" r="480" fill="none" stroke="url(#regWebGlow)" strokeWidth="1" strokeDasharray="6 6" />
          <line x1="30%" y1="55%" x2="0%" y2="15%" stroke="url(#regStrandGlow)" strokeWidth="1.2" />
          <line x1="30%" y1="55%" x2="60%" y2="0%" stroke="url(#regStrandGlow)" strokeWidth="1.2" />
          <line x1="30%" y1="55%" x2="100%" y2="35%" stroke="url(#regStrandGlow)" strokeWidth="1.2" />
          <line x1="30%" y1="55%" x2="100%" y2="75%" stroke="url(#regStrandGlow)" strokeWidth="1.2" />
        </svg>

        {/* Floating Educational Holograms */}
        <div className="absolute top-24 left-[8%] opacity-35 animate-bounce" style={{ animationDuration: "6s" }}>
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <GraduationCap className="w-6 h-6 text-cyan-300" />
          </div>
        </div>
        <div className="absolute bottom-28 left-[38%] opacity-30 animate-bounce" style={{ animationDuration: "8s" }}>
          <div className="w-10 h-10 rounded-2xl bg-blue-950/60 border border-blue-500/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <BookOpen className="w-5 h-5 text-blue-300" />
          </div>
        </div>
      </div>

      {/* 2. TOP NAV BAR */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 via-blue-700 to-cyan-500 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#070F26] rounded-[14px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <span className="font-black text-sm tracking-widest uppercase bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
              EXAMHUB INDIA
            </span>
            <p className="text-[10px] text-cyan-400/80 font-semibold tracking-wider uppercase">
              Free Student Vault Registration
            </p>
          </div>
        </Link>

        {/* Audio Sound FX Toggle & Navigation */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSound}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-xs font-bold text-cyan-300 hover:text-white transition-all backdrop-blur-md shadow-sm"
            title={isMuted ? "Enable Superhero Sound Effects" : "Mute Sound Effects"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />}
            <span className="text-[11px]">{isMuted ? "Sound Muted" : "Sound Enabled"}</span>
          </button>
          <Link
            href="/auth/login"
            className="text-xs text-slate-400 hover:text-cyan-300 font-semibold transition-colors px-2 py-1"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* 3. MAIN CONTENT: BALANCED TWO-COLUMN LANDSCAPE COMPOSITION */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">

          {/* LEFT SECTION: 100% FREE-ROAMING 3D SUPERHERO + COMMUNITY HEADING (7 cols) */}
          <div className="lg:col-span-7 relative flex flex-col items-center lg:items-start justify-center">

            {/* Community Hero Heading */}
            <div className="space-y-2 mb-2 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-bold tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>100% Free Forever • Verified Student Portal</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                Join the ExamHub India Community
              </h2>
              <p className="text-sm text-cyan-200/80 max-w-lg">
                Your journey to exams, results, jobs and new opportunities starts here.
              </p>
            </div>

            {/* 3D Spider-Man Canvas (NO rectangular box, 100% transparent, soft contact floor shadow) */}
            <div className="relative w-full flex items-center justify-center overflow-visible">
              <SpiderManLive3DCanvas
                actionState={spiderAction}
                onStateChange={(st) => setSpiderAction(st)}
                typingProgress={typingProgress}
                className="w-full"
              />
            </div>
          </div>

          {/* RIGHT SECTION: PREMIUM GLASSMORPHISM REGISTRATION CARD (5 cols) */}
          <div className="lg:col-span-5 relative w-full max-w-md mx-auto lg:max-w-none">
            <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-cyan-500/30 via-blue-600/30 to-purple-600/30 blur-xl opacity-70 pointer-events-none" />

            <div className="relative rounded-[28px] bg-slate-900/80 backdrop-blur-2xl border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.18)] p-6 sm:p-7 space-y-4">

              {/* Header Branding */}
              <div className="text-center space-y-1 pb-2 border-b border-cyan-500/20">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 via-blue-700 to-cyan-500 p-0.5 mx-auto shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                  <div className="w-full h-full bg-[#070F26] rounded-[14px] flex items-center justify-center">
                    <Award className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
                <h1 className="text-lg sm:text-xl font-black tracking-widest uppercase bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent mt-1">
                  Create Your Free Account
                </h1>
                <p className="text-xs font-semibold text-cyan-400/90 tracking-wide">
                  Start your journey with ExamHub India.
                </p>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="p-2.5 bg-red-950/60 border border-red-500/60 text-red-300 text-xs rounded-xl flex items-center space-x-2 shadow-inner">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Banner */}
              {registerSuccess && (
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs rounded-xl flex items-center space-x-2 shadow-inner">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Account successfully created! Preparing your student vault...</span>
                </div>
              )}

              {/* Compact, Highly Readable Registration Form */}
              <form onSubmit={handleRegister} className="space-y-3">
                {/* 1. Full Name */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-cyan-200">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-cyan-400/70" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onFocus={() => setSpiderAction("point_email")}
                      onChange={(e) => handleNameChange(e.target.value)}
                      onBlur={() => setSpiderAction("idle")}
                      placeholder="[ Enter your full name ]"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-cyan-500/30 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-white/[0.1] transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* 2. Email Address */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-cyan-200">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-cyan-400/70" />
                    <input
                      type="email"
                      required
                      value={email}
                      onFocus={() => setSpiderAction("point_email")}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      onBlur={() => setSpiderAction("idle")}
                      placeholder="[ Enter your email address ]"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-cyan-500/30 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-white/[0.1] transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* 3. Mobile Number (Optional) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-cyan-200">
                      Mobile Number
                    </label>
                    <span className="text-[10px] text-slate-400 italic">Optional</span>
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-cyan-400/70" />
                    <input
                      type="tel"
                      value={mobile}
                      onFocus={() => setSpiderAction("point_email")}
                      onChange={(e) => setMobile(e.target.value)}
                      onBlur={() => setSpiderAction("idle")}
                      placeholder="[ Enter 10-digit mobile number ]"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-cyan-500/30 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-white/[0.1] transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* 4. Password with Strength Indicator */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-cyan-200">
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPassword ? "Hide" : "Show"}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-cyan-400/70" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onFocus={() => {
                        setSpiderAction(showPassword ? "peek" : "cover_eyes");
                      }}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setSpiderAction("idle")}
                      placeholder="[ Create secure password (min 8 chars) ]"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.06] border border-cyan-500/30 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-white/[0.1] transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3.5 top-3 text-cyan-400/60 hover:text-cyan-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator Bar */}
                  {password && (
                    <div className="pt-1 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Password Strength:</span>
                        <span className={`font-bold ${pwdStrength.textColor}`}>{pwdStrength.label}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 h-1.5 rounded-full overflow-hidden bg-slate-800">
                        <div className={`h-full ${pwdStrength.score >= 1 ? pwdStrength.color : "bg-transparent"}`} />
                        <div className={`h-full ${pwdStrength.score >= 2 ? pwdStrength.color : "bg-transparent"}`} />
                        <div className={`h-full ${pwdStrength.score >= 3 ? pwdStrength.color : "bg-transparent"}`} />
                        <div className={`h-full ${pwdStrength.score >= 4 ? pwdStrength.color : "bg-transparent"}`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Confirm Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-cyan-200">
                      Confirm Password *
                    </label>
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showConfirmPassword ? "Hide" : "Show"}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-cyan-400/70" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onFocus={() => setSpiderAction("look_button")}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => setSpiderAction("idle")}
                      placeholder="[ Re-enter your password ]"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.06] border border-cyan-500/30 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-white/[0.1] transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute right-3.5 top-3 text-cyan-400/60 hover:text-cyan-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Terms & Privacy Policy Acceptance Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-cyan-500/40 bg-slate-900/80 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-300 leading-tight">
                      I accept the{" "}
                      <Link href="/terms" className="text-cyan-300 hover:underline">Terms of Service</Link>
                      {" "}and{" "}
                      <Link href="/privacy" className="text-cyan-300 hover:underline">Privacy Policy (DPDP Act)</Link>.
                    </span>
                  </label>
                </div>

                {/* Glowing Create Account Button */}
                <button
                  type="submit"
                  disabled={loading || registerSuccess}
                  onMouseEnter={() => setSpiderAction("look_button")}
                  onMouseLeave={() => setSpiderAction("idle")}
                  className="w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm tracking-widest uppercase text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-500 hover:from-cyan-300 hover:via-cyan-200 hover:to-cyan-400 border border-cyan-200/50 shadow-[0_0_35px_rgba(6,182,212,0.6)] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 mt-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <span>CREATE FREE ACCOUNT</span>
                      <ArrowRight className="w-4 h-4 text-slate-950 font-bold" />
                    </>
                  )}
                </button>
              </form>

              {/* Already Registered? Sign In */}
              <div className="pt-2 border-t border-cyan-500/20 text-center space-y-1">
                <p className="text-xs text-slate-400">
                  Already have an account?
                </p>
                <Link
                  href="/auth/login"
                  className="inline-block w-full py-2 px-4 rounded-xl text-xs font-bold tracking-wider uppercase text-cyan-300 bg-white/[0.04] hover:bg-white/[0.08] border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-sm"
                >
                  [ SIGN IN ]
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center space-x-4 pt-1 text-[10px] text-slate-400">
                <div className="flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>256-Bit Encrypted Vault</span>
                </div>
                <span>•</span>
                <span>Zero Monetization Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 text-center text-[11px] text-slate-500 border-t border-cyan-500/10">
        <span>© 2026 EXAMHUB INDIA. Progressive National Examination Access Framework. 100% Free.</span>
      </footer>
    </div>
  );
}
