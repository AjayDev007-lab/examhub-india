"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, ArrowLeft, Search, Filter, 
  CheckCircle2, Clock, AlertCircle, ExternalLink, RefreshCw
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminExamRegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadRegistrations();
  }, [statusFilter]);

  async function loadRegistrations() {
    setLoading(true);
    try {
      const res = await fetchApi(`/api/student/exams?status_filter=${statusFilter}`);
      if (res && res.registered_exams) {
        setRegistrations(res.registered_exams);
      }
    } catch (err) {
      console.error("Failed to load registrations:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = registrations.filter((r) => {
    const term = search.toLowerCase();
    const name = (r.examination?.name || r.external_exam_name || "").toLowerCase();
    const appNum = (r.application_number || "").toLowerCase();
    return name.includes(term) || appNum.includes(term);
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
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Student Examination Registrations</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit student application lifecycle states, application roll numbers, and board verifications.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="ALL">All Application Stages</option>
              <option value="APPLICATION_CONFIRMED">Application Confirmed</option>
              <option value="APPLICATION_SUBMITTED">Application Submitted</option>
              <option value="REGISTRATION_STARTED">Registration Started</option>
              <option value="ADDED_TO_MY_EXAMS">Added to My Exams</option>
            </select>

            <button
              onClick={loadRegistrations}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by examination name or student application number..."
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
                  <th className="px-5 py-3.5">Examination & Conducting Body</th>
                  <th className="px-5 py-3.5">Application Number</th>
                  <th className="px-5 py-3.5">Registration Stage</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Registration Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-400" />
                      Loading registrations...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                      No registrations found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-white text-sm">
                          {r.examination?.name || r.external_exam_name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {r.examination?.code || r.external_authority || "Exam Board"}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-slate-300">
                        {r.application_number || "Pending generation"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === "APPLICATION_CONFIRMED"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : r.status === "APPLICATION_SUBMITTED"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}>
                          {r.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[10px] font-bold text-slate-400">
                          {r.is_external ? "External Registration" : "ExamHub Direct"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {r.registration_date ? new Date(r.registration_date).toLocaleDateString("en-IN") : "Recent"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {r.official_portal_url && (
                          <a
                            href={r.official_portal_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-blue-400 hover:underline inline-flex items-center space-x-1"
                          >
                            <span>Official Portal</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
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
