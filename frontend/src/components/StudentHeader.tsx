"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/firebase";
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  BookOpen,
  Briefcase
} from "lucide-react";

interface StudentHeaderProps {
  pageTitle?: string;
  unreadCount?: number;
}

export default function StudentHeader({ pageTitle = "Student Portal", unreadCount = 3 }: StudentHeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("examhub_user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (_) {}
    }

    // Keyboard shortcut (Ctrl+K or ⌘+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/student/examinations?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = () => {
    logoutUser();
  };

  const getInitials = (name?: string) => {
    if (!name) return "ST";
    const parts = name.split(" ");
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B132B]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Page Title Context */}
        <div className="flex items-center space-x-3 min-w-0">
          <h1 className="text-base sm:text-lg font-black text-[#14213D] dark:text-white truncate tracking-tight">
            {pageTitle}
          </h1>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF3FF] dark:bg-blue-950/80 text-[#2563EB] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Official Student Workspace
          </span>
        </div>

        {/* Universal Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exams, notifications, job alerts... (Ctrl+K)"
              className="w-full pl-9 pr-12 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white dark:focus:bg-slate-950 transition-all font-medium"
            />
            <kbd className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              ⌘K
            </kbd>
          </form>
        </div>

        {/* Right Action Icons & Profile Dropdown */}
        <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
          {/* Quick Actions Links */}
          <Link
            href="/jobs"
            className="hidden lg:flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Jobs</span>
          </Link>

          <Link
            href="/results"
            className="hidden lg:flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Results</span>
          </Link>

          {/* Notifications Bell */}
          <Link
            href="/student/notifications"
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#DC2626] ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </Link>

          {/* Profile Pill & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2.5 p-1 sm:pr-3 rounded-full sm:rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#102D59] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {getInitials(user?.full_name)}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-black text-[#14213D] dark:text-white leading-tight truncate max-w-[120px]">
                  {user?.full_name || "Verified Student"}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                  Candidate ID #{user?.id || 1}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#101E3D] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 text-xs text-slate-700 dark:text-slate-200 divide-y divide-slate-100 dark:divide-slate-800">
                <div className="px-4 py-2.5">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{user?.full_name || "Candidate"}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">
                    {user?.email || "student@examhub.in"}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                  >
                    <BookOpen className="w-4 h-4 text-[#2563EB]" />
                    <span>My Dashboard</span>
                  </Link>
                  <Link
                    href="/student/job-alerts"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                  >
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                    <span>Career Preferences</span>
                  </Link>
                  <Link
                    href="/student/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Account Settings</span>
                  </Link>
                </div>

                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2.5 px-4 py-2 w-full text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
