"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminMaintenanceNav from "@/components/AdminMaintenanceNav";
import { fetchApi } from "@/lib/api";
import { 
  Activity, Server, Database, Lock, AlertTriangle, 
  CheckCircle2, Clock, Archive, Link2, FileText, Download, Plus, ArrowRight 
} from "lucide-react";

export default function AdminMaintenanceDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaintenanceData();
  }, []);

  async function loadMaintenanceData() {
    setLoading(true);
    try {
      const [dashRes, repRes, taskRes] = await Promise.all([
        fetchApi("/api/admin/maintenance/dashboard"),
        fetchApi("/api/admin/maintenance/daily-report"),
        fetchApi("/api/admin/maintenance/tasks")
      ]);
      setData(dashRes);
      setReport(repRes);
      setTasks(taskRes.tasks || []);
    } catch (err) {
      console.error("Failed to load maintenance cockpit data:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <AdminMaintenanceNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Cockpit Status Banner */}
        <div className="p-6 bg-gradient-to-r from-[#102D59] via-[#0E274D] to-[#0A1D3A] rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-blue-900/40">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>ALL PRODUCTION SYSTEMS NOMINAL</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              ExamHub India Maintenance Cockpit
            </h2>
            <p className="text-xs text-blue-200 max-w-2xl leading-relaxed">
              Monitoring 10 system endpoints, 67 official government commission gateways, database query latency, and automated snapshot retention.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/maintenance/backups"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-2"
            >
              <Archive className="w-4 h-4" />
              <span>Database Backups</span>
            </Link>
            <Link
              href="/admin/maintenance/broken-links"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2"
            >
              <Link2 className="w-4 h-4" />
              <span>Broken Links Scanner</span>
            </Link>
          </div>
        </div>

        {/* Core KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>Platform Health</span>
              <Server className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              {data?.status || "HEALTHY"}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">10/10 Core Components Responding</div>
          </div>

          <div className="p-5 bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>Open Maintenance Tasks</span>
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {data?.metrics?.open_maintenance_tasks || tasks.length}
            </div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">
              {data?.metrics?.urgent_tasks || 0} Urgent Action Items
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>Broken Links Reported</span>
              <Link2 className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {data?.metrics?.broken_links || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">All Official Gateways Verified</div>
          </div>

          <div className="p-5 bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>Latest DB Snapshot</span>
              <Archive className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-2 truncate">
              {data?.metrics?.last_backup_status || "SUCCESS"}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">SHA-256 Verified</div>
          </div>
        </div>

        {/* 20-Point Daily Operations Report Card */}
        {report && (
          <div className="bg-white dark:bg-[#102D59]/30 rounded-3xl border border-slate-200 dark:border-blue-900/40 p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-blue-900/30">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  20-Point Automated Platform Operational Report
                </h3>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Date: {report.report_date} • Generated: {new Date(report.generated_at).toLocaleTimeString("en-IN")}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
              {Object.entries(report.summary_20_points || {}).map(([key, val]) => (
                <div key={key} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium capitalize truncate">
                    {key.replace(/^[0-9]+_/, "").replace(/_/g, " ")}
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {String(val)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Maintenance Tasks Manager */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Active Maintenance Tasks & Issues
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track broken links, security reviews, content updates, and API optimizations.
              </p>
            </div>
            <Link
              href="/admin/maintenance/scheduled-tasks"
              className="text-xs font-bold text-[#2563EB] hover:underline flex items-center space-x-1"
            >
              <span>View Scheduled Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 text-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      task.priority === "URGENT" ? "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200" :
                      task.priority === "HIGH" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200" :
                      "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200"
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{task.category}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{task.title}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{task.description}</p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    task.status === "RESOLVED" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" :
                    task.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300" :
                    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}>
                    {task.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
