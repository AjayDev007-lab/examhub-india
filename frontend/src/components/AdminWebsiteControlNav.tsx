"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Power, Activity, History, Sliders, ShieldAlert, ArrowLeft } from "lucide-react";

export default function AdminWebsiteControlNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Availability Cockpit", href: "/admin/website-control", icon: Power },
    { label: "Live Diagnostics", href: "/admin/website-control/status", icon: Activity },
    { label: "Transition Audit History", href: "/admin/website-control/history", icon: History },
    { label: "Schedule & Emergency Recovery", href: "/admin/website-control/settings", icon: Sliders },
  ];

  return (
    <div className="bg-white dark:bg-[#102D59]/40 border-b border-slate-200 dark:border-blue-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Super Admin Availability Guard</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Website Availability Control Centre
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Securely switch ExamHub India between Online, Scheduled Maintenance, and Temporary Offline modes with emergency recovery failsafes.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/admin/dashboard"
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-all flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 dark:border-blue-900/30 text-xs font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
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
