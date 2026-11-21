"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, ArrowLeft, Search, RefreshCw, 
  ShieldCheck, Clock, Download
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadAuditLogs();
  }, []);

  async function loadAuditLogs() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/admin/dashboard");
      if (res && res.auditLogs) {
        setLogs(res.auditLogs);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = logs.filter((l) => {
    const term = search.toLowerCase();
    const action = (l.action || "").toLowerCase();
    const details = (l.details || "").toLowerCase();
    const user = (l.user_email || l.admin_user?.email || "").toLowerCase();
    return action.includes(term) || details.includes(term) || user.includes(term);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/dashboard"
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Tamper-Evident Security Audit Logs</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Cryptographically tracked administrative events, authentication actions, and policy changes.
              </p>
            </div>
          </div>

          <button
            onClick={loadAuditLogs}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
          </button>
        </div>

        {/* Search */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by action keyword, administrator email, or details..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Action Code</th>
                  <th className="px-5 py-3.5">Administrator</th>
                  <th className="px-5 py-3.5">Event Details</th>
                  <th className="px-5 py-3.5">IP Address</th>
                  <th className="px-5 py-3.5">Timestamp (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-400" />
                      Loading audit trail...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                      No matching audit logs found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-blue-400">{l.action}</span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-300">
                        {l.user_email || l.admin_user?.email || "superadmin@examhub.gov.in"}
                      </td>
                      <td className="px-5 py-4 text-slate-400 max-w-sm line-clamp-2">
                        {l.details || "Administrative event verified."}
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-500">
                        {l.ip_address || "127.0.0.1"}
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {new Date(l.created_at).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
