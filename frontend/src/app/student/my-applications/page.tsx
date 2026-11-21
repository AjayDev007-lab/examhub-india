"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, Search, Plus, Filter, Calendar, Building2, CheckCircle2, 
  Clock, AlertCircle, Trash2, Edit3, ExternalLink, ChevronRight, Download,
  Sparkles, Check, ArrowRight, ShieldCheck, X, RefreshCw
} from "lucide-react";
import { fetchApi } from "@/lib/api";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  INTERESTED: { label: "Interested", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  NOT_STARTED: { label: "Not Started", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  APPLICATION_STARTED: { label: "Form In Progress", color: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800" },
  PAYMENT_PENDING: { label: "Payment Pending", color: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800" },
  SUBMITTED: { label: "Form Submitted", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" },
  CONFIRMATION_RECEIVED: { label: "Confirmation Slip", color: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800" },
  ADMIT_CARD_RELEASED: { label: "Admit Card Out", color: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 animate-pulse" },
  EXAM_COMPLETED: { label: "Exam Appeared", color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800" },
  RESULT_PUBLISHED: { label: "Result Announced", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 font-bold border border-emerald-300" },
  CANCELLED: { label: "Cancelled", color: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800" },
};

export default function StudentMyApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  
  // Quick Edit Modal state
  const [editingApp, setEditingApp] = useState<any | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editAppNo, setEditAppNo] = useState("");
  const [editRollNo, setEditRollNo] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/student/applications");
      setApplications(res.applications || []);
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenEdit = (app: any) => {
    setEditingApp(app);
    setEditStatus(app.status || "APPLICATION_STARTED");
    setEditAppNo(app.application_number || "");
    setEditRollNo(app.roll_number || "");
    setEditNotes(app.private_notes || "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;
    setSavingEdit(true);
    try {
      await fetchApi(`/api/student/applications/${editingApp.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: editStatus,
          application_number: editAppNo,
          roll_number: editRollNo,
          private_notes: editNotes,
        }),
      });

      setApplications((prev) =>
        prev.map((a) =>
          a.id === editingApp.id
            ? {
                ...a,
                status: editStatus,
                application_number: editAppNo,
                roll_number: editRollNo,
                private_notes: editNotes,
                updated_at: new Date().toISOString(),
              }
            : a
        )
      );
      setEditingApp(null);
    } catch (err: any) {
      alert(err.message || "Failed to update application");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this examination from your tracker?")) return;
    try {
      await fetchApi(`/api/student/applications/${id}`, { method: "DELETE" });
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  };

  const handleExportCSV = () => {
    if (applications.length === 0) return;
    const headers = ["ID,Exam Name,Authority,Status,Application Number,Roll Number,Exam Date,Notes"];
    const rows = applications.map((a) =>
      `"${a.id}","${a.exam_name}","${a.conducting_authority}","${a.status}","${a.application_number || ""}","${a.roll_number || ""}","${a.exam_date || ""}","${(a.private_notes || "").replace(/"/g, '""')}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ExamHub_My_Applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = applications.filter((app) => {
    const term = search.toLowerCase();
    const matchName = (app.exam_name || "").toLowerCase().includes(term);
    const matchAuth = (app.conducting_authority || "").toLowerCase().includes(term);
    const matchAppNo = (app.application_number || "").toLowerCase().includes(term);
    const matchesSearch = matchName || matchAuth || matchAppNo;

    if (!matchesSearch) return false;
    if (filterStatus === "ALL") return true;
    if (filterStatus === "IN_PROGRESS") {
      return ["INTERESTED", "NOT_STARTED", "APPLICATION_STARTED", "PAYMENT_PENDING"].includes(app.status);
    }
    if (filterStatus === "SUBMITTED") {
      return ["SUBMITTED", "CONFIRMATION_RECEIVED"].includes(app.status);
    }
    if (filterStatus === "ADMIT_CARD") {
      return app.status === "ADMIT_CARD_RELEASED";
    }
    if (filterStatus === "COMPLETED") {
      return ["EXAM_COMPLETED", "RESULT_PUBLISHED"].includes(app.status);
    }
    return true;
  });

  const totalCount = applications.length;
  const inProgressCount = applications.filter((a) => ["APPLICATION_STARTED", "PAYMENT_PENDING"].includes(a.status)).length;
  const submittedCount = applications.filter((a) => ["SUBMITTED", "CONFIRMATION_RECEIVED"].includes(a.status)).length;
  const admitCardCount = applications.filter((a) => a.status === "ADMIT_CARD_RELEASED").length;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* 1. HERO HEADER */}
      <section className="bg-gradient-to-b from-[#102D59] via-[#0D2344] to-[#0A1A33] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-300">
            <Link href="/dashboard" className="hover:text-white transition-colors">Student Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
            <span className="text-white">My Application Tracker</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center space-x-3">
                <FileText className="w-8 h-8 text-blue-400" />
                <span>My Examination Applications</span>
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-blue-100/90 max-w-xl">
                Personal lifecycle tracking for all your competitive examination registrations, roll numbers, admit card statuses, and results.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportCSV}
                disabled={applications.length === 0}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-colors flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <Link
                href="/apply"
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Examination</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
              <span className="text-xs text-blue-200 font-medium block">Total Tracked</span>
              <span className="text-xl font-black text-white mt-0.5 block">{totalCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
              <span className="text-xs text-amber-200 font-medium block">In Progress</span>
              <span className="text-xl font-black text-amber-300 mt-0.5 block">{inProgressCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
              <span className="text-xs text-emerald-200 font-medium block">Submitted</span>
              <span className="text-xl font-black text-emerald-300 mt-0.5 block">{submittedCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
              <span className="text-xs text-purple-200 font-medium block">Admit Card Out</span>
              <span className="text-xl font-black text-purple-300 mt-0.5 block">{admitCardCount}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN TABLE / CARD LIST */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: "ALL", label: "All" },
              { id: "IN_PROGRESS", label: "In Progress" },
              { id: "SUBMITTED", label: "Submitted" },
              { id: "ADMIT_CARD", label: "Admit Card" },
              { id: "COMPLETED", label: "Completed" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  filterStatus === tab.id
                    ? "bg-[#102D59] dark:bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by exam or app no..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Loading your tracked applications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
            <FileText className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Applications Tracked Yet</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto">
              Start adding examinations from the centralized application portal to track deadlines, roll numbers, and examination milestones.
            </p>
            <Link
              href="/apply"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Explore Application Directory</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((app) => {
              const statusCfg = STATUS_LABELS[app.status] || STATUS_LABELS.APPLICATION_STARTED;
              return (
                <div
                  key={app.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-[11px] font-bold border border-blue-200/60 dark:border-blue-800">
                        {app.authority_code}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#102D59] dark:text-slate-100">
                      <Link href={`/student/application-details/${app.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {app.exam_name}
                      </Link>
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>Authority: <strong className="text-slate-700 dark:text-slate-300">{app.conducting_authority}</strong></span>
                      {app.application_number && (
                        <span>App No: <strong className="font-mono text-blue-600 dark:text-blue-400">{app.application_number}</strong></span>
                      )}
                      {app.roll_number && (
                        <span>Roll No: <strong className="font-mono text-purple-600 dark:text-purple-400">{app.roll_number}</strong></span>
                      )}
                      {app.exam_date && (
                        <span>Exam Date: <strong className="text-slate-700 dark:text-slate-300">{app.exam_date}</strong></span>
                      )}
                    </div>

                    {app.private_notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        &quot;{app.private_notes}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 self-end md:self-auto">
                    <button
                      onClick={() => handleOpenEdit(app)}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      title="Update status & details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <Link
                      href={`/student/application-details/${app.id}`}
                      className="px-3.5 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl transition-colors"
                    >
                      Details
                    </Link>

                    <button
                      onClick={() => handleDelete(app.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                      title="Remove from tracker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* QUICK EDIT STATUS & CREDENTIALS MODAL */}
      {editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-5">
            <button
              onClick={() => setEditingApp(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Update Application Milestone
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {editingApp.exam_name}
              </h3>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Current Application Lifecycle Status:
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INTERESTED">Interested / Shortlisted</option>
                  <option value="NOT_STARTED">Not Started Yet</option>
                  <option value="APPLICATION_STARTED">Application Form In Progress</option>
                  <option value="PAYMENT_PENDING">Payment Pending</option>
                  <option value="SUBMITTED">Form Submitted Successfully</option>
                  <option value="CONFIRMATION_RECEIVED">Confirmation Slip Received</option>
                  <option value="ADMIT_CARD_RELEASED">Admit Card Released / Downloaded</option>
                  <option value="EXAM_COMPLETED">Exam Appeared</option>
                  <option value="RESULT_PUBLISHED">Result Announced</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Application / Registration No:
                  </label>
                  <input
                    type="text"
                    value={editAppNo}
                    onChange={(e) => setEditAppNo(e.target.value)}
                    placeholder="e.g. UPSC20269871"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Roll Number:
                  </label>
                  <input
                    type="text"
                    value={editRollNo}
                    onChange={(e) => setEditRollNo(e.target.value)}
                    placeholder="e.g. 0812941"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Personal Preparation & Revision Notes:
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Centre in Chennai. Photo ID original required. Revise Modern History."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {savingEdit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
