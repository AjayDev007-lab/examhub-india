"use client";

import React, { useState, useEffect } from "react";
import AdminDailyUpdatesNav from "@/components/AdminDailyUpdatesNav";
import { fetchApi } from "@/lib/api";
import { Settings, Clock, CheckCircle2, ShieldCheck, Bell } from "lucide-react";

export default function AdminDailySettingsPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/admin/daily-updates/schedules");
      setSchedules(res.schedules || []);
    } catch (err) {
      console.error("Failed to load schedules:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <AdminDailyUpdatesNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-500" />
            <span>Automated Monitoring Schedule & Frequency</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure automated daily crawling timetable and student alert dispatch windows in Asia/Kolkata timezone.
          </p>
        </div>

        {savedMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            {savedMsg}
          </div>
        )}

        <div className="bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 p-6 space-y-6 shadow-sm">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <span>Configured Daily Monitoring Slots (Asia/Kolkata)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {schedules.map((s) => (
                <div key={s.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{s.slot_name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Scope: {s.category_scope}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-[#2563EB]">{s.time_slot} IST</div>
                    <span className="text-[10px] font-semibold text-emerald-600">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-blue-900/30 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Editorial & Publishing Policy</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Auto-publishing is strictly restricted to verified government commissions (UPSC, SSC, RRB). Any update with altered dates, fee modifications, or third-party vacancy notices automatically routes to the Super Admin verification queue before becoming visible to students.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
