"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, ArrowLeft, Users, BarChart3, TrendingUp, CheckCircle2, 
  Clock, Download, RefreshCw, ChevronRight, ShieldCheck, Filter
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminApplicationsAnalyticsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/student/applications");
      setApplications(res.applications || []);
    } catch (err) {
      console.error("Failed to load applications analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  const total = applications.length;
  const started = applications.filter((a) => a.status === "APPLICATION_STARTED").length;
  const submitted = applications.filter((a) => a.status === "SUBMITTED").length;
  const confirmed = applications.filter((a) => a.status === "CONFIRMATION_RECEIVED").length;
  const admitCard = applications.filter((a) => a.status === "ADMIT_CARD_RELEASED").length;
  const completed = applications.filter((a) => a.status === "EXAM_COMPLETED").length;
  const results = applications.filter((a) => a.status === "RESULT_PUBLISHED").length;

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
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Student Applications Analytics
              </h1>
              <p className="text-xs text-slate-400">
                Aggregated student application tracking metrics, conversion funnel, and lifecycle drop-offs.
              </p>
            </div>
          </div>
        </div>

        {/* Funnel Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Total Tracked</span>
            <span className="text-2xl font-black text-white mt-1 block">{total}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider block">In Progress</span>
            <span className="text-2xl font-black text-blue-400 mt-1 block">{started}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider block">Submitted</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">{submitted + confirmed}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-purple-400 font-semibold uppercase tracking-wider block">Admit Cards</span>
            <span className="text-2xl font-black text-purple-400 mt-1 block">{admitCard}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider block">Exam Appeared</span>
            <span className="text-2xl font-black text-indigo-400 mt-1 block">{completed}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-teal-400 font-semibold uppercase tracking-wider block">Results Out</span>
            <span className="text-2xl font-black text-teal-400 mt-1 block">{results}</span>
          </div>
        </div>

        {/* Lifecycle Flow Analysis */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Student Registration Lifecycle Funnel</span>
          </h2>

          <div className="space-y-3">
            {[
              { label: "1. Shortlisted / Form In Progress", count: started, total, color: "bg-blue-500" },
              { label: "2. Form Successfully Submitted", count: submitted + confirmed, total, color: "bg-emerald-500" },
              { label: "3. Hall Ticket / Admit Card Issued", count: admitCard, total, color: "bg-purple-500" },
              { label: "4. Candidate Appeared in Exam", count: completed, total, color: "bg-indigo-500" },
              { label: "5. Official Result & Scorecard Published", count: results, total, color: "bg-teal-500" },
            ].map((stage, idx) => {
              const pct = total > 0 ? Math.round((stage.count / total) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{stage.label}</span>
                    <span className="text-slate-400">{stage.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className={`h-full ${stage.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Tracked Submissions Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-2 p-6">
          <h3 className="text-sm font-bold text-white">Recent Tracked Examination Registrations</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Exam Name</th>
                  <th className="p-3">Authority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">App Number</th>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {applications.slice(0, 15).map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-white">{app.exam_name}</td>
                    <td className="p-3 text-slate-400">{app.conducting_authority}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {app.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-blue-400">{app.application_number || "-"}</td>
                    <td className="p-3 font-mono text-purple-400">{app.roll_number || "-"}</td>
                    <td className="p-3 text-slate-400">{new Date(app.updated_at).toLocaleDateString()}</td>
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
