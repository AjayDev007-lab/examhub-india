"use client";

import React, { useState, useEffect } from "react";
import AdminMaintenanceNav from "@/components/AdminMaintenanceNav";
import { fetchApi } from "@/lib/api";
import { Sparkles, CheckCircle2, Clock, Archive } from "lucide-react";

export default function AdminContentQualityPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFreshness();
  }, []);

  async function loadFreshness() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/admin/maintenance/freshness");
      setData(res);
    } catch (err) {
      console.error("Failed to load freshness audit:", err);
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
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span>Content Freshness & Obsolete Information Audit</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Detects expired job postings, past exam deadlines, and outdated textbooks to ensure student accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Expired Vacancies Detection</h3>
            <p className="text-xs text-slate-500">
              Found {data?.expired_jobs_count || 0} recruitment notifications whose application deadline has elapsed.
            </p>
            <div className="space-y-2">
              {data?.expired_jobs?.map((j: any) => (
                <div key={j.id} className="p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-xs flex justify-between items-center">
                  <span className="font-semibold text-slate-900 dark:text-white">{j.title}</span>
                  <span className="text-[10px] font-bold text-amber-600">Deadline Passed</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Freshness Recommendations</h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
              {data?.recommendations?.map((r: string, idx: number) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
