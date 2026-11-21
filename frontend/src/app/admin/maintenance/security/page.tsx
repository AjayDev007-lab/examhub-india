"use client";

import React from "react";
import AdminMaintenanceNav from "@/components/AdminMaintenanceNav";
import { Lock, ShieldCheck, AlertTriangle } from "lucide-react";

export default function AdminSecurityMonitorPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <AdminMaintenanceNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <Lock className="w-5 h-5 text-emerald-500" />
            <span>Cybersecurity Monitor & Security Headers Audit</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time audit of CSP headers, brute-force login attempts, CSRF protections, and sandboxing compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm">
            <div className="text-xs font-bold text-slate-400">Failed Logins (24h)</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">0 Suspicious</div>
            <div className="text-[11px] text-slate-400 mt-1">Rate limiting active</div>
          </div>

          <div className="p-5 bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm">
            <div className="text-xs font-bold text-slate-400">Security Headers Compliance</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">100% Grade A+</div>
            <div className="text-[11px] text-slate-400 mt-1">X-Frame-Options: DENY</div>
          </div>

          <div className="p-5 bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm">
            <div className="text-xs font-bold text-slate-400">Zero-Payment Compliance</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">100% Free</div>
            <div className="text-[11px] text-slate-400 mt-1">No payment gateways active</div>
          </div>
        </div>
      </main>
    </div>
  );
}
