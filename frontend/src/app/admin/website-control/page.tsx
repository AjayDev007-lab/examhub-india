"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Power, ShieldAlert, CheckCircle2, AlertTriangle, XCircle, 
  Clock, Lock, Eye, ExternalLink, RefreshCw, Sparkles, Key, AlertCircle, Check
} from "lucide-react";
import AdminWebsiteControlNav from "@/components/AdminWebsiteControlNav";
import { fetchApi } from "@/lib/api";

interface WebsiteControlData {
  mode: "ONLINE" | "MAINTENANCE" | "OFFLINE";
  maintenance_message: string;
  estimated_return_time: string | null;
  scheduled_start_time: string | null;
  scheduled_end_time: string | null;
  auto_online_enabled: boolean;
  bypass_secret_key: string;
  last_updated: string | null;
}

export default function AdminWebsiteControlPage() {
  const [data, setData] = useState<WebsiteControlData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [targetMode, setTargetMode] = useState<"ONLINE" | "MAINTENANCE" | "OFFLINE" | null>(null);
  const [reason, setReason] = useState("");
  const [maintenanceMsg, setMaintenanceMsg] = useState("");
  const [estimatedReturn, setEstimatedReturn] = useState("");
  const [offlineConfirmationCode, setOfflineConfirmationCode] = useState("");
  const [adminBypassActive, setAdminBypassActive] = useState(false);

  // Check if admin bypass cookie is already active
  useEffect(() => {
    if (typeof document !== "undefined") {
      const cookies = document.cookie.split(";").map(c => c.trim());
      const hasBypass = cookies.some(c => c.startsWith("examhub_maintenance_bypass="));
      setAdminBypassActive(hasBypass);
    }
    loadControlStatus();
  }, []);

  const loadControlStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi("/api/admin/website-control/status");
      if (res && res.success) {
        setData(res.data);
        if (res.data.maintenance_message) {
          setMaintenanceMsg(res.data.maintenance_message);
        }
        if (res.data.estimated_return_time) {
          setEstimatedReturn(res.data.estimated_return_time);
        }
      } else {
        throw new Error(res?.detail || "Failed to load website operating status");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to website control backend");
    } finally {
      setLoading(false);
    }
  };

  const openTransitionModal = (mode: "ONLINE" | "MAINTENANCE" | "OFFLINE") => {
    setTargetMode(mode);
    setReason("");
    setOfflineConfirmationCode("");
    if (mode === "MAINTENANCE") {
      setMaintenanceMsg(data?.maintenance_message || "ExamHub India is currently undergoing scheduled infrastructure maintenance. We will be back online shortly.");
      setEstimatedReturn(data?.estimated_return_time || "Within 45 minutes");
    }
  };

  const handleExecuteModeChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMode) return;
    if (!reason.trim()) {
      alert("Please provide an audit reason for changing the website operating mode.");
      return;
    }
    if (targetMode === "OFFLINE" && offlineConfirmationCode.trim() !== "CONFIRM-OFFLINE") {
      alert("You must type exact confirmation code 'CONFIRM-OFFLINE' to switch the website to Offline Mode.");
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload: any = {
        mode: targetMode,
        reason: reason.trim(),
        maintenance_message: maintenanceMsg.trim() || undefined,
        estimated_return_time: estimatedReturn.trim() || undefined,
      };

      if (targetMode === "OFFLINE") {
        payload.confirmation_code = offlineConfirmationCode.trim();
      }

      const res = await fetchApi("/api/admin/website-control/mode", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res && res.success) {
        setSuccessMsg(`Website successfully transitioned to ${targetMode} mode.`);
        setTargetMode(null);
        await loadControlStatus();
      } else {
        throw new Error(res?.detail || "Mode transition failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to execute operating mode transition");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleBypassCookie = () => {
    if (adminBypassActive) {
      document.cookie = "examhub_maintenance_bypass=; path=/; max-age=0";
      setAdminBypassActive(false);
      setSuccessMsg("Maintenance bypass disabled. You will now see maintenance screen as a normal visitor.");
    } else {
      document.cookie = `examhub_maintenance_bypass=true; path=/; max-age=86400; SameSite=Lax`;
      setAdminBypassActive(true);
      setSuccessMsg("Maintenance bypass enabled! You can now browse all public pages even during maintenance.");
    }
  };

  const currentMode = data?.mode || "ONLINE";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      <AdminWebsiteControlNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Messages */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start space-x-3 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Action Error</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start space-x-3 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Operation Successful</p>
              <p className="text-xs mt-0.5">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Current Status Banner */}
        <section className="bg-white dark:bg-[#102D59]/30 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-blue-900/40 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Current Operating Status
                </span>
                <button
                  onClick={loadControlStatus}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  title="Refresh Status"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                {currentMode === "ONLINE" && (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 animate-ping absolute" />
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white relative">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                      ONLINE – FULL PUBLIC ACCESS
                    </span>
                  </div>
                )}

                {currentMode === "MAINTENANCE" && (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-amber-500 animate-ping absolute" />
                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white relative">
                      <Clock className="w-3 h-3" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                      MAINTENANCE MODE ACTIVE
                    </span>
                  </div>
                )}

                {currentMode === "OFFLINE" && (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 tracking-tight">
                      OFFLINE – TEMPORARILY DISABLED
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                {currentMode === "ONLINE" &&
                  "ExamHub India is operating at 100% capacity. All examinations, job alerts, school textbooks, countdown timers, and student accounts are fully accessible worldwide."}
                {currentMode === "MAINTENANCE" &&
                  `Public visitors are presented with the official maintenance screen. Public APIs are responding with HTTP 503. Super Admins with bypass access can still navigate and test the website.`}
                {currentMode === "OFFLINE" &&
                  "Public website access is blocked at the application level. Only the Super Admin recovery console and admin endpoints remain accessible for secure restoration."}
              </p>
            </div>

            {/* Admin Bypass Controller */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
              <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">Super Admin Bypass:</span>
                <span className={`font-black ${adminBypassActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                  {adminBypassActive ? "ACTIVE" : "INACTIVE"}
                </span>
                <button
                  onClick={toggleBypassCookie}
                  className="ml-2 text-[11px] font-bold underline text-blue-600 dark:text-blue-400 hover:text-blue-700"
                >
                  {adminBypassActive ? "Deactivate" : "Activate Bypass"}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  href="/maintenance"
                  target="_blank"
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center space-x-1 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Maintenance</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
                <Link
                  href="/offline"
                  target="_blank"
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center space-x-1 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Offline</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Action Cards: 3 Operating Modes */}
        <section className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Available Operating Modes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mode 1: ONLINE */}
            <div className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
              currentMode === "ONLINE"
                ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-md ring-2 ring-emerald-500/20"
                : "bg-white dark:bg-[#102D59]/20 border-slate-200 dark:border-blue-900/30 hover:border-emerald-300 hover:shadow-sm"
            }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  {currentMode === "ONLINE" && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-white">
                      Current Mode
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Bring Website Online</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Normal operating state. Public visitors, students, and institutions have full unrestricted access to all 190+ pages, exams, jobs, and result tools.
                  </p>
                </div>
                <div className="pt-2 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Public browsing active</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Student login & applications active</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>All APIs live & responsive</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  disabled={currentMode === "ONLINE" || actionLoading}
                  onClick={() => openTransitionModal("ONLINE")}
                  className={`w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all shadow-sm ${
                    currentMode === "ONLINE"
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-[0.98]"
                  }`}
                >
                  {currentMode === "ONLINE" ? "Already Online" : "Restore Website Online"}
                </button>
              </div>
            </div>

            {/* Mode 2: MAINTENANCE */}
            <div className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
              currentMode === "MAINTENANCE"
                ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 shadow-md ring-2 ring-amber-500/20"
                : "bg-white dark:bg-[#102D59]/20 border-slate-200 dark:border-blue-900/30 hover:border-amber-300 hover:shadow-sm"
            }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  {currentMode === "MAINTENANCE" && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500 text-white">
                      Current Mode
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Enable Maintenance Mode</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Display professional maintenance notice to students and visitors with optional countdown and estimated recovery time.
                  </p>
                </div>
                <div className="pt-2 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Branded maintenance screen</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Admin portal bypass allowed</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Public APIs return HTTP 503</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  disabled={currentMode === "MAINTENANCE" || actionLoading}
                  onClick={() => openTransitionModal("MAINTENANCE")}
                  className={`w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all shadow-sm ${
                    currentMode === "MAINTENANCE"
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      : "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20 active:scale-[0.98]"
                  }`}
                >
                  {currentMode === "MAINTENANCE" ? "Already In Maintenance" : "Enter Maintenance Mode"}
                </button>
              </div>
            </div>

            {/* Mode 3: OFFLINE */}
            <div className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
              currentMode === "OFFLINE"
                ? "bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-800 shadow-md ring-2 ring-red-500/20"
                : "bg-white dark:bg-[#102D59]/20 border-slate-200 dark:border-blue-900/30 hover:border-red-300 hover:shadow-sm"
            }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
                    <Power className="w-5 h-5" />
                  </div>
                  {currentMode === "OFFLINE" && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-600 text-white">
                      Current Mode
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Take Website Offline</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Disable public traffic completely at the application level. Does not touch DNS, cloud servers, or database. Super Admin recovery tools remain accessible.
                  </p>
                </div>
                <div className="pt-2 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="flex items-center space-x-1.5 text-red-600 dark:text-red-400 font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Strict confirmation required</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-red-600 dark:text-red-400 font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Non-destructive application isolation</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-red-600 dark:text-red-400 font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Emergency token recovery enabled</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  disabled={currentMode === "OFFLINE" || actionLoading}
                  onClick={() => openTransitionModal("OFFLINE")}
                  className={`w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all shadow-sm ${
                    currentMode === "OFFLINE"
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20 active:scale-[0.98]"
                  }`}
                >
                  {currentMode === "OFFLINE" ? "Already Offline" : "Take Website Offline"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Diagnostics Grid */}
        <section className="bg-white dark:bg-[#102D59]/20 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-blue-900/30">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
            Security & Recovery Snapshot
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Control Authority</span>
              <span className="font-bold text-slate-900 dark:text-white mt-1 block">Super Admin Exclusive</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Emergency Master Key</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">Configured & Active</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Audit Logging</span>
              <span className="font-bold text-slate-900 dark:text-white mt-1 block">Full IP & Email Capture</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Monetization Guard</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 mt-1 block">100% Free / Zero Payment</span>
            </div>
          </div>
        </section>

        {/* Transition Confirmation Modal */}
        {targetMode && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                    targetMode === "ONLINE" ? "bg-emerald-600" : targetMode === "MAINTENANCE" ? "bg-amber-600" : "bg-red-600"
                  }`}>
                    {targetMode === "ONLINE" && <Check className="w-5 h-5 stroke-[3]" />}
                    {targetMode === "MAINTENANCE" && <Clock className="w-5 h-5" />}
                    {targetMode === "OFFLINE" && <ShieldAlert className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      Confirm Transition to {targetMode}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Super Admin authorization check required
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTargetMode(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              {/* Warning Notice based on mode */}
              <div className={`p-4 rounded-2xl text-xs space-y-1.5 ${
                targetMode === "ONLINE" 
                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50"
                  : targetMode === "MAINTENANCE"
                  ? "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50"
                  : "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900/50"
              }`}>
                <p className="font-bold flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Impact Notice:</span>
                </p>
                <p className="leading-relaxed">
                  {targetMode === "ONLINE" && "All public users will immediately regain access to examinations, job vacancies, and student dashboards."}
                  {targetMode === "MAINTENANCE" && "All public visitors will be redirected to the maintenance notice. API calls will return 503. Only authorized administrators will have bypass access."}
                  {targetMode === "OFFLINE" && "Public traffic will be completely blocked. Students cannot log in or view information. Administrative recovery routes will remain open."}
                </p>
              </div>

              <form onSubmit={handleExecuteModeChange} className="space-y-4">
                {/* Reason Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Audit Reason <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Scheduled database maintenance, Emergency patch..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Maintenance fields if Maintenance mode */}
                {targetMode === "MAINTENANCE" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Public Notice Message
                      </label>
                      <textarea
                        rows={2}
                        value={maintenanceMsg}
                        onChange={(e) => setMaintenanceMsg(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Estimated Return Time
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 30 minutes, Today at 11:00 PM IST"
                        value={estimatedReturn}
                        onChange={(e) => setEstimatedReturn(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {/* Confirmation check for OFFLINE mode */}
                {targetMode === "OFFLINE" && (
                  <div className="p-3.5 rounded-xl bg-red-100/60 dark:bg-red-950/40 border border-red-300 dark:border-red-900/60 space-y-2">
                    <label className="block text-xs font-black text-red-700 dark:text-red-300">
                      Type &quot;CONFIRM-OFFLINE&quot; to authorize shutdown:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="CONFIRM-OFFLINE"
                      value={offlineConfirmationCode}
                      onChange={(e) => setOfflineConfirmationCode(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl text-xs font-mono uppercase bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setTargetMode(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
                      targetMode === "ONLINE"
                        ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30"
                        : targetMode === "MAINTENANCE"
                        ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/30"
                        : "bg-red-600 hover:bg-red-700 shadow-red-600/30"
                    } ${actionLoading ? "opacity-50 cursor-wait" : ""}`}
                  >
                    {actionLoading ? "Executing Transition..." : `Confirm & Switch to ${targetMode}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
