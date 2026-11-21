"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Award, FileText, CreditCard, Search, User, LogIn, Menu, X, 
  ShieldCheck, LayoutDashboard, Bell, LogOut, ExternalLink, BookOpen,
  Globe, Sparkles, Building2, Landmark, Briefcase, Moon, Sun, Instagram, Phone, Clock
} from "lucide-react";
import { Language, translations } from "@/lib/i18n";
import { SITE_CONFIG } from "@/config/site";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentLang, setCurrentLang] = useState<Language>("en");
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const navLinks = [
    { name: "Apply Online", href: "/apply", icon: BookOpen, isNew: true },
    { name: "Countdowns", href: "/student/countdown", icon: Clock },
    { name: t.officialWebsites || "Official Directory", href: "/official-websites", icon: Landmark },
    { name: "Jobs & Careers", href: "/jobs", icon: Briefcase },
    { name: t.checkResults || "Check Results", href: "/results", icon: Award },
    { name: t.hallTickets || "Hall Tickets", href: "/hall-tickets", icon: FileText },
    { name: t.idCards || "Student ID Cards", href: "/id-cards", icon: CreditCard },
    { name: t.aiAssistant || "AI Assistant", href: "/assistant", icon: Sparkles },
    { name: t.institutionPortal || "Institutions", href: "/institution", icon: Building2 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0B132B]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top National Announcement Bar */}
      <div className="bg-[#102D59] text-slate-200 text-xs py-1.5 px-4 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-white tracking-wide">National Portal:</span>
            <span className="hidden sm:inline text-blue-100/90">Centralized All-India Examination Results, Official Gazette Portals & Student Records</span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <div className="flex items-center space-x-1">
              <Globe className="w-3.5 h-3.5 text-blue-300" />
              <select
                value={currentLang}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="bg-[#18396c] border border-blue-400/30 text-white text-[11px] font-semibold rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="ta">தமிழ்</option>
                <option value="hi">हिन्दी</option>
                <option value="ml">മലയാളം</option>
                <option value="kn">ಕನ್ನಡ</option>
                <option value="te">తెలుగు</option>
              </select>
            </div>

            <span className="text-blue-400/40">|</span>

            {/* Dark mode button */}
            <button
              onClick={toggleDarkMode}
              className="p-1 rounded text-blue-200 hover:text-white transition-colors"
              title="Toggle Light / Dark Mode"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            <span className="text-blue-400/40">|</span>

            <Link href="/official-websites" className="hidden md:inline hover:text-white transition-colors text-blue-100 font-medium">
              Directory (36 States & UTs)
            </Link>

            <span className="hidden md:inline text-blue-400/40">|</span>

            {/* Instagram Link */}
            <a
              href={SITE_CONFIG.social.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`Follow ${SITE_CONFIG.social.instagram.username} on Instagram`}
              className="flex items-center space-x-1 text-pink-300 hover:text-white transition-colors"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden lg:inline text-[11px] font-medium">{SITE_CONFIG.social.instagram.username}</span>
            </a>

            <span className="text-blue-400/40">|</span>

            <Link href="/contact" className="hover:text-white transition-colors text-blue-100 font-medium">
              Contact
            </Link>

            <span className="text-blue-400/40">|</span>

            <Link href="/admin/login" className="flex items-center space-x-1 text-blue-200 hover:text-white transition-colors font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Branding */}
          <Link href="/" className="flex items-center space-x-3 group shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#102D59] to-[#2563EB] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-[#102D59] dark:text-white">
                EXAMHUB<span className="text-[#2563EB]"> INDIA</span>
              </span>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold -mt-1">
                National Examination & Career Hub
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "text-[#2563EB] bg-[#EAF3FF] dark:bg-blue-950/80 font-black shadow-xs"
                      : "text-slate-700 dark:text-slate-200 hover:text-[#2563EB] dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#2563EB]" : "text-slate-400 dark:text-slate-400"}`} />
                  <span>{link.name}</span>
                  {(link as any).isNew && (
                    <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-md">
                      NEW
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Auth Controls */}
          <div className="hidden sm:flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#EAF3FF] dark:bg-blue-950 text-[#2563EB] dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs font-bold transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Student Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors"
                >
                  Student Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-600 rounded-xl shadow-md shadow-blue-500/20 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold ${
                  isActive
                    ? "bg-[#EAF3FF] dark:bg-blue-950 text-[#2563EB] dark:text-blue-300"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{link.name}</span>
                </div>
                {(link as any).isNew && (
                  <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-md">
                    NEW
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {currentUser ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 w-full px-4 py-2.5 rounded-xl bg-[#2563EB] text-white font-bold justify-center text-xs"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Student Dashboard ({currentUser.full_name})</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-red-600 font-bold text-xs"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 bg-[#2563EB] text-white rounded-xl text-xs font-bold shadow"
                >
                  Register
                </Link>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-1 py-2 text-xs text-slate-600 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                <span>Contact Us</span>
              </Link>
              <a
                href={SITE_CONFIG.social.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-1 py-2 text-xs text-pink-600 dark:text-pink-400 font-medium bg-pink-50 dark:bg-pink-950/40 rounded-lg"
              >
                <Instagram className="w-3.5 h-3.5 text-pink-500" />
                <span>Instagram</span>
              </a>
            </div>

            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center space-x-1.5 py-2 text-xs text-slate-500 font-medium"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Separate Admin Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
