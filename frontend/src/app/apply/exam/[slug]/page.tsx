"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Building2, Calendar, Clock, MapPin, ShieldCheck, CheckCircle2, 
  AlertCircle, FileText, Download, ExternalLink, ChevronRight, ArrowLeft,
  Check, PlusCircle, AlertTriangle, X, Sparkles, BookOpen, Layers
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function SingleExamApplicationDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";

  const [exam, setExam] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSavedInTracker, setIsSavedInTracker] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);

  useEffect(() => {
    if (slug) {
      loadExamDetails();
      checkIfSavedInTracker();
    }
  }, [slug]);

  async function loadExamDetails() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi(`/api/apply/exams/${slug}`);
      if (res && res.exam) {
        setExam(res.exam);
      } else {
        setError("Examination not found");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load examination details");
    } finally {
      setLoading(false);
    }
  }

  async function checkIfSavedInTracker() {
    try {
      const res = await fetchApi("/api/student/applications");
      const list = res.applications || [];
      const match = list.find((a: any) => a.exam_slug === slug);
      if (match) {
        setIsSavedInTracker(true);
      }
    } catch (_) {}
  }

  const handleTrackApplication = async () => {
    if (!exam) return;
    try {
      await fetchApi("/api/student/applications", {
        method: "POST",
        body: JSON.stringify({
          exam_id: exam.id,
          exam_slug: exam.slug,
          exam_name: exam.name,
          authority_code: exam.authority_code,
          conducting_authority: exam.conducting_authority,
          status: "APPLICATION_STARTED",
          notes: `Added from Exam Details Page. Last date: ${new Date(exam.application_end_date).toLocaleDateString()}`
        })
      });
      setIsSavedInTracker(true);
    } catch (err: any) {
      alert(err.message || "Failed to add to tracker");
    }
  };

  const handleApplyClick = () => {
    setShowRedirectModal(true);
    try {
      fetchApi(`/api/apply/exams/${slug}/click`, { method: "POST" });
    } catch (_) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-4" />
        <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Loading verified examination details...</p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{error || "Examination Not Found"}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The examination you are looking for may have expired, changed its official notification code, or does not exist in our directory.
          </p>
          <Link
            href="/apply"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse All Examinations</span>
          </Link>
        </div>
      </div>
    );
  }

  const daysLeft = Math.ceil(
    (new Date(exam.application_end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* 1. TOP HEADER & BREADCRUMBS */}
      <section className="bg-gradient-to-b from-[#102D59] via-[#0D2344] to-[#0A1A33] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-300">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
            <Link href="/apply" className="hover:text-white transition-colors">Apply Portal</Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
            <span className="text-white truncate">{exam.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
                  {exam.authority_code}
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Official Notification</span>
                </span>
                <span className="text-xs text-blue-200/80 font-medium">
                  State: {exam.state_name}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {exam.name}
              </h1>
              <p className="text-sm sm:text-base text-blue-100/90 font-medium flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-300" />
                <span>{exam.conducting_authority}</span>
              </p>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white/10 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col gap-2 shrink-0 md:min-w-[220px]">
              <button
                onClick={handleApplyClick}
                className="w-full py-3 bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <span>Apply on Official Portal</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                onClick={handleTrackApplication}
                disabled={isSavedInTracker}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-2 ${
                  isSavedInTracker
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 cursor-default"
                    : "bg-white/15 hover:bg-white/25 text-white border border-white/20"
                }`}
              >
                {isSavedInTracker ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>In My Application Tracker</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Track This Application</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BODY CONTENT GRID */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Important Dates Milestone Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Important Examination Timeline</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Application Start</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 block">
                {new Date(exam.application_start_date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
              <span className="text-xs text-amber-700 dark:text-amber-400 block font-bold">Application Deadline</span>
              <span className="text-sm font-extrabold text-amber-900 dark:text-amber-200 mt-1 block">
                {new Date(exam.application_end_date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })}
              </span>
              {daysLeft > 0 && (
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5 block">
                  ({daysLeft} days remaining)
                </span>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Exam Date</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 block">
                {exam.exam_date_display || new Date(exam.exam_date).toLocaleDateString()}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Admit Card Date</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 block">
                {exam.admit_card_date || "To be notified"}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Grid: Eligibility & Fees */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Eligibility Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <span>Eligibility & Qualifications</span>
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Educational Qualification:
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {exam.qualification}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {exam.eligibility}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Age Limit:
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {exam.age_limit}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Age Relaxation Criteria:
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  {exam.age_relaxation}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Total Vacancies:
                </span>
                <span className="inline-block mt-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs">
                  {exam.vacancies}
                </span>
              </div>
            </div>
          </div>

          {/* Fees & Documents Required */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Application Fee & Required Documents</span>
            </h3>

            <div className="space-y-4 text-sm">
              <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/40">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
                  Official Application Fee (Informational Only):
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                  {exam.application_fee}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/50">
                  <strong className="text-slate-800 dark:text-slate-200">Payment Notice:</strong> Application fees are determined and collected solely by the conducting commission ({exam.conducting_authority}) on their official government portal. ExamHub India is completely payment-free and never charges fees or collects card, UPI, or banking credentials.
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Documents to Keep Ready Before Applying:
                </span>
                <ul className="space-y-2">
                  {(exam.required_documents || []).map((doc: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Official Notification:</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Gazette PDF</span>
                </div>
                <a
                  href={exam.official_notification_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Selection Process & Syllabus Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Selection Process & Examination Pattern</span>
          </h3>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(exam.selection_process || []).map((step: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700"
                >
                  Stage {idx + 1}: {step}
                </span>
              ))}
            </div>

            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Syllabus Summary:
              </span>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                {exam.syllabus_summary}
              </p>
            </div>
          </div>
        </div>

        {/* Official Commission Redirect Box */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Direct Commission Submission</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">
              Ready to submit your application?
            </h3>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Applications are submitted exclusively on the verified portal of {exam.conducting_authority}. After completing your submission, return here to record your Application Number in your personal tracker.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleApplyClick}
              className="w-full sm:w-auto px-6 py-3 bg-white text-[#102D59] hover:bg-blue-50 font-extrabold rounded-xl text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center space-x-2"
            >
              <span>Open Official Form</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* OUTGOING OFFICIAL REDIRECT MODAL */}
      {showRedirectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-5">
            <button
              onClick={() => setShowRedirectModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Official Commission Portal Notice
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                You are proceeding to {exam.conducting_authority}
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="font-semibold">Important Security & Anti-Phishing Advisory:</p>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                <li>ExamHub India does <strong>NOT</strong> collect official examination application fees or login passwords.</li>
                <li>Ensure the target browser URL ends with <strong>.gov.in</strong> or <strong>.nic.in</strong> before submitting Aadhaar, documents, or banking OTPs.</li>
                <li>Never share confidential OTPs or registration credentials with any third party.</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-mono break-all text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {exam.official_application_url}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowRedirectModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <a
                href={exam.official_application_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowRedirectModal(false)}
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-2"
              >
                <span>Continue to Official Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
