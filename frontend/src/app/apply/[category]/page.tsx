"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Search, Award, Filter, Calendar, Building2, MapPin, ExternalLink, 
  Clock, ShieldCheck, CheckCircle2, AlertCircle, FileText, Download,
  ArrowRight, Sparkles, PlusCircle, Check, HelpCircle, ChevronRight, X,
  ArrowLeft, BookOpen, AlertTriangle
} from "lucide-react";
import { fetchApi } from "@/lib/api";

const CATEGORY_MAP: Record<string, { title: string; categoryKey?: string; statusKey?: string; description: string }> = {
  "central-government": {
    title: "Central Government Examinations",
    categoryKey: "CENTRAL_GOVERNMENT",
    description: "All-India competitive examinations conducted by Union Public Service Commission (UPSC), Staff Selection Commission (SSC), and central departments."
  },
  "state-government": {
    title: "State Government & Public Service Commissions",
    categoryKey: "STATE_GOVERNMENT",
    description: "State civil services, administrative recruitments, and departmental competitive examinations across 28 Indian States & 8 Union Territories."
  },
  "railway": {
    title: "Railway Recruitment Boards (RRB / RRC)",
    categoryKey: "RAILWAY",
    description: "Official notifications for Indian Railways NTPC, Group D, Assistant Loco Pilot (ALP), Junior Engineer, and Paramedical cadres."
  },
  "banking": {
    title: "Banking & Financial Sector Examinations",
    categoryKey: "BANKING",
    description: "IBPS PO, Clerk, SO, SBI, RBI Grade B, and NABARD officer recruitment drives."
  },
  "defence": {
    title: "Defence & Armed Forces Recruitments",
    categoryKey: "DEFENCE",
    description: "NDA, CDS, AFCAT, CAPF, and Indian Coast Guard officer selection examinations."
  },
  "entrance": {
    title: "All-India Entrance Examinations",
    categoryKey: "ENTRANCE",
    description: "Centralized national entrance tests for higher education, universities, and professional course admissions."
  },
  "medical": {
    title: "Medical & Health Sciences Entrance & Jobs",
    categoryKey: "MEDICAL",
    description: "NEET UG, NEET PG, AIIMS, INI-CET, and central medical services recruitments."
  },
  "engineering": {
    title: "Engineering & Technical Examinations",
    categoryKey: "ENGINEERING",
    description: "JEE Main, JEE Advanced, GATE, and public sector engineering executive trainee recruitments."
  },
  "teaching": {
    title: "Teaching & Faculty Eligibility Tests",
    categoryKey: "TEACHING",
    description: "UGC NET, CSIR NET, CTET, and State Teacher Eligibility Tests (TET)."
  },
  "university": {
    title: "University Admissions & CUET",
    categoryKey: "UNIVERSITY",
    description: "Common University Entrance Test (CUET UG/PG) and Central University admissions."
  },
  "closing-soon": {
    title: "Examinations Closing Soon",
    statusKey: "CLOSING_SOON",
    description: "Application deadlines ending within the next 7 days. Submit your forms before the official commission portals close."
  },
  "upcoming": {
    title: "Upcoming Examination Notifications",
    statusKey: "UPCOMING",
    description: "Advance notices, gazette calendars, and scheduled examinations announced for the 2026-2027 academic and recruitment cycle."
  }
};

export default function CategoryExamsPage() {
  const params = useParams();
  const categorySlug = (params?.category as string) || "";
  const categoryInfo = CATEGORY_MAP[categorySlug] || {
    title: categorySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) + " Examinations",
    description: "Verified Indian examination notifications and application links."
  };

  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedTrackerIds, setSavedTrackerIds] = useState<number[]>([]);
  const [activeRedirectExam, setActiveRedirectExam] = useState<any | null>(null);

  useEffect(() => {
    loadCategoryExams();
    loadSavedApplications();
  }, [categorySlug]);

  async function loadCategoryExams() {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams();
      if (categoryInfo.categoryKey) {
        urlParams.append("category", categoryInfo.categoryKey);
      }
      if (categoryInfo.statusKey) {
        urlParams.append("status", categoryInfo.statusKey);
      }
      if (searchQuery.trim()) {
        urlParams.append("q", searchQuery.trim());
      }

      const res = await fetchApi(`/api/apply/exams?${urlParams.toString()}`);
      setExams(res.exams || []);
    } catch (err) {
      console.error("Failed to load category exams:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadSavedApplications() {
    try {
      const res = await fetchApi("/api/student/applications");
      const ids = (res.applications || []).map((a: any) => a.exam_id);
      setSavedTrackerIds(ids);
    } catch (_) {}
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCategoryExams();
  };

  const handleTrackApplication = async (exam: any) => {
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
          notes: `Added from ${categoryInfo.title}. Deadline: ${new Date(exam.application_end_date).toLocaleDateString()}`
        })
      });
      setSavedTrackerIds((prev) => [...prev, exam.id]);
    } catch (err: any) {
      alert(err.message || "Failed to add to tracker");
    }
  };

  const handleApplyClick = (exam: any) => {
    setActiveRedirectExam(exam);
    try {
      fetchApi(`/api/apply/exams/${exam.slug}/click`, { method: "POST" });
    } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <section className="bg-gradient-to-b from-[#102D59] via-[#0D2344] to-[#0A1A33] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-300">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
            <Link href="/apply" className="hover:text-white transition-colors">Apply Portal</Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
            <span className="text-white truncate">{categoryInfo.title}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                {categoryInfo.title}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-blue-100/90 max-w-2xl leading-relaxed">
                {categoryInfo.description}
              </p>
            </div>

            <Link
              href="/apply"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-white transition-colors self-start md:self-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Categories</span>
            </Link>
          </div>

          {/* Quick Search inside category */}
          <form onSubmit={handleSearchSubmit} className="pt-4 max-w-2xl">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search within ${categoryInfo.title.toLowerCase()}...`}
                className="w-full pl-12 pr-28 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Showing <span className="text-blue-600 dark:text-blue-400 font-bold">{exams.length}</span> verified notifications
          </p>
          <Link
            href="/student/my-applications"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>My Tracked Applications</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Fetching verified government examination schedules...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
            <FileText className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Examinations Found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md mx-auto">
              No matching records found for this category or search query. Browse all examinations to explore open applications.
            </p>
            <Link
              href="/apply"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Master Directory</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((exam) => {
              const isSaved = savedTrackerIds.includes(exam.id);
              const daysLeft = Math.ceil(
                (new Date(exam.application_end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
              );

              return (
                <div
                  key={exam.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-200/60 dark:border-blue-800">
                            {exam.authority_code}
                          </span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {exam.state_name}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[#102D59] dark:text-slate-100 mt-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          <Link href={`/apply/exam/${exam.slug}`}>
                            {exam.name}
                          </Link>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {exam.conducting_authority}
                        </p>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                          exam.status === "APPLICATION_OPEN"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : exam.status === "CLOSING_SOON"
                            ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 animate-pulse"
                            : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                        }`}
                      >
                        {exam.status === "APPLICATION_OPEN"
                          ? "Apply Open"
                          : exam.status === "CLOSING_SOON"
                          ? "Closing Soon"
                          : "Upcoming"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block font-medium">Last Date:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {new Date(exam.application_end_date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </span>
                        {daysLeft > 0 && daysLeft <= 10 && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-bold">
                            ({daysLeft} days remaining)
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block font-medium">Exam Date:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {exam.exam_date_display || new Date(exam.exam_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                        <span className="text-slate-500 dark:text-slate-400 block font-medium">Eligibility:</span>
                        <span className="text-slate-700 dark:text-slate-300 font-semibold line-clamp-1">
                          {exam.qualification}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleTrackApplication(exam)}
                      disabled={isSaved}
                      className={`text-xs font-semibold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors ${
                        isSaved
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 cursor-default"
                          : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Tracked</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Add to Tracker</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/apply/exam/${exam.slug}`}
                        className="text-xs font-semibold px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Details
                      </Link>

                      <button
                        onClick={() => handleApplyClick(exam)}
                        className="text-xs font-bold px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
                      >
                        <span>Apply Online</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* OUTGOING OFFICIAL REDIRECT MODAL */}
      {activeRedirectExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-5">
            <button
              onClick={() => setActiveRedirectExam(null)}
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
                You are proceeding to {activeRedirectExam.conducting_authority}
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
              {activeRedirectExam.official_application_url}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setActiveRedirectExam(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <a
                href={activeRedirectExam.official_application_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setActiveRedirectExam(null)}
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
