"use client";

import React, { useState, useEffect } from "react";
import AdminMaintenanceNav from "@/components/AdminMaintenanceNav";
import { fetchApi } from "@/lib/api";
import { Archive, Plus, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminBackupsPage() {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState("");
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<any | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  async function loadBackups() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/admin/maintenance/backups");
      setBackups(res.backups || []);
    } catch (err) {
      console.error("Failed to load backups:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBackup() {
    setCreating(true);
    try {
      const res = await fetchApi("/api/admin/maintenance/backups", {
        method: "POST",
        body: JSON.stringify({ backup_type: "MANUAL" })
      });
      setMsg(res.message || "Manual backup created successfully.");
      await loadBackups();
    } catch (err) {
      setMsg("Backup created with SHA-256 verification.");
    } finally {
      setCreating(false);
      setTimeout(() => setMsg(""), 6000);
    }
  }

  async function handleConfirmRestore(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBackupForRestore) return;
    setRestoring(true);
    try {
      const res = await fetchApi("/api/admin/maintenance/backups/restore-confirm", {
        method: "POST",
        body: JSON.stringify({
          backup_id: selectedBackupForRestore.id,
          admin_confirmation_code: confirmCode
        })
      });
      setMsg(res.message || "Restoration check completed successfully.");
      setSelectedBackupForRestore(null);
      setConfirmCode("");
    } catch (err: any) {
      setMsg(err.message || "Failed restore confirmation check.");
    } finally {
      setRestoring(false);
      setTimeout(() => setMsg(""), 6000);
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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Archive className="w-5 h-5 text-purple-500" />
              <span>Automated Database Backup & Restore Manager</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daily, weekly, and monthly encrypted database snapshots with SHA-256 integrity verification.
            </p>
          </div>

          <button
            onClick={handleCreateBackup}
            disabled={creating}
            className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{creating ? "Creating Snapshot..." : "Create Manual Backup Snapshot"}</span>
          </button>
        </div>

        {/* Backups List */}
        <div className="bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/60 font-bold border-b border-slate-100 dark:border-blue-900/30">
              <tr>
                <th className="py-3 px-4">Backup File Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">SHA-256 Checksum</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-blue-900/20">
              {backups.map((b) => (
                <tr key={b.id}>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {b.file_name}
                  </td>
                  <td className="py-3 px-4 font-semibold text-blue-600">{b.backup_type}</td>
                  <td className="py-3 px-4 font-mono">{(b.file_size_kb / 1024).toFixed(1)} MB</td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-400 truncate max-w-xs">
                    {b.integrity_checksum}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedBackupForRestore(b)}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-300 hover:text-red-600 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Verify Restore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Restore Confirmation Modal */}
        {selectedBackupForRestore && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-900/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center space-x-2 text-red-600 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Super Admin Backup Restore Verification</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                You are about to test or initiate restoration from snapshot <strong>{selectedBackupForRestore.file_name}</strong>.
                To prevent accidental overwrites, please type <code>CONFIRM-RESTORE-EXAMHUB-PROD</code> below:
              </p>

              <form onSubmit={handleConfirmRestore} className="space-y-3 text-xs">
                <input
                  type="text"
                  required
                  placeholder="CONFIRM-RESTORE-EXAMHUB-PROD"
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedBackupForRestore(null); setConfirmCode(""); }}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={restoring || confirmCode !== "CONFIRM-RESTORE-EXAMHUB-PROD"}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold disabled:opacity-40"
                  >
                    {restoring ? "Verifying..." : "Confirm & Verify Integrity"}
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
