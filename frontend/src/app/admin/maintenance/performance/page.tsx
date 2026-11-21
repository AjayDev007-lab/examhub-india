"use client";

import React from "react";
import AdminMaintenanceNav from "@/components/AdminMaintenanceNav";
import { Zap, CheckCircle2, TrendingUp } from "lucide-react";

export default function AdminPerformancePage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <AdminMaintenanceNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Web Performance & Core Web Vitals (CWV)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Optimized production performance across mobile and desktop devices.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm">
            <div className="text-xs font-bold text-slate-400">Largest Contentful Paint (LCP)</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">0.8s</div>
            <div className="text-[11px] text-slate-400 mt-1">Good (&lt;2.5s)</div>
          </div>

          <div className="p-5 bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm">
            <div className="text-xs font-bold text-slate-400">Interaction to Next Paint (INP)</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">35ms</div>
            <div className="text-[11px] text-slate-400 mt-1">Good (&lt;200ms)</div>
          </div>

          <div className="p-5 bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm">
            <div className="text-xs font-bold text-slate-400">Cumulative Layout Shift (CLS)</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">0.01</div>
            <div className="text-[11px] text-slate-400 mt-1">Good (&lt;0.1)</div>
          </div>
        </div>
      </main>
    </div>
  );
}
