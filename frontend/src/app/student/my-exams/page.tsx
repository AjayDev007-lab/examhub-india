"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, Plus, Calendar, Clock, CheckCircle2, 
  AlertCircle, ExternalLink, Trash2, Edit3, Search, 
  ArrowRight, ShieldCheck, Filter, FileText, ChevronRight, X
} from "lucide-react";
import StudentNav from "@/components/StudentNav";
import { fetchApi } from "@/lib/api";

export default function MyExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [successMsg, setSuccessMsg] = useState("");

  // Add External Exam Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [extName, setExtName] = useState("");
  const [extAuthority, setExtAuthority] = useState("");
  const [extDate, setExtDate] = useState("");
  const [extDeadline, setExtDeadline] = useState("");
  const [extAppNum, setExtAppNum] = useState("");
  const [extNotes, setExtNotes] = useState("");
  const [extSubmitting, setExtSubmitting] = useState(false);

  // Status Update Modal
  const [editingExam, setEditingExam] = useState<any>(null);
  const [updateStatus, setUpdateStatus] = useState("APPLICATION_SUBMITTED");
  const [updateAppNum, setUpdateAppNum] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");

  useEffect(() => {
    loadMyExams();
  }, [statusFilter]);

  async function loadMyExams() {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("examhub_user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || 1;

      const params = new URLSearchParams();
      params.append("user_id", userId.toString());
      if (statusFilter !== "ALL") params.append("status_filter", statusFilter);

      const res = await fetchApi(`/api/student/exams?${params.toString()}`);
      if (res && res.registered_exams) {
        setExams(res.registered_exams);
      }
    } catch (err) {
      console.error("Failed to load student exams:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddExternalExam(e: React.FormEvent) {
    e.preventDefault();
    setExtSubmitting(true);
    try {
      const userStr = localStorage.getItem("examhub_user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || 1;

      const payload = {
        external_exam_name: extName.trim(),
        external_authority: extAuthority.trim(),
        external_exam_date: new Date(extDate).toISOString(),
        external_application_deadline: extDeadline ? new Date(extDeadline).toISOString() : null,
        application_number: extAppNum.trim() || null,
        notes: extNotes.trim() || null,
        status: "APPLICATION_SUBMITTED"
      };

      const res = await fetchApi(`/api/student/exams/external?user_id=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        setIsAddModalOpen(false);
        setSuccessMsg("External examination added to your dashboard and calendar!");
        setTimeout(() => setSuccessMsg(""), 4000);
        // Reset form
        setExtName("");
        setExtAuthority("");
        setExtDate("");
        setExtDeadline("");
        setExtAppNum("");
        setExtNotes("");
        loadMyExams();
      }
    } catch (err: any) {
      alert("Failed to add examination: " + (err.message || "Unknown error"));
    } finally {
      setExtSubmitting(false);
    }
  }

  async function handleUpdateStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!editingExam) return;

    try {
      const userStr = localStorage.getItem("examhub_user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || 1;

      await fetchApi(`/api/student/exams/${editingExam.id}/status?user_id=${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: updateStatus,
          application_number: updateAppNum || editingExam.application_number,
          notes: updateNotes || editingExam.notes
        })
      });

      setEditingExam(null);
      setSuccessMsg("Application status updated!");
      setTimeout(() => setSuccessMsg(""), 3000);
      loadMyExams();
    } catch (err: any) {
      alert("Failed to update status: " + (err.message || "Unknown error"));
    }
  }

  async function handleRemoveExam(id: number) {
    if (!confirm("Are you sure you want to remove this examination from your tracking list and calendar?")) return;
    try {
      const userStr = localStorage.getItem("examhub_user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || 1;

      await fetchApi(`/api/student/exams/${id}?user_id=${userId}`, {
        method: "DELETE"
      });
      setExams(exams.filter((x) => x.id !== id));
      setSuccessMsg("Examination removed from your list and calendar.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      alert("Failed to remove exam: " + (err.message || "Unknown error"));
    }
  }

  const filteredExams = exams.filter((e) => {
    const title = (e.examination?.name || e.external_exam_name || "").toLowerCase();
    const auth = (e.examination?.code || e.external_authority || "").toLowerCase();
    const appNum = (e.application_number || "").toLowerCase();
    const term = search.toLowerCase();
    return title.includes(term) || auth.includes(term) || appNum.includes(term);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPLICATION_CONFIRMED":
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1"><CheckCircle2 className="w-3 h-3" /><span>Application Confirmed</span></span>;
      case "APPLICATION_SUBMITTED":
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center space-x-1"><Clock className="w-3 h-3" /><span>Application Submitted</span></span>;
      case "REGISTRATION_STARTED":
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1"><AlertCircle className="w-3 h-3" /><span>Registration Started</span></span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Added to My Exams</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <StudentNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                Personal Academic Dashboard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              My Registered Examinations
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Track national and state examinations you are preparing for, monitor application deadlines, and view automated reminders.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/student/examinations"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Explore National Exams</span>
            </Link>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add External Exam</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">Tracked Exams</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{exams.length}</div>
            <span className="text-[11px] text-slate-400">Total in your list</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold text-emerald-600">Confirmed Applications</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {exams.filter((x) => x.status === "APPLICATION_CONFIRMED").length}
            </div>
            <span className="text-[11px] text-slate-400">Admit card & venue ready</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold text-blue-600">Submitted</span>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {exams.filter((x) => x.status === "APPLICATION_SUBMITTED").length}
            </div>
            <span className="text-[11px] text-slate-400">Fee paid & ack generated</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-semibold text-purple-600">Calendar Synced</span>
            <div className="text-2xl font-black text-purple-600 mt-1">{exams.length}</div>
            <span className="text-[11px] text-slate-400">Available on your calendar</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by exam name, code, or application number..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="ALL">All Application Statuses</option>
              <option value="APPLICATION_CONFIRMED">Application Confirmed</option>
              <option value="APPLICATION_SUBMITTED">Application Submitted</option>
              <option value="REGISTRATION_STARTED">Registration Started</option>
              <option value="ADDED_TO_MY_EXAMS">Added to My Exams</option>
            </select>

            <Link
              href="/student/calendar"
              className="px-3.5 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors flex items-center space-x-1"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Open Calendar</span>
            </Link>
          </div>
        </div>

        {/* Examinations List */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading your registered examinations...
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No examinations found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                You haven't added any examinations matching this filter. Browse national examinations or add an external exam you registered for.
              </p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              <Link
                href="/student/examinations"
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Browse National Exams
              </Link>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
              >
                Add External Exam
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExams.map((item) => {
              const examName = item.examination?.name || item.external_exam_name;
              const authority = item.examination?.code || item.external_authority || "Exam Authority";
              const officialUrl = item.official_portal_url || item.examination?.official_website;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {authority}
                        </span>
                        <h3 className="text-base font-black text-slate-900 tracking-tight mt-1 line-clamp-1">
                          {examName}
                        </h3>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    {/* Details Box */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-1.5 text-slate-600">
                      {item.application_number && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Application / Roll No:</span>
                          <span className="font-bold text-slate-900">{item.application_number}</span>
                        </div>
                      )}
                      {item.external_exam_date && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Scheduled Exam Date:</span>
                          <span className="font-bold text-slate-900">
                            {new Date(item.external_exam_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      )}
                      {item.notes && (
                        <div className="pt-1 border-t border-slate-200/60 text-slate-500 italic">
                          "{item.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      {officialUrl && (
                        <a
                          href={officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <span>Official Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setEditingExam(item);
                          setUpdateStatus(item.status);
                          setUpdateAppNum(item.application_number || "");
                          setUpdateNotes(item.notes || "");
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                        title="Update application status"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Update Status</span>
                      </button>
                      <button
                        onClick={() => handleRemoveExam(item.id)}
                        className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Remove from list"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add External Exam Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl relative my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900 text-base">Add Externally Registered Exam</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExternalExam} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Examination Name *</label>
                <input
                  type="text"
                  required
                  value={extName}
                  onChange={(e) => setExtName(e.target.value)}
                  placeholder="e.g. Tamil Nadu Group 2 Combined Services"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Conducting Authority / Commission *</label>
                <input
                  type="text"
                  required
                  value={extAuthority}
                  onChange={(e) => setExtAuthority(e.target.value)}
                  placeholder="e.g. TNPSC or Railway Recruitment Board"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scheduled Exam Date *</label>
                  <input
                    type="date"
                    required
                    value={extDate}
                    onChange={(e) => setExtDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={extDeadline}
                    onChange={(e) => setExtDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Application / Registration Number</label>
                <input
                  type="text"
                  value={extAppNum}
                  onChange={(e) => setExtAppNum(e.target.value)}
                  placeholder="e.g. TNPSC/2026/G2/771829"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preparation Notes / Center Location</label>
                <textarea
                  rows={2}
                  value={extNotes}
                  onChange={(e) => setExtNotes(e.target.value)}
                  placeholder="e.g. Applied via official portal. Test center: Chennai District."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={extSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {extSubmitting ? "Adding..." : "Add to My Calendar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {editingExam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">Update Application Status</h3>
              <button
                onClick={() => setEditingExam(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Application Stage *</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none"
                >
                  <option value="ADDED_TO_MY_EXAMS">Added to My Exams (Planning)</option>
                  <option value="REGISTRATION_STARTED">Registration Started (Portal visited)</option>
                  <option value="APPLICATION_SUBMITTED">Application Submitted (On Gov Portal)</option>
                  <option value="APPLICATION_CONFIRMED">Application Confirmed (Hall ticket issued)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Application / Roll Number</label>
                <input
                  type="text"
                  value={updateAppNum}
                  onChange={(e) => setUpdateAppNum(e.target.value)}
                  placeholder="Official Roll / Ack Number"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Personal Notes</label>
                <textarea
                  rows={2}
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="Study progress or venue details..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingExam(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
