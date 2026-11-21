"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, BookOpen, Calendar, Bell, 
  Briefcase, Bookmark, Settings, Award, Plus, Sparkles, ShieldCheck
} from "lucide-react";

export default function StudentNav() {
  const pathname = usePathname();

  const links = [
    { name: "My Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Exams", href: "/student/my-exams", icon: BookOpen },
    { name: "Exam Calendar", href: "/student/calendar", icon: Calendar, badge: "SYNC" },
    { name: "Explore Exams", href: "/student/examinations", icon: Award },
    { name: "Job Alerts", href: "/student/job-alerts", icon: Briefcase, badge: "AI MATCH" },
    { name: "Saved Bookmarks", href: "/student/saved-jobs", icon: Bookmark },
    { name: "Notifications", href: "/student/notifications", icon: Bell },
    { name: "Profile & Settings", href: "/student/settings", icon: Settings },
  ];

  return (
    <div className="bg-white/95 dark:bg-[#101E3D]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/25"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                <span>{link.name}</span>
                {link.badge && (
                  <span className={`px-1.5 py-0.5 text-[9px] font-black uppercase rounded ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#EAF3FF] dark:bg-blue-950 text-[#2563EB] dark:text-blue-300"
                  }`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
