"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Award, FileText, Briefcase, FolderArchive, LogIn, User, 
  Menu, X, Moon, Sun, ChevronDown, Check, LogOut, ShieldAlert,
  Send, Search, Laptop, GraduationCap, BookOpen, Sparkles, Bookmark
} from "lucide-react";
import { Language, translations } from "@/lib/i18n";
import { logoutUser } from "@/lib/firebase";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentLang, setCurrentLang] = useState<Language>("en");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Hide public navbar on auth pages to allow dedicated authentication view
  const isAuthPage = pathname === "/auth/login" || pathname === "/student/login" || pathname?.startsWith("/auth/");
  if (isAuthPage) {
    return null;
  }

  useEffect(() => {
    // Check saved language
    const savedLang = localStorage.getItem("examhub_lang") as Language;
    if (savedLang && translations[savedLang]) {
      setCurrentLang(savedLang);
    }
    // Check saved user
    const userStr = localStorage.getItem("examhub_user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (_) {}
    }

    // Check dark mode preference
    const storedTheme = localStorage.getItem("examhub_theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldDark = storedTheme === "dark" || (!storedTheme && prefersDark);
    setIsDarkMode(shouldDark);
    if (shouldDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Close dropdowns on outside click
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
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
    setLangDropdownOpen(false);
    window.dispatchEvent(new Event("examhub-language-changed"));
  };

  const handleLogout = () => {
    logoutUser();
  };

  const navLinks = [
    { name: "Govt Jobs", href: "/jobs", icon: Briefcase },
    { name: "IT Jobs", href: "/jobs/it", icon: Laptop },
    { name: "University Papers", href: "/university", icon: GraduationCap },
    { name: "School Learning", href: "/school", icon: BookOpen },
    { name: "AI Career Tools", href: "/ai-tools", icon: Sparkles },
  ];

  const languages = [
    { code: "en" as Language, label: "English" },
    { code: "hi" as Language, label: "हिन्दी" },
    { code: "ta" as Language, label: "தமிழ்" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0A1428]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-sm">
      
      {/* Top Disclaimer Notice */}
      <div className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[11px] py-1 px-4 border-b border-slate-200/60 dark:border-slate-800/80 text-center font-medium">
        <p>
          <span className="font-semibold text-slate-800 dark:text-slate-200">Notice:</span> Not an official government website. Always verify on the official exam body site.
        </p>
      </div>

      {/* Main Responsive Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0B1E3F] via-[#102D59] to-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                EXAMHUB<span className="text-blue-600 dark:text-blue-400"> INDIA</span>
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block -mt-0.5">
                Educational Information Portal
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls: Language, Theme & Auth */}
          <div className="hidden md:flex items-center space-x-2.5">
            
            {/* Language Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                aria-label="Select Language"
              >
                <span>{languages.find((l) => l.code === currentLang)?.label || "English"}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-1 z-50 animate-fadeIn">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleLanguageChange(l.code)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        currentLang === l.code
                          ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span>{l.label}</span>
                      {currentLang === l.code && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Search Link */}
            <Link
              href="/search"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
              title="Smart Global Search"
            >
              <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </Link>

            {/* Telegram Channel Shortcut */}
            <a
              href="https://t.me/india102210"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-bold hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors shadow-sm"
              title="Join ExamHub India Telegram Channel for instant job and exam alerts"
            >
              <Send className="w-3.5 h-3.5 text-sky-500" />
              <span>Telegram Channel</span>
            </a>

            {/* User Profile or Log In / Sign Up */}
            {currentUser ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-[120px] truncate">{currentUser.full_name || "Student"}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-fadeIn space-y-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <User className="w-4 h-4 text-blue-600" />
                      <span>Student Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard?tab=saved"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Bookmark className="w-4 h-4 text-amber-500" />
                      <span>Saved Items</span>
                    </Link>
                    <Link
                      href="/dashboard?tab=applications"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <FileText className="w-4 h-4 text-purple-500" />
                      <span>My Applications</span>
                    </Link>
                    {currentUser?.role === "admin" && (
                      <Link
                        href="/admin/ai"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ShieldAlert className="w-4 h-4 text-cyan-500" />
                        <span>AI Guardian Cockpit</span>
                      </Link>
                    )}
                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-sm transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0A1428] border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-4 animate-fadeIn">
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            <a
              href="https://t.me/india102210"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-bold bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300"
            >
              <Send className="w-4 h-4 text-sky-500" />
              <span>Join Telegram Channel (@india102210)</span>
            </a>
          </nav>

          {/* Mobile Language Selector */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Language:</span>
            <div className="flex items-center space-x-1.5">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleLanguageChange(l.code)}
                  className={`px-2 py-1 rounded-lg font-bold text-xs ${
                    currentLang === l.code
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Auth Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            {currentUser ? (
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs text-center block"
                >
                  Dashboard ({currentUser.full_name || "Student"})
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 font-bold text-xs text-center block"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs text-center"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs text-center shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

    </header>
  );
}
