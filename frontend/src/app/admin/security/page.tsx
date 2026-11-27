"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, ArrowLeft, RefreshCw, AlertTriangle, CheckCircle, 
  Lock, Key, Users, Eye, Activity, ShieldAlert, Check, X, FileText
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function SecurityCentrePage() {
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [securityStatus, setSecurityStatus] = useState<any>({
    firewall: "ACTIVE",
    ssrfProtection: "ENFORCING",
    rateLimiter: "ENABLED (60 req/min per IP)",
    mfaEnforced: true,
    activeAdminSessions: 1,
    activeStudentSessions: 42,
    unresolvedAlerts: 1
  });

  useEffect(() => {
    loadSecurityData();
  }, []);

  async function loadSecurityData() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/admin/security");
      setIncidents(res.incidents || []);
      if (res.securityStatus) {
        setSecurityStatus(res.securityStatus);
      }
    } catch (err: any) {
      console.error("Failed to load security data:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleResolveIncident = async (id: number) => {
    try {
      await fetchApi("/api/admin/security", {
        method: "POST",
        body: JSON.stringify({ action: "RESOLVE_INCIDENT", incidentId: id })
      });
      setIncidents(incidents.map(i => i.id === id ? { ...i, is_resolved: true } : i));
    } catch (err: any) {
      alert("Failed to resolve incident: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Link href="/admin/dashboard" className="hover:text-white flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Admin Dashboard</span>
              </Link>
              <span>/</span>
              <span className="text-red-400 font-semibold">Governance</span>
              <span>/</span>
              <span className="text-slate-200">Security Centre</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Security & Governance Centre</h1>
                <p className="text-xs text-slate-400">Real-time threat monitoring, SSRF defenses, active session audits & incident telemetry</p>
              </div>
            </div>
          </div>

          <button
            onClick={loadSecurityData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-red-400" : ""}`} />
          </button>
        </div>

        {/* Security Health Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400">Outbound request guard</span>
            <div className="text-lg font-black text-emerald-400">{securityStatus.ssrfProtection}</div>
            <span className="text-[10px] text-slate-400">Private, loopback and metadata addresses blocked</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400">Rate Limiter</span>
            <div className="text-lg font-black text-white">{securityStatus.rateLimiter}</div>
            <span className="text-[10px] text-amber-400">Check deployment controls before enabling public traffic</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400">Active Admin Sessions</span>
            <div className="text-lg font-black text-white">{securityStatus.activeAdminSessions ?? "Not tracked"}</div>
            <span className="text-[10px] text-blue-400">Firebase Auth with active-account checks</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400">Open Incidents</span>
            <div className="text-lg font-black text-amber-400">{securityStatus.unresolvedAlerts} alert</div>
            <span className="text-[10px] text-slate-400">Requires triage</span>
          </div>
        </div>

        {/* Incident Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Security Incidents & Telemetry
            </h2>
            <span className="text-xs text-slate-400">Persisted incident records</span>
          </div>

          <div className="space-y-3">
            {incidents.map((inc) => (
              <div 
                key={inc.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.severity === "HIGH" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                      inc.severity === "MEDIUM" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                      "bg-blue-500/20 text-blue-400"
                    }`}>
                      {inc.severity}
                    </span>
                    <strong className="text-white text-xs">{inc.incident_type}</strong>
                    <span className="text-slate-400">• Source: {inc.source_ip}</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{inc.details}</p>
                  <p className="text-[10px] text-slate-500">Resource: {inc.target_resource} | {new Date(inc.created_at).toLocaleString()}</p>
                </div>

                <div>
                  {inc.is_resolved ? (
                    <span className="px-3 py-1 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[11px] font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Resolved
                    </span>
                  ) : (
                    <button
                      onClick={() => handleResolveIncident(inc.id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-all"
                    >
                      Acknowledge & Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roles & Permissions Matrix */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm text-xs">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              Configured Administrative Roles & Permissions
            </h2>
            <p className="text-[11px] text-slate-400">Strict least-privilege matrix enforced across all API endpoints</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white text-xs flex items-center justify-between">
                <span>SUPER_ADMIN</span>
                <span className="text-[10px] text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded">Full System</span>
              </div>
              <p className="text-slate-400 text-[11px]">Unrestricted access: user management, system settings, institution approvals, security & audit logs.</p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white text-xs flex items-center justify-between">
                <span>EXAM_CONTROLLER</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">Examination Ops</span>
              </div>
              <p className="text-slate-400 text-[11px]">Authorized to create examination schedules, upload official syllabus PDFs and verify RRB Group D results.</p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white text-xs flex items-center justify-between">
                <span>SUPPORT_AGENT</span>
                <span className="text-[10px] text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded">Support Desk</span>
              </div>
              <p className="text-slate-400 text-[11px]">Permitted to triage and reply to student support inquiries; zero access to system configuration or user secrets.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
