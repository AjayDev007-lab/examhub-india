"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bell, ArrowLeft, CheckCircle2, AlertTriangle, 
  Info, ShieldAlert, RefreshCw, Check, X, Filter
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminNotificationsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadAlerts();
  }, [statusFilter]);

  async function loadAlerts() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status_filter", statusFilter);

      const res = await fetchApi(`/api/admin/alerts?${params.toString()}`);
      if (res && res.alerts) {
        setAlerts(res.alerts);
      }
    } catch (err) {
      console.error("Failed to load admin alerts:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(id: number, newStatus: string) {
    try {
      await fetchApi(`/api/admin/alerts/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      setAlerts(alerts.map((a) => a.id === id ? { ...a, status: newStatus } : a));
      setSuccessMsg(`Alert status marked as ${newStatus}`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert("Failed to update alert");
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
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Admin Alert & Notification Centre</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time alerts for new institution credentials, gazette approvals, failed jobs, and website probes.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="ALL">All Alerts</option>
              <option value="OPEN">Open Alerts</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <button
              onClick={loadAlerts}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Alerts List */}
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
            Loading administrative alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white">No active alerts</h3>
            <p className="text-xs text-slate-400 mt-1">All platform events have been acknowledged or resolved.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      alert.severity === "CRITICAL"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : alert.severity === "WARNING"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    }`}>
                      {alert.alert_type}
                    </span>
                    <span className={`text-[10px] font-bold ${
                      alert.status === "OPEN" ? "text-amber-400" : "text-slate-500"
                    }`}>
                      • {alert.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                  <p className="text-xs text-slate-400">{alert.message}</p>
                  <span className="text-[10px] text-slate-500 block">
                    {new Date(alert.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {alert.status !== "RESOLVED" && (
                    <button
                      onClick={() => handleUpdateStatus(alert.id, "RESOLVED")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  )}
                  {alert.status === "OPEN" && (
                    <button
                      onClick={() => handleUpdateStatus(alert.id, "ACKNOWLEDGED")}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
