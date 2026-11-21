"use client";

import React, { useState, useEffect } from "react";
import AdminMaintenanceNav from "@/components/AdminMaintenanceNav";
import { fetchApi } from "@/lib/api";
import { Link2, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";

export default function AdminBrokenLinksPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadLinks();
  }, []);

  async function loadLinks() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/admin/maintenance/broken-links");
      setReports(res.reports || []);
    } catch (err) {
      console.error("Failed to load broken links:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(id: number) {
    try {
      await fetchApi(`/api/admin/maintenance/broken-links/${id}/resolve`, { method: "PUT" });
      setMsg(`Broken link issue #${id} marked as resolved.`);
      setTimeout(() => setMsg(""), 4000);
      await loadLinks();
    } catch (err) {
      console.error("Resolve error:", err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <AdminMaintenanceNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {msg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            {msg}
          </div>
        )}

        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <Link2 className="w-5 h-5 text-red-500" />
            <span>Broken Link Detector & Official Gateway Validator</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated crawler scans all examination links, application portals, and scorecards for 404 errors, timeouts, and redirect changes.
          </p>
        </div>

        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="p-4 bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 text-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    r.status === "RESOLVED" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200" :
                    "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200"
                  }`}>
                    {r.status}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">{r.reported_issue}</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{r.title || r.details}</span>
                </div>
                <div className="font-mono text-slate-500 dark:text-slate-400 break-all">{r.target_url || r.details}</div>
              </div>

              {r.status !== "RESOLVED" && (
                <button
                  onClick={() => handleResolve(r.id)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shrink-0"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
