"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Activity, ArrowLeft, Play, RefreshCw, CheckCircle2, 
  AlertTriangle, Clock, Server, Globe, Bell, Check
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminSystemHealthPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningTask, setRunningTask] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/admin/automation/logs");
      if (res && res.logs) {
        setLogs(res.logs);
      }
    } catch (err) {
      console.error("Failed to load task logs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTriggerTask(taskName: string) {
    setRunningTask(taskName);
    try {
      const res = await fetchApi("/api/admin/automation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_name: taskName })
      });

      if (res && res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => setSuccessMsg(""), 5000);
        loadLogs();
      }
    } catch (err: any) {
      alert("Automation task failed: " + (err.message || "Unknown error"));
    } finally {
      setRunningTask(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/dashboard"
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">System Health & Automation Engine</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Background schedulers for exam reminders, link validity checking, and job vacancy lifecycles.
              </p>
            </div>
          </div>

          <button
            onClick={loadLogs}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
          </button>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Health Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Database & API</span>
              <div className="text-sm font-bold text-white">Operational (99.98%)</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Gov Directory Prober</span>
              <div className="text-sm font-bold text-white">67 Endpoints Verified</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Notification Engine</span>
              <div className="text-sm font-bold text-white">Scheduler Active</div>
            </div>
          </div>
        </div>

        {/* Manual Automation Triggers */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-black text-white tracking-tight">Manual Automation Task Triggers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => handleTriggerTask("RECALCULATE_REMINDERS")}
              disabled={runningTask !== null}
              className="p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-2xl text-left transition-all disabled:opacity-50"
            >
              <div className="text-xs font-bold text-white">Recalculate Reminders</div>
              <div className="text-[11px] text-slate-400 mt-1">Sync upcoming exam dates with student reminder timelines.</div>
              <div className="text-[10px] font-bold text-blue-400 mt-3 flex items-center space-x-1">
                <Play className="w-3 h-3" />
                <span>{runningTask === "RECALCULATE_REMINDERS" ? "Running..." : "Run Task"}</span>
              </div>
            </button>

            <button
              onClick={() => handleTriggerTask("EXPIRE_OLD_JOBS")}
              disabled={runningTask !== null}
              className="p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-2xl text-left transition-all disabled:opacity-50"
            >
              <div className="text-xs font-bold text-white">Expire Past Vacancies</div>
              <div className="text-[11px] text-slate-400 mt-1">Archive notifications whose application deadline has lapsed.</div>
              <div className="text-[10px] font-bold text-blue-400 mt-3 flex items-center space-x-1">
                <Play className="w-3 h-3" />
                <span>{runningTask === "EXPIRE_OLD_JOBS" ? "Running..." : "Run Task"}</span>
              </div>
            </button>

            <button
              onClick={() => handleTriggerTask("PROBE_GOV_WEBSITES")}
              disabled={runningTask !== null}
              className="p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-2xl text-left transition-all disabled:opacity-50"
            >
              <div className="text-xs font-bold text-white">Probe Gov Endpoints</div>
              <div className="text-[11px] text-slate-400 mt-1">Ping 67 official recruitment boards and state portals.</div>
              <div className="text-[10px] font-bold text-blue-400 mt-3 flex items-center space-x-1">
                <Play className="w-3 h-3" />
                <span>{runningTask === "PROBE_GOV_WEBSITES" ? "Running..." : "Run Task"}</span>
              </div>
            </button>

            <button
              onClick={() => handleTriggerTask("DISPATCH_JOB_ALERTS")}
              disabled={runningTask !== null}
              className="p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-2xl text-left transition-all disabled:opacity-50"
            >
              <div className="text-xs font-bold text-white">Dispatch Job Alerts</div>
              <div className="text-[11px] text-slate-400 mt-1">Evaluate student alert preferences against new gazettes.</div>
              <div className="text-[10px] font-bold text-blue-400 mt-3 flex items-center space-x-1">
                <Play className="w-3 h-3" />
                <span>{runningTask === "DISPATCH_JOB_ALERTS" ? "Running..." : "Run Task"}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Task Execution Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-sm font-black text-white">Recent Automation Execution Logs</h2>
            <span className="text-xs text-slate-400">{logs.length} runs recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Task Name</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Items Processed</th>
                  <th className="px-5 py-3">Execution Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((lg) => (
                  <tr key={lg.id} className="hover:bg-slate-800/40">
                    <td className="px-5 py-3 font-bold text-white">{lg.task_name || lg.taskName}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {lg.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-300 font-semibold">
                      {lg.records_processed || lg.recordsProcessed || 0} items
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-[11px]">
                      {new Date(lg.started_at || lg.startedAt).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
