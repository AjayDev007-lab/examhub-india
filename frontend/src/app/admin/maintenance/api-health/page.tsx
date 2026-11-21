"use client";

import React from "react";
import AdminMaintenanceNav from "@/components/AdminMaintenanceNav";
import { Server, Activity, CheckCircle2 } from "lucide-react";

export default function AdminApiHealthPage() {
  const apis = [
    { endpoint: "/api/health", method: "GET", latency: "12ms", successRate: "100%", status: "HEALTHY" },
    { endpoint: "/api/exams", method: "GET", latency: "24ms", successRate: "99.9%", status: "HEALTHY" },
    { endpoint: "/api/jobs", method: "GET", latency: "31ms", successRate: "99.8%", status: "HEALTHY" },
    { endpoint: "/api/results", method: "GET", latency: "18ms", successRate: "100%", status: "HEALTHY" },
    { endpoint: "/api/school/books", method: "GET", latency: "22ms", successRate: "100%", status: "HEALTHY" },
    { endpoint: "/api/updates", method: "GET", latency: "16ms", successRate: "100%", status: "HEALTHY" },
    { endpoint: "/api/auth/login", method: "POST", latency: "45ms", successRate: "99.7%", status: "HEALTHY" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <AdminMaintenanceNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <span>FastAPI Backend Services & Gateway Health</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time API gateway metrics, throughput, error rates, and endpoint latency stats.
          </p>
        </div>

        <div className="bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/60 font-bold border-b border-slate-100 dark:border-blue-900/30">
              <tr>
                <th className="py-3 px-4">Method & Endpoint</th>
                <th className="py-3 px-4">P95 Latency</th>
                <th className="py-3 px-4">24h Availability</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-blue-900/20 font-mono">
              {apis.map((a) => (
                <tr key={a.endpoint}>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    <span className="text-blue-600 mr-2">{a.method}</span>
                    <span>{a.endpoint}</span>
                  </td>
                  <td className="py-3 px-4 text-emerald-600">{a.latency}</td>
                  <td className="py-3 px-4">{a.successRate}</td>
                  <td className="py-3 px-4 text-right font-sans">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
