"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Lock, Mail, ArrowRight, AlertCircle, RefreshCw, 
  CheckCircle2, Eye, EyeOff, Zap, Award, Volume2, VolumeX,
  GraduationCap, BookOpen, ShieldCheck
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import SpiderManLive3DCanvas, { SpiderManActionState } from "@/components/SpiderManLive3DCanvas";
import { soundEngine } from "@/lib/spidermanAudio";

export default function SpiderManClientLogin() {
  const router = useRouter();

  // Real-Time 3D Superhero Animation Controller State
  const [spiderAction, setSpiderAction] = useState<SpiderManActionState>("idle");
  const [typingProgress, setTypingProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Sound Engine Toggle
  const toggleSound = () => {
    const nextMuted = soundEngine.toggleMuted();
    setIsMuted(nextMuted);
  };

  // Handle Email typing with live head/eye tracking
  const handleEmailChange = (val: string) => {
    setEmail(val);
    setTypingProgress(Math.min(val.length / 28, 1));
    if (spiderAction !== "type_email") {
      setSpiderAction("type_email");
    }
  };

  // Handle Show/Hide Password with live 3D character reaction
  const togglePasswordVisibility = () => {
    const nextShow = !showPassword;
    setShowPassword(nextShow);
    if (nextShow) {
      setSpiderAction("peek"); // Part fingers to peek!
    } else {
      setSpiderAction("cover_eyes"); // Cover eyes firmly
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSpiderAction("focused_login"); // Superhero focused ready stance

    try {
      const res = await fetchApi("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      localStorage.setItem("examhub_token", res.access_token);
      localStorage.setItem("examhub_user", JSON.stringify(res.user));
      
      setLoginSuccess(true);
      setSpiderAction("celebrate"); // Jumps and celebrates in victory!

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1600);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid email or password");
      setSpiderAction("error"); // Puzzled head scratch
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
            <radialGradient id="webGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.05" />
            </radialGradient>
            <linearGradient id="strandGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <circle cx="30%" cy="55%" r="150" fill="none" stroke="url(#webGlow)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="30%" cy="55%" r="300" fill="none" stroke="url(#webGlow)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="30%" cy="55%" r="480" fill="none" stroke="url(#webGlow)" strokeWidth="1" strokeDasharray="6 6" />
          <line x1="30%" y1="55%" x2="0%" y2="15%" stroke="url(#strandGlow)" strokeWidth="1.2" />
          <line x1="30%" y1="55%" x2="60%" y2="0%" stroke="url(#strandGlow)" strokeWidth="1.2" />
          <line x1="30%" y1="55%" x2="100%" y2="35%" stroke="url(#strandGlow)" strokeWidth="1.2" />
          <line x1="30%" y1="55%" x2="100%" y2="75%" stroke="url(#strandGlow)" strokeWidth="1.2" />
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
              Student Portal
            </p>
          </div>
        </Link>

        {/* Audio Sound FX Toggle & Home Link */}
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
            href="/"
            className="text-xs text-slate-400 hover:text-cyan-300 font-semibold transition-colors px-2 py-1"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* 3. MAIN CONTENT: 16:9 DESKTOP LANDSCAPE COMPOSITION */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center min-h-[580px]">
          
          {/* LEFT SIDE: 100% FREE-ROAMING REAL-TIME 3D SPIDER-MAN CHARACTER (7 cols)
              NO RECTANGULAR BOX, NO CARD BACKGROUND, NO BORDERS, NO CAPTION PANELS */}
          <div className="lg:col-span-7 relative flex items-center justify-center overflow-visible">
            <SpiderManLive3DCanvas
              actionState={spiderAction}
              onStateChange={(st) => setSpiderAction(st)}
              typingProgress={typingProgress}
              className="w-full"
            />
          </div>

          {/* RIGHT SIDE: Premium Glassmorphism Login Card (5 cols) */}
          <div className="lg:col-span-5 relative w-full max-w-md mx-auto lg:max-w-none">
            <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-cyan-500/30 via-blue-600/30 to-purple-600/30 blur-xl opacity-70 pointer-events-none" />

            <div className="relative rounded-[28px] bg-slate-900/75 backdrop-blur-2xl border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.18)] p-6 sm:p-8 space-y-6">
              
              {/* Header Branding */}
              <div className="text-center space-y-1 pb-2 border-b border-cyan-500/20">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 via-blue-700 to-cyan-500 p-0.5 mx-auto shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                  <div className="w-full h-full bg-[#070F26] rounded-[14px] flex items-center justify-center">
                    <Award className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-widest uppercase bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent mt-2">
                  EXAMHUB INDIA
                </h1>
                <p className="text-xs font-semibold text-cyan-400/90 tracking-wide italic">
                  &quot;Your Future Starts Here.&quot;
                </p>
                <h2 className="text-base font-bold text-white pt-1">
                  Welcome Back!
                </h2>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="p-3 bg-red-950/60 border border-red-500/60 text-red-300 text-xs rounded-xl flex items-center space-x-2 shadow-inner">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Banner */}
              {loginSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs rounded-xl flex items-center space-x-2 shadow-inner">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Authentication successful! Entering ExamHub...</span>
                </div>
              )}

              {/* Interactive Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Field - Triggers Point & Type */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-cyan-200">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400/70" />
                    <input
                      type="email"
                      required
                      value={email}
                      onFocus={() => setSpiderAction("point_email")}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      onBlur={() => setSpiderAction("idle")}
                      placeholder="[ Enter your email address ]"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-cyan-500/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-white/[0.1] transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Password Field - Triggers Cover Eyes / Peek */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-200">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPassword ? "Hide" : "Show"}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400/70" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onFocus={() => {
                        setSpiderAction(showPassword ? "peek" : "cover_eyes");
                      }}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setSpiderAction("idle")}
                      placeholder="[ Enter your password ]"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.06] border border-cyan-500/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-white/[0.1] transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3.5 top-3.5 text-cyan-400/60 hover:text-cyan-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end pt-0.5">
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline transition-colors font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Glowing Sign In Button - Triggers look_button on hover */}
                <button
                  type="submit"
                  disabled={loading || loginSuccess}
                  onMouseEnter={() => setSpiderAction("look_button")}
                  onMouseLeave={() => setSpiderAction("idle")}
                  className="w-full py-3.5 px-4 rounded-xl font-black text-sm tracking-widest uppercase text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:from-blue-500 hover:via-cyan-500 hover:to-blue-600 border border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>[ SIGN IN ]</span>
                      <ArrowRight className="w-4 h-4 text-cyan-200" />
                    </>
                  )}
                </button>
              </form>

              {/* Create Free Account */}
              <div className="pt-4 border-t border-cyan-500/20 text-center space-y-2">
                <p className="text-xs text-slate-400">
                  Don&apos;t have an account?
                </p>
                <Link
                  href="/auth/register"
                  className="inline-block w-full py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase text-cyan-300 bg-white/[0.04] hover:bg-white/[0.08] border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-sm"
                >
                  [ CREATE FREE ACCOUNT ]
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center space-x-4 pt-1 text-[11px] text-slate-400">
                <div className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-Bit Encrypted</span>
                </div>
                <span>•</span>
                <span>100% Free Forever</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 text-center text-[11px] text-slate-500 border-t border-cyan-500/10">
        <span>© 2026 EXAMHUB INDIA. Real-Time WebGL 3D Interactive Superhero Experience. 100% Free.</span>
      </footer>
    </div>
  );
}
