"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Database, ArrowLeft, Download, ShieldCheck, CheckCircle2, 
  AlertTriangle, RefreshCw, HardDrive, History, FileCheck
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminBackupsDisasterRecoveryPage() {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [takingBackup, setTakingBackup] = useState(false);
  const [verificationReport, setVerificationReport] = useState<any | null>(null);

  useEffect(() => {
    loadBackups();
  }, []);

  async function loadBackups() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/admin/backups");
      setBackups(res.backups || []);
    } catch (err) {
      console.error("Failed to load backups:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleTakeSnapshot = async () => {
    setTakingBackup(true);
    try {
      const res = await fetchApi("/api/admin/backups", { method: "POST" });
      if (res && res.backup) {
        setBackups((prev) => [res.backup, ...prev]);
        setVerificationReport(res.verification);
      }
    } catch (err: any) {
      alert(err.message || "Failed to create backup snapshot");
    } finally {
      setTakingBackup(false);
    }
  };

  const handleDownloadSnapshot = (backup: any) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${backup.snapshot_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/dashboard"
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Database Snapshots & Disaster Recovery
              </h1>
              <p className="text-xs text-slate-400">
                Point-in-time state backups, cryptographic checksum validation, and emergency disaster recovery snapshots.
              </p>
            </div>
          </div>

          <button
            onClick={handleTakeSnapshot}
            disabled={takingBackup}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-teal-600/30 flex items-center space-x-2 disabled:opacity-50"
          >
            {takingBackup ? <RefreshCw className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
            <span>Take Point-in-Time Snapshot</span>
          </button>
        </div>

        {/* System Integrity Badge */}
        {verificationReport && (
          <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-800/80 text-xs text-teal-300 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-white">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Snapshot Created Successfully & Verified:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-teal-200">
              <span>Examinations: {verificationReport.records_count?.examinations}</span>
              <span>Applications: {verificationReport.records_count?.applications}</span>
              <span>Countdowns: {verificationReport.records_count?.countdowns}</span>
              <span>Websites: {verificationReport.records_count?.websites}</span>
            </div>
          </div>
        )}

        {/* Snapshots Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-2 p-6">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <History className="w-4 h-4 text-slate-400" />
            <span>Available Backup Snapshots</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Snapshot ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Records Included</th>
                  <th className="p-3">Integrity Checksum</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {backups.map((b) => (
                  <tr key={b.snapshot_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-teal-400">{b.snapshot_id}</td>
                    <td className="p-3 text-slate-300">{new Date(b.created_at).toLocaleString()}</td>
                    <td className="p-3 text-slate-300">
                      {b.data_summary?.examinations || 0} exams, {b.data_summary?.applications || 0} apps, {b.data_summary?.websites || 0} sites
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">{b.checksum}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDownloadSnapshot(b)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download JSON</span>
                      </button>
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
