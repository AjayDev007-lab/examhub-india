"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert, ShieldCheck, Activity, RefreshCw, Play, Pause,
  AlertTriangle, CheckCircle2, Clock, RotateCcw, Check, X,
  ExternalLink, Search, Filter, Server, Laptop, BookOpen,
  Briefcase, Send, ChevronRight, Layers, ArrowLeft
} from "lucide-react";
import { GuardianConfig, GuardianIssue, GuardianRepair, GuardianScanResult } from "@/lib/websiteGuardian";

export default function AdminGuardianPage() {
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [activeScanType, setActiveScanType] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Data states
  const [config, setConfig] = useState<GuardianConfig | null>(null);
  const [healthScore, setHealthScore] = useState<number>(100);
  const [stats, setStats] = useState<any>({});
  const [issues, setIssues] = useState<GuardianIssue[]>([]);
  const [repairs, setRepairs] = useState<GuardianRepair[]>([]);
  const [recentScans, setRecentScans] = useState<GuardianScanResult[]>([]);
  const [availabilityHistory, setAvailabilityHistory] = useState<any[]>([]);

  // Filter states
  const [issueFilterSeverity, setIssueFilterSeverity] = useState<string>("ALL");
  const [issueFilterSection, setIssueFilterSection] = useState<string>("ALL");
  const [repairFilterStatus, setRepairFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    fetchGuardianStatus();
  }, []);

  async function fetchGuardianStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/guardian/status");
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setHealthScore(data.healthScore);
        setStats(data.stats || {});
        setIssues(data.issues || []);
        setRepairs(data.repairs || []);
        setRecentScans(data.recentScans || []);
        setAvailabilityHistory(data.availabilityHistory || []);
      }
    } catch (err: any) {
      setStatusMsg({ text: `Failed to load Guardian status: ${err.message}`, error: true });
    } finally {
      setLoading(false);
    }
  }

  async function handleTriggerScan(type: "FULL" | "LINKS" | "CONTENT" | "JOB_EXPIRY") {
    setScanning(true);
    setActiveScanType(type);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/admin/guardian/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanType: type })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ text: `Scan completed: Found ${data.scan.issuesFound} issues, triggered ${data.scan.repairsTriggered} repairs.` });
        fetchGuardianStatus();
      } else {
        setStatusMsg({ text: data.error || "Scan failed", error: true });
      }
    } catch (err: any) {
      setStatusMsg({ text: `Scan error: ${err.message}`, error: true });
    } finally {
      setScanning(false);
      setActiveScanType(null);
    }
  }

  async function handleToggleGuardian() {
    if (!config) return;
    const nextState = !config.enabled;
    try {
      const res = await fetch("/api/admin/guardian/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextState })
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setStatusMsg({ text: `Guardian monitoring ${nextState ? "ENABLED" : "PAUSED"}.` });
      }
    } catch (err: any) {
      setStatusMsg({ text: `Update error: ${err.message}`, error: true });
    }
  }

  async function handleToggleAutoRepair() {
    if (!config) return;
    const nextState = !config.autoRepairEnabled;
    try {
      const res = await fetch("/api/admin/guardian/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoRepairEnabled: nextState })
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setStatusMsg({ text: `Auto-repair ${nextState ? "ENABLED" : "DISABLED"}.` });
      }
    } catch (err: any) {
      setStatusMsg({ text: `Update error: ${err.message}`, error: true });
    }
  }

  async function handleApproveRepair(repairId: string) {
    setActionLoadingId(repairId);
    try {
      const res = await fetch(`/api/admin/guardian/repairs/${repairId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminLabel: "ADMIN_DASHBOARD" })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ text: `Repair ${repairId} approved and applied.` });
        fetchGuardianStatus();
      } else {
        setStatusMsg({ text: data.message || "Approval failed", error: true });
      }
    } catch (err: any) {
      setStatusMsg({ text: `Approval error: ${err.message}`, error: true });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleRejectRepair(repairId: string) {
    setActionLoadingId(repairId);
    try {
      const res = await fetch(`/api/admin/guardian/repairs/${repairId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminLabel: "ADMIN_DASHBOARD" })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ text: `Repair ${repairId} rejected.` });
        fetchGuardianStatus();
      } else {
        setStatusMsg({ text: data.message || "Rejection failed", error: true });
      }
    } catch (err: any) {
      setStatusMsg({ text: `Rejection error: ${err.message}`, error: true });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleRollbackRepair(repairId: string) {
    setActionLoadingId(repairId);
    try {
      const res = await fetch(`/api/admin/guardian/repairs/${repairId}/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminLabel: "ADMIN_DASHBOARD" })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ text: `Repair ${repairId} successfully rolled back.` });
        fetchGuardianStatus();
      } else {
        setStatusMsg({ text: data.message || "Rollback failed", error: true });
      }
    } catch (err: any) {
      setStatusMsg({ text: `Rollback error: ${err.message}`, error: true });
    } finally {
      setActionLoadingId(null);
    }
  }

  const filteredIssues = issues.filter(i => {
    if (issueFilterSeverity !== "ALL" && i.severity !== issueFilterSeverity) return false;
    if (issueFilterSection !== "ALL" && i.section !== issueFilterSection) return false;
    return true;
  });

  const filteredRepairs = repairs.filter(r => {
    if (repairFilterStatus !== "ALL" && r.status !== repairFilterStatus) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/admin/dashboard" className="hover:text-blue-400 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Admin Operations</span>
            </Link>
            <span>/</span>
            <span className="text-white font-semibold">24/7 AI Website Guardian</span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                AI Website Guardian Control Center
              </h1>
              <p className="text-xs text-slate-400">
                Continuous health telemetry, safe auto-repairs, rollback history, and Telegram alerting.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls Header */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchGuardianStatus}
            disabled={loading || scanning}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Vitals</span>
          </button>

          <button
            onClick={handleToggleGuardian}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              config?.enabled
                ? "bg-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-600/30"
                : "bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30"
            }`}
          >
            {config?.enabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{config?.enabled ? "Pause Monitoring" : "Resume Monitoring"}</span>
          </button>
        </div>
      </div>

      {/* Status Notice Banner */}
      {statusMsg && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
          statusMsg.error
            ? "bg-red-950/60 border-red-800 text-red-200"
            : "bg-emerald-950/60 border-emerald-800 text-emerald-200"
        }`}>
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. HEALTH SCORE & VITALS GAUGES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Health Score Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Platform Health Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black ${
              healthScore >= 90 ? "text-emerald-400" : healthScore >= 75 ? "text-amber-400" : "text-red-400"
            }`}>
              {healthScore}
            </span>
            <span className="text-xs text-slate-500 font-semibold">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {healthScore >= 95 ? "All systems operating at peak fidelity" : "Attention needed on active issues"}
          </p>
        </div>

        {/* Monitoring State */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Guardian Status
          </span>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${config?.enabled ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <span className="text-lg font-bold text-white">
              {config?.enabled ? "24/7 ACTIVE" : "PAUSED"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            Last scan: {config?.lastScanAt ? new Date(config.lastScanAt).toLocaleTimeString("en-IN") : "Pending"}
          </p>
        </div>

        {/* Critical Issues */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Critical Unresolved Issues
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black ${stats.criticalIssues > 0 ? "text-red-400" : "text-slate-200"}`}>
              {stats.criticalIssues || 0}
            </span>
            <span className="text-xs text-slate-500">of {stats.totalIssuesRecorded || 0} total</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {stats.criticalIssues > 0 ? "Requires urgent administrator intervention" : "0 severe disruptions detected"}
          </p>
        </div>

        {/* Auto Repairs Applied */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Auto Repairs Applied
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-400">
              {stats.completedRepairs || 0}
            </span>
            <span className="text-xs text-slate-500">executed</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {stats.pendingRepairs || 0} awaiting approval • Full rollback enabled
          </p>
        </div>
      </div>

      {/* 2. ON-DEMAND SCAN LAUNCHER BAR */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>On-Demand Diagnostics & Auditing Engine</span>
          </h2>
          <p className="text-xs text-slate-400">
            Trigger deep serverless scans across endpoints, recruitment deadlines, PDFs, and curriculum content.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleTriggerScan("FULL")}
            disabled={scanning}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
          >
            {activeScanType === "FULL" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>Run Full Scan</span>
          </button>

          <button
            onClick={() => handleTriggerScan("JOB_EXPIRY")}
            disabled={scanning}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            {activeScanType === "JOB_EXPIRY" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
            <span>Scan Job Expiry</span>
          </button>

          <button
            onClick={() => handleTriggerScan("CONTENT")}
            disabled={scanning}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            {activeScanType === "CONTENT" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5" />}
            <span>Scan Content</span>
          </button>

          <button
            onClick={() => handleTriggerScan("LINKS")}
            disabled={scanning}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            {activeScanType === "LINKS" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
            <span>Scan Links</span>
          </button>
        </div>
      </div>

      {/* 3. ACTIVE ISSUES TABLE */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Detected Website & Content Issues</span>
            </h2>
            <p className="text-xs text-slate-400">
              Classified by severity with automated recovery recommendations.
            </p>
          </div>

          {/* Issue Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={issueFilterSeverity}
              onChange={e => setIssueFilterSeverity(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={issueFilterSection}
              onChange={e => setIssueFilterSection(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none"
            >
              <option value="ALL">All Sections</option>
              <option value="Core Infrastructure">Core Infrastructure</option>
              <option value="Government Jobs">Government Jobs</option>
              <option value="IT Jobs">IT Jobs</option>
              <option value="University Papers">University Papers</option>
              <option value="School Learning">School Learning</option>
            </select>
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">Zero Active Issues Found</h3>
            <p className="text-xs text-slate-500">All examined endpoints, links, and content are operating normally.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Problem</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4">AI Recommendation</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Detected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredIssues.map((iss) => (
                  <tr key={iss.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        iss.severity === "CRITICAL" ? "bg-red-950/80 text-red-300 border border-red-800" :
                        iss.severity === "HIGH" ? "bg-orange-950/80 text-orange-300 border border-orange-800" :
                        iss.severity === "MEDIUM" ? "bg-amber-950/80 text-amber-300 border border-amber-800" :
                        "bg-slate-800 text-slate-300"
                      }`}>
                        {iss.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{iss.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{iss.description}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {iss.section}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                      {iss.aiRecommendation}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        iss.status === "REPAIRED" ? "bg-emerald-950 text-emerald-400" :
                        iss.status === "AWAITING_APPROVAL" ? "bg-amber-950 text-amber-400" :
                        "bg-slate-800 text-slate-300"
                      }`}>
                        {iss.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(iss.detectedAt).toLocaleTimeString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. AUTO REPAIRS & ROLLBACK HISTORY */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-blue-400" />
              <span>Auto-Repairs & Full Rollback Ledger</span>
            </h2>
            <p className="text-xs text-slate-400">
              Every applied change preserves the original value and can be rolled back with one click.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={repairFilterStatus}
              onChange={e => setRepairFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none"
            >
              <option value="ALL">All Repair Statuses</option>
              <option value="EXECUTED">Executed</option>
              <option value="PROPOSED">Proposed</option>
              <option value="ROLLED_BACK">Rolled Back</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {filteredRepairs.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs font-semibold">
            No auto-repairs recorded in this view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">Original Value</th>
                  <th className="py-3 px-4">Applied Value</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredRepairs.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {rep.actionType}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {rep.targetResource} #{rep.targetIdentifier}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {JSON.stringify(rep.originalValue)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-emerald-400">
                      {JSON.stringify(rep.appliedValue || rep.proposedValue)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rep.status === "EXECUTED" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" :
                        rep.status === "ROLLED_BACK" ? "bg-purple-950 text-purple-300 border border-purple-800" :
                        rep.status === "REJECTED" ? "bg-red-950 text-red-300" :
                        "bg-amber-950 text-amber-300 border border-amber-800"
                      }`}>
                        {rep.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {rep.status === "PROPOSED" && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApproveRepair(rep.id)}
                            disabled={actionLoadingId === rep.id}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRepair(rep.id)}
                            disabled={actionLoadingId === rep.id}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {rep.status === "EXECUTED" && (
                        <button
                          onClick={() => handleRollbackRepair(rep.id)}
                          disabled={actionLoadingId === rep.id}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-[10px] font-bold border border-slate-700 transition-colors"
                        >
                          Rollback
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. CONFIGURATION & PREFERENCES PANEL */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <Server className="w-4 h-4 text-blue-400" />
          <span>Guardian Engine Settings & Quiet Hours</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="font-bold text-white">Auto-Repair Engine</div>
              <div className="text-[11px] text-slate-400">Safely archive expired jobs & fix broken canonical links</div>
            </div>
            <button
              onClick={handleToggleAutoRepair}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] ${
                config?.autoRepairEnabled ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
              }`}
            >
              {config?.autoRepairEnabled ? "ENABLED" : "DISABLED"}
            </button>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
            <div className="font-bold text-white">Telegram Dispatch Routing</div>
            <div className="text-[11px] text-slate-400">
              Recipient: <strong>@AJ4Y2</strong> (8110670060) • Bot: <strong>@ExamHub_AI_Guardian_Bot</strong>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
            <div className="font-bold text-white">Deduplication Cooldown</div>
            <div className="text-[11px] text-slate-400">
              Identical alert suppression: <strong>15 minutes window</strong> active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
