"use client";

import React, { useState, useEffect } from "react";
import AdminMaintenanceNav from "@/components/AdminMaintenanceNav";
import { fetchApi } from "@/lib/api";
import { AlertOctagon, CheckCircle2, Clock } from "lucide-react";

export default function AdminErrorsLogPage() {
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadErrors();
  }, []);

  async function loadErrors() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/admin/maintenance/errors");
      setErrors(res.errors || []);
    } catch (err) {
      console.error("Failed to load errors:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <AdminMaintenanceNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <AlertOctagon className="w-5 h-5 text-red-500" />
            <span>Application Exception & Error Reporting Centre</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sanitized logs of frontend/backend exceptions. Zero tokens, passwords, or personal credentials are recorded.
          </p>
        </div>

        <div className="space-y-3">
          {errors.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#102D59]/20 rounded-2xl border border-slate-200 dark:border-blue-900/30 text-slate-500 text-xs">
              0 active application exceptions recorded. System running smoothly.
            </div>
          ) : (
            errors.map((e) => (
              <div key={e.id} className="p-4 bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 text-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200">
                      {e.severity}
                    </span>
                    <span className="font-mono text-slate-400">{e.service}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{e.error_type}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">{e.message}</div>
                </div>
                <div className="text-right text-[11px] text-slate-400 shrink-0">
                  Seen {e.frequency_count}x • Status: <strong className="text-emerald-600">{e.status}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
