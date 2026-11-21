"use client";

import React, { useState, useEffect } from "react";
import AdminDailyUpdatesNav from "@/components/AdminDailyUpdatesNav";
import { fetchApi } from "@/lib/api";
import { History, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function AdminDailyHistoryPage() {
  const [history, setHistory] = useState<any>({ runs: [], audit_logs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/admin/daily-updates/history");
      setHistory(res);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <AdminDailyUpdatesNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-500" />
            <span>Monitoring Execution & Editorial Audit History</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Immutable audit record of all scheduled monitoring runs, detected items, and administrative verification actions.
          </p>
        </div>

        {/* Scan Runs */}
        <div className="bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Scheduled Monitoring Runs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/60 font-bold border-b border-slate-100 dark:border-blue-900/30">
                <tr>
                  <th className="py-2.5 px-3">Run ID</th>
                  <th className="py-2.5 px-3">Schedule Slot</th>
                  <th className="py-2.5 px-3">Sources Checked</th>
                  <th className="py-2.5 px-3">New Items</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Completed At (IST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-blue-900/20">
                {history.runs?.map((r: any) => (
                  <tr key={r.id}>
                    <td className="py-2.5 px-3 font-mono font-bold">#{r.id}</td>
                    <td className="py-2.5 px-3">{r.schedule_slot}</td>
                    <td className="py-2.5 px-3">{r.sources_checked} official sources</td>
                    <td className="py-2.5 px-3 font-bold text-blue-600">{r.new_items_detected} detected</td>
                    <td className="py-2.5 px-3">{r.duration_seconds}s</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">
                      {new Date(r.completed_at).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Trail */}
        <div className="bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Admin Editorial Decisions</h3>
          <div className="space-y-3">
            {history.audit_logs?.map((lg: any) => (
              <div key={lg.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Update #{lg.update_id}:</span>{" "}
                  <span className="text-slate-600 dark:text-slate-300">{lg.notes || lg.action}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {new Date(lg.created_at).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
