"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, BookOpen, Calendar, Bell, 
  Briefcase, Bookmark, Settings, Award, Plus, Sparkles
} from "lucide-react";

export default function StudentNav() {
  const pathname = usePathname();

  const links = [
    { name: "My Exams", href: "/student/my-exams", icon: BookOpen },
    { name: "Exam Calendar", href: "/student/calendar", icon: Calendar, badge: "LIVE" },
    { name: "Explore Exams", href: "/student/examinations", icon: Award },
    { name: "Smart Job Alerts", href: "/student/job-alerts", icon: Briefcase, badge: "AI MATCH" },
    { name: "Saved Bookmarks", href: "/student/saved-jobs", icon: Bookmark },
    { name: "Notifications", href: "/student/notifications", icon: Bell },
    { name: "Preferences", href: "/student/settings", icon: Settings },
    { name: "Document Vault", href: "/dashboard", icon: LayoutDashboard },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{link.name}</span>
                {link.badge && (
                  <span className={`px-1.5 py-0.2 text-[9px] font-black uppercase rounded ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-blue-100 text-blue-700"
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
