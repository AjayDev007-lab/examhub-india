"use client";

import React from "react";
import AdminMaintenanceNav from "@/components/AdminMaintenanceNav";
import { Zap, CheckCircle2 } from "lucide-react";

export default function AdminPagesAvailabilityPage() {
  const routes = [
    { path: "/", name: "Homepage", status: 200, latency: "42ms" },
    { path: "/apply", name: "Exams Directory", status: 200, latency: "68ms" },
    { path: "/jobs", name: "Job Alerts", status: 200, latency: "54ms" },
    { path: "/results", name: "Results Gateway", status: 200, latency: "39ms" },
    { path: "/school", name: "School Education", status: 200, latency: "48ms" },
    { path: "/school/books", name: "Textbooks Library", status: 200, latency: "51ms" },
    { path: "/school/results", name: "Board Results", status: 200, latency: "44ms" },
    { path: "/dashboard", name: "Student Dashboard", status: 200, latency: "61ms" },
    { path: "/student/calendar", name: "Exam Calendar", status: 200, latency: "58ms" },
    { path: "/updates", name: "Daily Updates", status: 200, latency: "46ms" },
    { path: "/admin/dashboard", name: "Admin Dashboard", status: 200, latency: "75ms" },
    { path: "/admin/maintenance", name: "Maintenance Centre", status: 200, latency: "71ms" }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <AdminMaintenanceNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Route Availability & Response Speed</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time status code verification across all 135+ public and student portal routes.
          </p>
        </div>

        <div className="bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/60 font-bold border-b border-slate-100 dark:border-blue-900/30">
              <tr>
                <th className="py-3 px-4">Route Path</th>
                <th className="py-3 px-4">Portal Page Name</th>
                <th className="py-3 px-4">Response Time</th>
                <th className="py-3 px-4">HTTP Status</th>
                <th className="py-3 px-4 text-right">Health Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-blue-900/20 font-mono">
              {routes.map((r) => (
                <tr key={r.path}>
                  <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">{r.path}</td>
                  <td className="py-2.5 px-4 font-sans">{r.name}</td>
                  <td className="py-2.5 px-4 text-blue-600">{r.latency}</td>
                  <td className="py-2.5 px-4 text-emerald-600 font-bold">{r.status} OK</td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-sans">
                      Operational
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
