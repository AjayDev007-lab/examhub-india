"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, ShieldAlert, Link2, Server, Database, Lock,
  Zap, AlertOctagon, Archive, Clock, Sparkles, Copy, Sliders
} from "lucide-react";

export default function AdminMaintenanceNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/admin/maintenance", icon: Activity },
    { label: "Website Health", href: "/admin/maintenance/website-health", icon: Server },
    { label: "Pages Availability", href: "/admin/maintenance/pages", icon: Zap },
    { label: "Broken Links", href: "/admin/maintenance/broken-links", icon: Link2 },
    { label: "API Health", href: "/admin/maintenance/api-health", icon: Activity },
    { label: "Database", href: "/admin/maintenance/database", icon: Database },
    { label: "Security Monitor", href: "/admin/maintenance/security", icon: Lock },
    { label: "Performance", href: "/admin/maintenance/performance", icon: Zap },
    { label: "Errors Log", href: "/admin/maintenance/errors", icon: AlertOctagon },
    { label: "Backups Manager", href: "/admin/maintenance/backups", icon: Archive },
    { label: "Scheduled Tasks", href: "/admin/maintenance/scheduled-tasks", icon: Clock },
    { label: "Content Freshness", href: "/admin/maintenance/content-quality", icon: Sparkles },
    { label: "Duplicate Content", href: "/admin/maintenance/duplicate-content", icon: Copy },
    { label: "Activity Trail", href: "/admin/maintenance/activity", icon: Clock },
    { label: "Settings", href: "/admin/maintenance/settings", icon: Sliders },
  ];

  return (
    <div className="bg-white dark:bg-[#102D59]/40 border-b border-slate-200 dark:border-blue-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Platform Health Cockpit & Diagnostics</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Website Maintenance Centre
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time monitoring of route availability, database connectivity, broken links, security alerts, and automated backups.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/admin/dashboard"
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-all"
            >
              Main Admin Console
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 dark:border-blue-900/30 text-xs font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === "/admin/maintenance" && pathname === "/admin/maintenance/dashboard");
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
