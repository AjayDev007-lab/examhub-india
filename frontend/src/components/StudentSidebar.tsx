"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  Award,
  GraduationCap,
  BookOpen,
  Bell,
  Sparkles,
  Settings,
  Bookmark,
  Moon,
  Sun,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Zap,
  Menu,
  X,
  FileText,
  Clock
} from "lucide-react";

interface StudentSidebarProps {
  unreadNotifsCount?: number;
  activeExamsCount?: number;
}

export default function StudentSidebar({ unreadNotifsCount = 3, activeExamsCount = 4 }: StudentSidebarProps) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    // Check initial dark mode preference
    const stored = localStorage.getItem("examhub_theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldDark = stored === "dark" || (!stored && prefersDark);
    setIsDarkMode(shouldDark);
    if (shouldDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

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

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Apply for Exams", href: "/apply", icon: BookOpen, isNew: true },
    { name: "My Applications", href: "/student/my-applications", icon: FileText },
    { name: "Countdowns", href: "/student/countdown", icon: Clock },
    { name: "My Exams", href: "/student/my-exams", icon: ShieldCheck, badge: activeExamsCount },
    { name: "Job Alerts", href: "/student/job-alerts", icon: Briefcase },
    { name: "My Calendar", href: "/student/calendar", icon: Calendar },
    { name: "Check Results", href: "/results", icon: Award },
    { name: "Scholarships", href: "/dashboard?tab=scholarships", icon: GraduationCap },
    { name: "Official Directory", href: "/official-websites", icon: Bookmark },
    { name: "Notifications", href: "/student/notifications", icon: Bell, badge: unreadNotifsCount },
    { name: "AI Assistant", href: "/assistant", icon: Sparkles, highlight: true },
    { name: "Settings", href: "/student/settings", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem("examhub_token");
    localStorage.removeItem("examhub_user");
    window.location.href = "/auth/login";
  };

  return (
    <>
      {/* Mobile Drawer Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-50 w-12 h-12 bg-[#102D59] text-white rounded-full flex items-center justify-center shadow-2xl border border-blue-400/30"
        aria-label="Open Student Navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop for Mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-[#102D59] text-white z-50 flex flex-col transition-transform duration-300 ease-in-out border-r border-[#1e3a6a] shadow-2xl ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-[#1b3d73]">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-lg tracking-tight text-white">EXAMHUB</span>
                <span className="text-xs px-1.5 py-0.5 rounded font-black bg-blue-500 text-white tracking-wider">
                  INDIA
                </span>
              </div>
              <p className="text-[10px] text-blue-200/70 font-medium tracking-wide">National Student Portal</p>
            </div>
          </Link>

          {/* Close for mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
          <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-blue-300/60">
            Student Menu
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-md shadow-blue-600/25 font-bold"
                    : "text-blue-100/80 hover:bg-[#18396c] hover:text-white"
                } ${item.highlight && !isActive ? "border border-blue-400/30 bg-blue-500/10 text-blue-200" : ""}`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? "text-white" : item.highlight ? "text-amber-300" : "text-blue-300"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {item.isNew && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500 text-white tracking-widest uppercase">
                      NEW
                    </span>
                  )}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? "bg-white text-blue-700" : "bg-blue-600/60 text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Pro Plan Upgrade Card */}
        <div className="p-3 mx-3 mb-3 rounded-2xl bg-gradient-to-br from-[#1a3f7c] to-[#122e5a] border border-blue-400/20 text-white shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center space-x-1 text-[10px] font-black tracking-wider text-amber-300 uppercase">
              <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
              <span>ExamHub Pro</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/30 text-[9px] font-semibold text-blue-200">
              Free Trial
            </span>
          </div>
          <p className="text-[11px] text-blue-100/90 leading-tight mb-2.5">
            Auto Admit Card SMS, priority AI mock solutions & vacancy instant push.
          </p>
          <Link
            href="/pricing"
            className="block text-center w-full py-1.5 bg-[#2563EB] hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg shadow transition-all"
          >
            Upgrade Account
          </Link>
        </div>

        {/* Footer with Dark Mode Toggle & Sign Out */}
        <div className="p-3 border-t border-[#1b3d73] flex items-center justify-between text-xs text-blue-200/80">
          <button
            onClick={toggleDarkMode}
            className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Toggle Light / Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-blue-300" />}
            <span className="text-[11px] font-medium">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
