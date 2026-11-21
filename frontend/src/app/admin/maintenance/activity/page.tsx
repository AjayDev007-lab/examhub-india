"use client";

import React, { useState, useEffect } from "react";
import AdminMaintenanceNav from "@/components/AdminMaintenanceNav";
import { fetchApi } from "@/lib/api";
import { Clock, ShieldCheck } from "lucide-react";

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/admin/audit-logs");
      setLogs(res.logs || []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
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
            <Clock className="w-5 h-5 text-blue-500" />
            <span>System Maintenance Activity Trail</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit log of all maintenance actions, snapshot creations, and broken link resolutions.
          </p>
        </div>

        <div className="bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 p-5 space-y-3 shadow-sm">
          {logs.map((lg) => (
            <div key={lg.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-xs flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">{lg.action}</span>
                <span className="text-slate-400 ml-2">by {lg.actor_type}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {new Date(lg.created_at).toLocaleString("en-IN")}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
