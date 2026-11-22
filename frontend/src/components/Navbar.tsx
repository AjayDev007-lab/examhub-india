"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Award, FileText, CreditCard, Search, User, LogIn, Menu, X, 
  ShieldCheck, LayoutDashboard, Bell, LogOut, ExternalLink, BookOpen,
  Globe, Sparkles, Building2, Landmark, Briefcase, Moon, Sun, Instagram, 
  Phone, Clock, GraduationCap, Radio, ChevronDown, Check, ArrowRight
} from "lucide-react";
import { Language, translations } from "@/lib/i18n";
import { SITE_CONFIG } from "@/config/site";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentLang, setCurrentLang] = useState<Language>("en");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // If on student or auth login routes, hide standard navbar to allow cinematic superhero experience
  const isAuthPage = pathname === "/auth/login" || pathname === "/student/login" || pathname?.startsWith("/auth/");
  if (isAuthPage) {
    return null;
  }

  useEffect(() => {
    const savedLang = localStorage.getItem("examhub_lang") as Language;
    if (savedLang && translations[savedLang]) {
      setCurrentLang(savedLang);
    }
    const userStr = localStorage.getItem("examhub_user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (_) {}
    }

    // Check dark mode
    const storedTheme = localStorage.getItem("examhub_theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldDark = storedTheme === "dark" || (!storedTheme && prefersDark);
    setIsDarkMode(shouldDark);
    if (shouldDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Close dropdown on click outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pathname]);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("examhub_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("examhub_theme", "light");
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem("examhub_lang", lang);
    window.dispatchEvent(new Event("examhub-language-changed"));
  };

  const handleLogout = () => {
    localStorage.removeItem("examhub_token");
    localStorage.removeItem("examhub_user");
    setCurrentUser(null);
    window.location.href = "/";
  };

  const t = translations[currentLang] || translations.en;

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0A1428]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-sm">
      {/* Top National Announcement Bar */}
      <div className="bg-[#0B1E3F] text-slate-200 text-xs py-1.5 px-4 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-white tracking-wide">National Portal:</span>
            <span className="hidden sm:inline text-blue-100/90">Centralized All-India Examination Results, Official Gazette Portals & Student Records</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            {/* Language Selector */}
            <div className="flex items-center space-x-1.5 text-blue-200">
              {(["en", "hi", "ta"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-1.5 py-0.5 rounded transition-all ${
                    currentLang === lang ? "bg-blue-600 text-white font-bold" : "hover:text-white"
                  }`}
                >
                  {lang === "en" ? "English" : lang === "hi" ? "हिन्दी" : "தமிழ்"}
                </button>
              ))}
            </div>

            <span className="text-blue-400 hidden md:inline">|</span>

            {/* Helpline / Admin link */}
            <Link href="/official-websites" className="hidden md:inline hover:text-white text-blue-200 transition-colors">
              Directory (36 States)
            </Link>

            <Link href="/admin/login" className="hover:text-blue-300 text-blue-200 font-semibold transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16" ref={dropdownRef}>
          
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  EXAMHUB<span className="text-blue-600 dark:text-blue-400"> INDIA</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  GOV.IN
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block -mt-0.5">
                National Examination & Career Gateway
              </p>
            </div>
          </Link>

          {/* Clean, User-Friendly Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
            
            {/* 1. Results & Examinations Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === "results" ? null : "results")}
                className={`flex items-center space-x-1 px-3 py-2 rounded-xl transition-all ${
                  pathname.startsWith("/results") || pathname.startsWith("/hall-tickets") || pathname.startsWith("/id-cards") || pathname.startsWith("/student/countdown")
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Exams & Results</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === "results" ? "rotate-180" : ""}`} />
              </button>

              {openDropdown === "results" && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 space-y-1 animate-fadeIn">
                  <Link
                    href="/results"
                    onClick={() => setOpenDropdown(null)}
                    className="flex items-start space-x-2.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Check Exam Results</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Scorecards, marks & ranks</p>
                    </div>
                  </Link>

                  <Link
                    href="/hall-tickets"
                    onClick={() => setOpenDropdown(null)}
                    className="flex items-start space-x-2.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Hall Tickets / Admit Cards</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">e-Admit cards & center info</p>
                    </div>
                  </Link>

                  <Link
                    href="/id-cards"
                    onClick={() => setOpenDropdown(null)}
                    className="flex items-start space-x-2.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Student ID Cards</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">College & university IDs</p>
                    </div>
                  </Link>

                  <Link
                    href="/student/countdown"
                    onClick={() => setOpenDropdown(null)}
                    className="flex items-start space-x-2.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-t border-slate-100 dark:border-slate-800 pt-2"
                  >
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Exam Countdowns</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Live timers to major exams</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* 2. Jobs & Careers */}
            <Link
              href="/jobs"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all ${
                pathname.startsWith("/jobs")
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Jobs & Careers</span>
            </Link>

            {/* 3. Official Portals Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === "portals" ? null : "portals")}
                className={`flex items-center space-x-1 px-3 py-2 rounded-xl transition-all ${
                  pathname.startsWith("/official-websites") || pathname.startsWith("/school") || pathname.startsWith("/directory")
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Official Directory</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === "portals" ? "rotate-180" : ""}`} />
              </button>

              {openDropdown === "portals" && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 space-y-1 animate-fadeIn">
                  <Link
                    href="/official-websites"
                    onClick={() => setOpenDropdown(null)}
                    className="flex items-start space-x-2.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Government Portals</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">36 States, UPSC, SSC & Boards</p>
                    </div>
                  </Link>

                  <Link
                    href="/school"
                    onClick={() => setOpenDropdown(null)}
                    className="flex items-start space-x-2.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">School Education</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">CBSE, ICSE & State Boards</p>
                    </div>
                  </Link>

                  <Link
                    href="/apply"
                    onClick={() => setOpenDropdown(null)}
                    className="flex items-start space-x-2.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Apply Online Forms</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Active registrations gateway</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* 4. Daily Updates with Live Badge */}
            <Link
              href="/updates"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all ${
                pathname.startsWith("/updates")
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span>Daily Updates</span>
            </Link>

          </nav>

          {/* Right Action Icons & Auth Buttons */}
          <div className="flex items-center space-x-2">
            
            {/* AI Assistant Pill */}
            <Link
              href="/assistant"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-purple-600/10 border border-blue-500/20 hover:border-blue-500/40 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 animate-pulse" />
              <span>Ask AI</span>
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Student Auth Section */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[100px] truncate">{currentUser.full_name || "Student"}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Log In</span>
                </Link>

                <Link
                  href="/auth/register"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                >
                  <span>Sign Up Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* User-Friendly Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A1428] px-4 pt-3 pb-6 space-y-4 shadow-xl">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <Link
              href="/results"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
            >
              <Award className="w-4 h-4 shrink-0" />
              <span>Check Results</span>
            </Link>

            <Link
              href="/hall-tickets"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Hall Tickets</span>
            </Link>

            <Link
              href="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
            >
              <Briefcase className="w-4 h-4 shrink-0" />
              <span>Jobs & Careers</span>
            </Link>

            <Link
              href="/official-websites"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300"
            >
              <Landmark className="w-4 h-4 shrink-0" />
              <span>Official Portals</span>
            </Link>

            <Link
              href="/school"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>School Education</span>
            </Link>

            <Link
              href="/updates"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300"
            >
              <Radio className="w-4 h-4 shrink-0" />
              <span>Daily Updates</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <Link
              href="/assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-bold shadow-md"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ask AI Exam Assistant</span>
            </Link>

            {!currentUser && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
