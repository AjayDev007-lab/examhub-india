"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RefreshCw, Radio, Briefcase, GraduationCap, Award, BookOpen,
  FileCheck2, ShieldCheck, Settings, History, CheckSquare, Layers
} from "lucide-react";

interface AdminDailyUpdatesNavProps {
  onTriggerScan?: () => void;
  isScanning?: boolean;
}

export default function AdminDailyUpdatesNav({ onTriggerScan, isScanning }: AdminDailyUpdatesNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/admin/daily-updates", icon: Radio },
    { label: "Govt & Private Jobs", href: "/admin/daily-updates/jobs", icon: Briefcase },
    { label: "Examinations", href: "/admin/daily-updates/exams", icon: GraduationCap },
    { label: "Exam Results", href: "/admin/daily-updates/results", icon: Award },
    { label: "School Results", href: "/admin/daily-updates/school-results", icon: BookOpen },
    { label: "Admit Cards", href: "/admin/daily-updates/admit-cards", icon: FileCheck2 },
    { label: "Scholarships", href: "/admin/daily-updates/scholarships", icon: Layers },
    { label: "Admissions", href: "/admin/daily-updates/admissions", icon: GraduationCap },
    { label: "Sources Directory", href: "/admin/daily-updates/sources", icon: ShieldCheck },
    { label: "Verification Queue", href: "/admin/daily-updates/verification", icon: CheckSquare },
    { label: "Scan History", href: "/admin/daily-updates/history", icon: History },
    { label: "Schedule Settings", href: "/admin/daily-updates/settings", icon: Settings },
  ];

  return (
    <div className="bg-white dark:bg-[#102D59]/40 border-b border-slate-200 dark:border-blue-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 animate-pulse text-red-500" />
              <span>Automated Information Monitoring Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Smart Daily Updates Centre
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Continuous monitoring of official government commissions, recruitment boards, results, and education authorities.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/updates"
              target="_blank"
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-all flex items-center space-x-1.5"
            >
              <span>View Student Portal</span>
            </Link>

            {onTriggerScan && (
              <button
                onClick={onTriggerScan}
                disabled={isScanning}
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
                <span>{isScanning ? "Scanning Official Sources..." : "Run Monitoring Scan Now"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 dark:border-blue-900/30 text-xs font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === "/admin/daily-updates" && pathname === "/admin/daily-updates/dashboard");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-[#2563EB] text-white font-bold shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
