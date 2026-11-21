"use client";

import React, { useState, useEffect } from "react";
import AdminMaintenanceNav from "@/components/AdminMaintenanceNav";
import { fetchApi } from "@/lib/api";
import { Clock, Play, CheckCircle2, RefreshCw } from "lucide-react";

export default function AdminScheduledTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const taskDefinitions = [
    { name: "RECALCULATE_REMINDERS", description: "Audit student examination schedules and dispatch upcoming 30d/7d/1d reminders" },
    { name: "EXPIRE_OLD_JOBS", description: "Scan published job notifications and archive postings past their last date of application" },
    { name: "PROBE_GOV_WEBSITES", description: "Ping all 67 official government commission portals to verify uptime and response codes" },
    { name: "DISPATCH_JOB_ALERTS", description: "Match new verified vacancies against student qualification and sector preferences" },
  ];

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/admin/automation/logs");
      setTasks(res.logs || []);
    } catch (err) {
      console.error("Failed to load task logs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRunTask(taskName: string) {
    setRunning(taskName);
    try {
      const res = await fetchApi("/api/admin/automation/run", {
        method: "POST",
        body: JSON.stringify({ task_name: taskName })
      });
      setMsg(res.message || `Task ${taskName} completed successfully.`);
      await loadLogs();
    } catch (err: any) {
      setMsg(err.message || `Task ${taskName} executed.`);
    } finally {
      setRunning(null);
      setTimeout(() => setMsg(""), 5000);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <AdminMaintenanceNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {msg && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <Clock className="w-5 h-5 text-purple-500" />
            <span>Automated Background Tasks & Automation Engines</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure, trigger, and review background cron workers and maintenance routines.
          </p>
        </div>

        {/* Task Trigger Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {taskDefinitions.map((t) => (
            <div key={t.name} className="p-5 bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white text-sm font-mono">{t.name}</span>
                <button
                  onClick={() => handleRunTask(t.name)}
                  disabled={running === t.name}
                  className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {running === t.name ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span>{running === t.name ? "Running..." : "Run Task Now"}</span>
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{t.description}</p>
            </div>
          ))}
        </div>

        {/* Logs */}
        <div className="bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Task Executions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/60 font-bold border-b border-slate-100 dark:border-blue-900/30">
                <tr>
                  <th className="py-2.5 px-3">Task Name</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Records Processed</th>
                  <th className="py-2.5 px-3 text-right">Completed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-blue-900/20 font-mono">
                {tasks.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{l.task_name}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {l.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">{l.records_processed} items</td>
                    <td className="py-2.5 px-3 text-right text-slate-400 font-sans">
                      {new Date(l.completed_at).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
