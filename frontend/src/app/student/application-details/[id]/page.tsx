"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  FileText, ArrowLeft, Building2, Calendar, Clock, CheckCircle2, 
  ExternalLink, Edit3, Trash2, ShieldCheck, Download, AlertCircle,
  Check, Save, RefreshCw, X, ChevronRight, Share2
} from "lucide-react";
import { fetchApi } from "@/lib/api";

const STEPS = [
  { key: "APPLICATION_STARTED", label: "Registration Started" },
  { key: "SUBMITTED", label: "Application Submitted" },
  { key: "CONFIRMATION_RECEIVED", label: "Confirmation Slip" },
  { key: "ADMIT_CARD_RELEASED", label: "Admit Card Issued" },
  { key: "EXAM_COMPLETED", label: "Exam Appeared" },
  { key: "RESULT_PUBLISHED", label: "Result Announced" },
];

export default function SingleStudentApplicationDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "";

  const [application, setApplication] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState("");
  const [appNo, setAppNo] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadApplication();
    }
  }, [id]);

  async function loadApplication() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi(`/api/student/applications/${id}`);
      if (res && res.application) {
        setApplication(res.application);
        setStatus(res.application.status || "APPLICATION_STARTED");
        setAppNo(res.application.application_number || "");
        setRollNo(res.application.roll_number || "");
        setNotes(res.application.private_notes || "");
      } else {
        setError("Application record not found");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load application");
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchApi(`/api/student/applications/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          status,
          application_number: appNo,
          roll_number: rollNo,
          private_notes: notes,
        }),
      });
      setApplication((prev: any) => ({
        ...prev,
        status,
        application_number: appNo,
        roll_number: rollNo,
        private_notes: notes,
        updated_at: new Date().toISOString(),
      }));
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message || "Failed to save updates");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Remove this examination application from your tracker?")) return;
    try {
      await fetchApi(`/api/student/applications/${id}`, { method: "DELETE" });
      window.location.href = "/student/my-applications";
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
        <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold">Loading application details...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{error || "Record Not Found"}</h2>
          <Link
            href="/student/my-applications"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Tracker</span>
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIdx = STEPS.findIndex((s) => s.key === application.status);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* 1. HEADER */}
      <section className="bg-gradient-to-b from-[#102D59] via-[#0D2344] to-[#0A1A33] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-300">
            <Link href="/dashboard" className="hover:text-white transition-colors">Student Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
            <Link href="/student/my-applications" className="hover:text-white transition-colors">My Applications</Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
            <span className="text-white truncate">{application.exam_name}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
                  {application.authority_code}
                </span>
                <span className="text-xs text-blue-200">
                  Updated: {new Date(application.updated_at).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {application.exam_name}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 font-medium">
                {application.conducting_authority}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-colors flex items-center space-x-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? "Close Editor" : "Edit Milestone"}</span>
              </button>

              <button
                onClick={handleDelete}
                className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/30 rounded-xl transition-colors"
                title="Remove from tracker"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BODY CONTENT */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Status Lifecycle Progress Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Application Lifecycle Progression
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {STEPS.map((step, idx) => {
              const isPast = currentStepIdx >= 0 && idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div
                  key={step.key}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isCurrent
                      ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500/20"
                      : isPast
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-semibold"
                      : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="w-5 h-5 mx-auto rounded-full flex items-center justify-center mb-1 text-[10px] font-bold">
                    {isPast ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span className="text-[11px] leading-tight block">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Application Credentials & Details */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Application Credentials & Records</span>
            </h3>
            <Link
              href={`/apply/exam/${application.exam_slug}`}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>View Exam Notice & Syllabus</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Lifecycle Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="INTERESTED">Interested</option>
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="APPLICATION_STARTED">Application In Progress</option>
                    <option value="PAYMENT_PENDING">Official Commission Fee Pending (On Gov Portal)</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="CONFIRMATION_RECEIVED">Confirmation Received</option>
                    <option value="ADMIT_CARD_RELEASED">Admit Card Released</option>
                    <option value="EXAM_COMPLETED">Exam Completed</option>
                    <option value="RESULT_PUBLISHED">Result Published</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Application / Registration Number
                  </label>
                  <input
                    type="text"
                    value={appNo}
                    onChange={(e) => setAppNo(e.target.value)}
                    placeholder="Enter application number"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="Enter roll number"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Private Revision & Exam Notes
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record exam day requirements, reporting time, documents needed..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Application Number</span>
                <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400 mt-1 block">
                  {application.application_number || "Not recorded yet"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Roll Number</span>
                <span className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400 mt-1 block">
                  {application.roll_number || "Not issued yet"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Exam Date</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  {application.exam_date || "Check exam notice"}
                </span>
              </div>

              <div className="sm:col-span-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Private Preparation Notes</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  {application.private_notes || "No notes added. Click 'Edit Milestone' above to add private revision reminders."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links & Safety Advice */}
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Student Record Privacy:</p>
            <p className="text-slate-600 dark:text-slate-400">
              All credentials and notes saved in this tracker remain strictly encrypted and confidential to your student account. ExamHub India never shares your registration data.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
