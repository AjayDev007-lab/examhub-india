"use client";

import React, { useState, useEffect } from "react";
import { 
  Sliders, ShieldAlert, Save, Clock,
  CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, Power
} from "lucide-react";
import AdminWebsiteControlNav from "@/components/AdminWebsiteControlNav";
import { fetchApi } from "@/lib/api";

export default function AdminWebsiteControlSettingsPage() {
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [estimatedReturnTime, setEstimatedReturnTime] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [autoOnlineEnabled, setAutoOnlineEnabled] = useState(false);

  // Emergency Recovery Form
  const [recoveryReason, setRecoveryReason] = useState("");
  const [recoverySubmitting, setRecoverySubmitting] = useState(false);

  // Page State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi("/api/admin/website-control/status");
      if (res && res.success) {
        const d = res.data;
        setMaintenanceMessage(d.maintenance_message || "");
        setEstimatedReturnTime(d.estimated_return_time || "");
        setScheduledStart(d.scheduled_start_time || "");
        setScheduledEnd(d.scheduled_end_time || "");
        setAutoOnlineEnabled(d.auto_online_enabled || false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load current maintenance settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetchApi("/api/admin/website-control/settings", {
        method: "PUT",
        body: JSON.stringify({
          maintenance_message: maintenanceMessage.trim(),
          estimated_return_time: estimatedReturnTime.trim() || undefined,
          scheduled_start_time: scheduledStart || undefined,
          scheduled_end_time: scheduledEnd || undefined,
          auto_online_enabled: autoOnlineEnabled,
        }),
      });

      if (res && res.success) {
        setSuccessMsg("Maintenance window schedules and custom messages saved successfully.");
      } else {
        throw new Error(res?.detail || "Failed to save settings");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleEmergencyRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Execute Emergency Restore? This will instantly force the website status back to ONLINE.")) {
      return;
    }

    setRecoverySubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetchApi("/api/admin/website-control/emergency-recovery", {
        method: "POST",
        body: JSON.stringify({
          reason: recoveryReason.trim() || "Emergency administrator recovery",
        }),
      });

      if (res && res.success) {
        setSuccessMsg("EMERGENCY RESTORE COMPLETE: ExamHub India is now forced ONLINE.");
        setRecoveryReason("");
        await loadSettings();
      } else {
        throw new Error(res?.detail || "Recovery token invalid or rejected");
      }
    } catch (err: any) {
      setError(err.message || "Emergency restore failed");
    } finally {
      setRecoverySubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      <AdminWebsiteControlNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Schedule Windows & Emergency Recovery Console
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure automated maintenance return windows, custom visitor notices, and master emergency override controls.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start space-x-3 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">Error Notice</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start space-x-3 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">Success</p>
              <p className="mt-0.5">{successMsg}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scheduled Maintenance & Messages */}
          <section className="bg-white dark:bg-[#102D59]/20 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-blue-900/30 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Maintenance Window & Custom Notices
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Custom messages shown to public visitors during maintenance
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Public Maintenance Notice Message
                </label>
                <textarea
                  rows={3}
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  placeholder="ExamHub India is undergoing scheduled system upgrades..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Return Time (Human Readable)
                </label>
                <input
                  type="text"
                  value={estimatedReturnTime}
                  onChange={(e) => setEstimatedReturnTime(e.target.value)}
                  placeholder="e.g. 45 minutes, Today at 10:30 PM IST"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Scheduled Start Window
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledStart}
                    onChange={(e) => setScheduledStart(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Scheduled End Window
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledEnd}
                    onChange={(e) => setScheduledEnd(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <input
                  type="checkbox"
                  id="auto_online"
                  checked={autoOnlineEnabled}
                  onChange={(e) => setAutoOnlineEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="auto_online" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <span className="font-bold block">Auto-Return Online</span>
                  <span className="text-[11px] text-slate-500 block">
                    Automatically bring website back to ONLINE mode when scheduled end window expires.
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving Changes..." : "Save Maintenance Configuration"}</span>
                </button>
              </div>
            </form>
          </section>

          {/* Master Emergency Recovery Console */}
          <section className="bg-red-50/40 dark:bg-red-950/20 rounded-3xl p-6 sm:p-8 border border-red-200 dark:border-red-900/40 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/60 flex items-center justify-center text-red-600 dark:text-red-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-red-700 dark:text-red-300">
                  Administrator Recovery
                </h3>
                <p className="text-xs text-red-600/80 dark:text-red-400/80">
                  Return the website to ONLINE. This action is recorded in the audit history.
                </p>
              </div>
            </div>

            <form onSubmit={handleEmergencyRestore} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Emergency Justification Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Accidental offline lockdown recovery"
                  value={recoveryReason}
                  onChange={(e) => setRecoveryReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={recoverySubmitting}
                  className="w-full py-3 rounded-2xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.99]"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{recoverySubmitting ? "Restoring Online..." : "RETURN WEBSITE ONLINE"}</span>
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
