"use client";

import React, { useState, useEffect } from "react";
import AdminMaintenanceNav from "@/components/AdminMaintenanceNav";
import { fetchApi } from "@/lib/api";
import { Server, CheckCircle2, Clock, Activity, RefreshCw } from "lucide-react";

export default function AdminWebsiteHealthPage() {
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealth();
  }, []);

  async function loadHealth() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/admin/maintenance/dashboard");
      setComponents(res.components || []);
    } catch (err) {
      console.error("Failed to load health components:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <AdminMaintenanceNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Server className="w-5 h-5 text-emerald-500" />
              <span>Production Core Components Availability</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live HTTP heartbeat probes and latency monitoring across primary portal modules.
            </p>
          </div>

          <button
            onClick={loadHealth}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-check Now</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {components.map((c) => (
            <div key={c.id} className="p-5 bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white text-sm">{c.name}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                  {c.status}
                </span>
              </div>
              <div className="font-mono text-xs text-slate-400">{c.route}</div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-blue-900/30 text-xs">
                <span className="text-slate-500">Latency: <strong>{c.latency_ms} ms</strong></span>
                <span className="text-slate-500">HTTP: <strong className="text-emerald-600">{c.http_status}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
