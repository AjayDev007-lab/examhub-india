"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, ArrowLeft, Search, CheckCircle2, 
  XCircle, ShieldCheck, Mail, Phone, Calendar, RefreshCw
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/admin/dashboard");
      if (res && res.students) {
        setStudents(res.students);
      }
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = students.filter((s) => {
    const term = search.toLowerCase();
    const name = (s.full_name || s.name || "").toLowerCase();
    const email = (s.email || "").toLowerCase();
    const mobile = (s.mobile || "").toLowerCase();
    return name.includes(term) || email.includes(term) || mobile.includes(term);
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
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Student Accounts & Profiles</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage registered students, authentication statuses, verification credentials, and exam enrollments.
              </p>
            </div>
          </div>

          <button
            onClick={loadStudents}
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
              placeholder="Search by student full name, email address, or mobile number..."
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
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-5 py-3.5">Email & Mobile</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5">Verification</th>
                  <th className="px-5 py-3.5">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-400" />
                      Loading student database...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                      No student accounts found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-white text-sm">{s.full_name || s.name}</div>
                        <div className="text-[11px] text-slate-400">Student ID #{s.id}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-slate-300 font-medium">{s.email}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{s.mobile || "Not linked"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          ACTIVE
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Email Verified</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {s.created_at ? new Date(s.created_at).toLocaleDateString("en-IN") : "Recent"}
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
