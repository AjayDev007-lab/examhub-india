"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Activity, ShieldCheck, CheckCircle2, Clock, 
  ExternalLink, RefreshCw, Key, Server, Lock, AlertTriangle, ArrowRight
} from "lucide-react";
import AdminWebsiteControlNav from "@/components/AdminWebsiteControlNav";
import { fetchApi } from "@/lib/api";

export default function AdminWebsiteControlStatusPage() {
  const [statusData, setStatusData] = useState<any>(null);
  const [publicApiCheck, setPublicApiCheck] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [probing, setProbing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatusDiagnostics();
  }, []);

  const loadStatusDiagnostics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi("/api/admin/website-control/status");
      if (res && res.success) {
        setStatusData(res.data);
      } else {
        throw new Error(res?.detail || "Could not read status diagnostics");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch diagnostic state");
    } finally {
      setLoading(false);
    }
  };

  const testPublicEndpoint = async () => {
    setProbing(true);
    try {
      const t0 = performance.now();
      const res = await fetch("/api/status", { cache: "no-store" });
      const elapsed = Math.round(performance.now() - t0);
      const json = await res.json().catch(() => null);
      setPublicApiCheck({
        httpStatus: res.status,
        statusText: res.statusText,
        elapsedMs: elapsed,
        data: json,
        testedAt: new Date().toLocaleTimeString("en-IN"),
      });
    } catch (err: any) {
      setPublicApiCheck({
        httpStatus: 0,
        statusText: "Network/Fetch Error",
        elapsedMs: 0,
        error: err.message,
        testedAt: new Date().toLocaleTimeString("en-IN"),
      });
    } finally {
      setProbing(false);
    }
  };

  const mode = statusData?.mode || "ONLINE";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      <AdminWebsiteControlNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Live Availability Diagnostics & Policy Checks
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time inspection of Edge middleware interception rules, public HTTP response status, and bypass policies.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadStatusDiagnostics}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh State</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Live Diagnostics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#102D59]/30 rounded-3xl p-6 border border-slate-200 dark:border-blue-900/40 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Application Operating Mode
            </span>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                mode === "ONLINE"
                  ? "bg-emerald-500 text-white"
                  : mode === "MAINTENANCE"
                  ? "bg-amber-500 text-white"
                  : "bg-red-600 text-white"
              }`}>
                {mode}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {mode === "ONLINE" && "Full public routing active across all website modules."}
              {mode === "MAINTENANCE" && "Non-admin traffic routed to /maintenance. Admins with cookie bypass clean."}
              {mode === "OFFLINE" && "Traffic isolated at application edge to /offline."}
            </p>
          </div>

          <div className="bg-white dark:bg-[#102D59]/30 rounded-3xl p-6 border border-slate-200 dark:border-blue-900/40 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Auto Online Scheduler
            </span>
            <div className="flex items-center space-x-2">
              <span className={`font-mono text-sm font-black ${statusData?.auto_online_enabled ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                {statusData?.auto_online_enabled ? "ENABLED" : "DISABLED"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {statusData?.scheduled_end_time 
                ? `Maintenance window closes at: ${new Date(statusData.scheduled_end_time).toLocaleString("en-IN")}`
                : "No automated scheduled return window active."}
            </p>
          </div>

          <div className="bg-white dark:bg-[#102D59]/30 rounded-3xl p-6 border border-slate-200 dark:border-blue-900/40 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Emergency Failsafe Key
            </span>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                MASTER RECOVERY ARMED
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Super Admin master key allows 1-click unblock even if admin UI is completely disconnected.
            </p>
          </div>
        </div>

        {/* Real-Time Public Edge Probe */}
        <section className="bg-white dark:bg-[#102D59]/20 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-blue-900/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Live Public Endpoint Probe (`GET /api/status`)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Execute a direct probe to test the exact response received by public devices and automated monitoring systems.
              </p>
            </div>
            <button
              onClick={testPublicEndpoint}
              disabled={probing}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 flex items-center space-x-2 transition-all shrink-0"
            >
              <Activity className={`w-3.5 h-3.5 ${probing ? "animate-spin" : ""}`} />
              <span>{probing ? "Probing Edge..." : "Execute Public Probe"}</span>
            </button>
          </div>

          {publicApiCheck ? (
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-800">
                <span className="text-slate-400">Probe timestamp: {publicApiCheck.testedAt}</span>
                <span className="text-emerald-400 font-bold">{publicApiCheck.elapsedMs} ms latency</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-slate-400">HTTP Status:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  publicApiCheck.httpStatus === 200 
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}>
                  {publicApiCheck.httpStatus} {publicApiCheck.statusText}
                </span>
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-slate-400 block text-[11px]">Payload Response:</span>
                <pre className="p-3 bg-slate-950 rounded-xl overflow-x-auto text-[11px] text-blue-300">
                  {JSON.stringify(publicApiCheck.data, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              Click &quot;Execute Public Probe&quot; to test the real-time response from the Edge middleware.
            </div>
          )}
        </section>

        {/* Middleware Interception Rule Table */}
        <section className="bg-white dark:bg-[#102D59]/20 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-blue-900/30 space-y-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Edge Middleware Interception Rules Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold text-[10px] uppercase">
                  <th className="pb-3">Route Pattern</th>
                  <th className="pb-3">Target Scope</th>
                  <th className="pb-3">ONLINE Behavior</th>
                  <th className="pb-3">MAINTENANCE Behavior</th>
                  <th className="pb-3">OFFLINE Behavior</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">
                <tr>
                  <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">/admin/*</td>
                  <td className="py-3">Super Admin Console</td>
                  <td className="py-3 text-emerald-600 dark:text-emerald-400">Full Access</td>
                  <td className="py-3 text-emerald-600 dark:text-emerald-400">Full Access (Bypass)</td>
                  <td className="py-3 text-emerald-600 dark:text-emerald-400">Full Access (Recovery)</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">/api/admin/*</td>
                  <td className="py-3">Admin APIs</td>
                  <td className="py-3 text-emerald-600 dark:text-emerald-400">Full Access</td>
                  <td className="py-3 text-emerald-600 dark:text-emerald-400">Full Access</td>
                  <td className="py-3 text-emerald-600 dark:text-emerald-400">Full Access</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">/api/status</td>
                  <td className="py-3">Availability Telemetry</td>
                  <td className="py-3 text-emerald-600 dark:text-emerald-400">HTTP 200 OK</td>
                  <td className="py-3 text-amber-600 dark:text-amber-400">HTTP 200 (Mode: MAINT)</td>
                  <td className="py-3 text-red-600 dark:text-red-400">HTTP 200 (Mode: OFFLINE)</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">/api/* (Public)</td>
                  <td className="py-3">Public Student APIs</td>
                  <td className="py-3 text-emerald-600 dark:text-emerald-400">HTTP 200 OK</td>
                  <td className="py-3 text-amber-600 dark:text-amber-400">HTTP 503 (Retry-After)</td>
                  <td className="py-3 text-red-600 dark:text-red-400">HTTP 503 Service Unavailable</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">/* (Public Pages)</td>
                  <td className="py-3">All public web pages</td>
                  <td className="py-3 text-emerald-600 dark:text-emerald-400">Render Page Normally</td>
                  <td className="py-3 text-amber-600 dark:text-amber-400">Rewrite to /maintenance</td>
                  <td className="py-3 text-red-600 dark:text-red-400">Rewrite to /offline</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
