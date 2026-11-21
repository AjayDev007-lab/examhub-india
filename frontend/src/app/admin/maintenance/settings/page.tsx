"use client";

import React, { useState } from "react";
import AdminMaintenanceNav from "@/components/AdminMaintenanceNav";
import { Sliders, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function AdminMaintenanceSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [msg, setMsg] = useState("");

  const handleToggle = () => {
    setMaintenanceMode(!maintenanceMode);
    setMsg(`Maintenance mode ${!maintenanceMode ? "ENABLED" : "DISABLED"}`);
    setTimeout(() => setMsg(""), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <AdminMaintenanceNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-blue-500" />
            <span>Website Maintenance Diagnostics Settings</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure alert thresholds, health check ping frequencies, and maintenance mode.
          </p>
        </div>

        {msg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            {msg}
          </div>
        )}

        <div className="p-6 bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 space-y-6 shadow-sm text-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-blue-900/30">
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">Platform Maintenance Mode</div>
              <div className="text-slate-500">Temporarily display a friendly maintenance notice to public visitors while allowing administrators full access.</div>
            </div>
            <button
              onClick={handleToggle}
              className={`px-4 py-2 rounded-xl font-bold text-white transition-all ${
                maintenanceMode ? "bg-red-600 hover:bg-red-700" : "bg-slate-600 hover:bg-slate-700"
              }`}
            >
              {maintenanceMode ? "Mode: ACTIVE" : "Mode: OFF"}
            </button>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-slate-900 dark:text-white">Automated Health Thresholds</div>
            <p className="text-slate-500">Alert administrators if any route latency exceeds 1500ms or HTTP failure rate exceeds 1%.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
