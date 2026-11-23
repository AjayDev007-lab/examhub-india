"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "@/lib/firebase";
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  Award,
  FolderArchive,
  HelpCircle,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Send,
  ExternalLink,
  Laptop,
  GraduationCap,
  BookOpen,
  Sparkles,
  Bookmark,
  Clock,
  FileCheck2,
  TrendingUp,
  User,
  Settings
} from "lucide-react";

export default function StudentSidebar() {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
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
    { name: "Dashboard Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Government Jobs", href: "/jobs", icon: Briefcase },
    { name: "IT & Tech Jobs", href: "/jobs/it", icon: Laptop },
    { name: "College & University", href: "/university", icon: GraduationCap },
    { name: "School Learning", href: "/school", icon: BookOpen },
    { name: "AI Career Tools", href: "/ai-tools", icon: Sparkles },
    { name: "Saved Items", href: "/dashboard?tab=saved", icon: Bookmark },
    { name: "My Deadlines & Reminders", href: "/dashboard?tab=reminders", icon: Clock },
    { name: "My Applications", href: "/dashboard?tab=applications", icon: FileCheck2 },
    { name: "Learning Progress", href: "/dashboard?tab=learning", icon: TrendingUp },
    { name: "My Profile", href: "/dashboard?tab=profile", icon: User },
    { name: "Settings", href: "/dashboard?tab=settings", icon: Settings },
    { name: "Telegram Channel", href: "https://t.me/india102210", icon: Send, isExternal: true },
  ];

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <>
      {/* Mobile Drawer Floating Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-50 w-12 h-12 bg-[#0B1E3F] text-white rounded-full flex items-center justify-center shadow-xl border border-blue-400/30"
        aria-label="Open Sidebar Navigation"
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
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#0B1E3F] text-white z-50 flex flex-col transition-transform duration-300 ease-in-out border-r border-blue-900/60 shadow-xl ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 flex items-center justify-between border-b border-blue-900/50">
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="font-black text-base tracking-tight text-white">
                EXAMHUB<span className="text-blue-400"> INDIA</span>
              </span>
              <p className="text-[10px] text-blue-200/70">Student Workspace</p>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-white/10"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6 Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-blue-300/60">
            Student Menu
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if ((item as any).isExternal) {
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group text-sky-200 hover:bg-sky-950/60 hover:text-white"
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 text-sky-400 group-hover:text-white" />
                    <span>{item.name}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md font-bold"
                    : "text-blue-100/80 hover:bg-blue-900/40 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 text-blue-300 group-hover:text-white" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })}
        </div>

        {/* Bottom Theme Toggle and Logout */}
        <div className="p-3 border-t border-blue-900/50 space-y-2">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-blue-200 hover:bg-blue-900/40 transition-colors"
          >
            <span className="flex items-center space-x-2">
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
              <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-red-300 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
