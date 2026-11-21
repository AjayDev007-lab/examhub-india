"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, Award, Filter, Calendar, Building2, MapPin, ExternalLink, 
  Clock, ShieldCheck, CheckCircle2, AlertCircle, FileText, Download,
  ArrowRight, Sparkles, PlusCircle, Check, HelpCircle, ChevronRight, X
} from "lucide-react";
import { fetchApi } from "@/lib/api";

const CATEGORIES = [
  { id: "ALL", name: "All Exams", icon: Sparkles },
  { id: "CENTRAL_GOVERNMENT", name: "Central Government", path: "/apply/central-government" },
  { id: "STATE_GOVERNMENT", name: "State Government", path: "/apply/state-government" },
  { id: "RAILWAY", name: "Railway", path: "/apply/railway" },
  { id: "BANKING", name: "Banking", path: "/apply/banking" },
  { id: "DEFENCE", name: "Defence", path: "/apply/defence" },
  { id: "ENTRANCE", name: "Entrance Tests", path: "/apply/entrance" },
  { id: "MEDICAL", name: "Medical", path: "/apply/medical" },
  { id: "ENGINEERING", name: "Engineering", path: "/apply/engineering" },
  { id: "TEACHING", name: "Teaching", path: "/apply/teaching" },
  { id: "UNIVERSITY", name: "University", path: "/apply/university" },
  { id: "CLOSING_SOON", name: "Closing Soon", path: "/apply/closing-soon" },
  { id: "UPCOMING", name: "Upcoming", path: "/apply/upcoming" },
];

export default function ExamApplicationPortalPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [savedTrackerIds, setSavedTrackerIds] = useState<number[]>([]);
  
  // Official Apply Outgoing Modal
  const [activeRedirectExam, setActiveRedirectExam] = useState<any | null>(null);

  useEffect(() => {
    loadExams();
    loadSavedApplications();
  }, [selectedCategory, selectedStatus]);

  async function loadExams() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "ALL") params.append("category", selectedCategory);
      if (selectedStatus !== "ALL") params.append("status", selectedStatus);
      if (searchQuery.trim()) params.append("q", searchQuery.trim());

      const res = await fetchApi(`/api/apply/exams?${params.toString()}`);
      setExams(res.exams || []);
    } catch (err) {
      console.error("Failed to load exams:", err);
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
    loadExams();
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
          notes: `Added from Exam Application Portal. Last date: ${new Date(exam.application_end_date).toLocaleDateString()}`
        })
      });
      setSavedTrackerIds((prev) => [...prev, exam.id]);
    } catch (err: any) {
      alert(err.message || "Failed to add to tracker");
    }
  };

  const handleApplyClick = async (exam: any) => {
    setActiveRedirectExam(exam);
    // Track click asynchronously
    try {
      fetchApi(`/api/apply/exams/${exam.slug}/click`, { method: "POST" });
    } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* 1. HERO HEADER */}
      <section className="bg-gradient-to-b from-[#102D59] via-[#0D2344] to-[#0A1A33] text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Centralized All-India Examination Application Directory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            One-Stop <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300">Examination Application</span> Portal
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Discover verified examination schedules, eligibility criteria, official notification gazettes, and authorized application portals across India.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Exam Name, Authority (e.g., UPSC, NEET, SSC CGL, RRB, TNPSC)..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg font-medium placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              className="px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-lg transition-all shrink-0 flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Search Exams</span>
            </button>
          </form>
        </div>
      </section>

      {/* 2. CATEGORY PILLS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 shadow-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 shrink-0 ${
                  isSelected
                    ? "bg-[#102D59] text-white shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. CONTROLS & EXAM LIST */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {selectedCategory === "ALL" ? "All Examination Directories" : CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {exams.length} verified examination applications with confirmed source portals
            </p>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Application Statuses</option>
              <option value="APPLICATION_OPEN">🟢 Application Open</option>
              <option value="CLOSING_SOON">⚠️ Closing Soon</option>
              <option value="UPCOMING">📅 Upcoming</option>
              <option value="NOTIFICATION_RELEASED">📄 Notification Released</option>
            </select>

            <Link
              href="/student/my-applications"
              className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-xl transition-colors whitespace-nowrap"
            >
              My Application Tracker →
            </Link>
          </div>
        </div>

        {/* Exams Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse space-y-4">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded"></div>
              </div>
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 max-w-lg mx-auto space-y-4">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No examinations found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No active examinations matched your query. Try clearing filters or searching with general keywords like UPSC, SSC, NEET, or RRB.
            </p>
            <button
              onClick={() => { setSelectedCategory("ALL"); setSelectedStatus("ALL"); setSearchQuery(""); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => {
              const isClosingSoon = exam.status === "CLOSING_SOON";
              const isSavedInTracker = savedTrackerIds.includes(exam.id);

              return (
                <div
                  key={exam.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Header Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                          {exam.authority_code}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {exam.category_label}
                        </span>
                      </div>

                      {/* Status pill */}
                      {isClosingSoon ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 animate-pulse">
                          Closing Soon
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                          {exam.status === "APPLICATION_OPEN" ? "Apply Open" : exam.status === "UPCOMING" ? "Upcoming" : "Released"}
                        </span>
                      )}
                    </div>

                    {/* Title & Conducting Body */}
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {exam.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{exam.conducting_authority}</span>
                      </p>
                    </div>

                    {/* Key Specifications Grid */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Qualification</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px] text-right">
                          {exam.qualification}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Age Limit</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {exam.age_limit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">App. Fee</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px] text-right">
                          {exam.application_fee}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-slate-400 text-[11px]">Last Date to Apply</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          {new Date(exam.application_end_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Exam Date</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {exam.exam_date_display || new Date(exam.exam_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleApplyClick(exam)}
                        className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1"
                      >
                        <span>Apply Now</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        href={`/apply/exam/${exam.slug}`}
                        className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1"
                      >
                        <span>Details & Syllabus</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <a
                        href={exam.official_notification_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Official PDF</span>
                      </a>

                      <button
                        onClick={() => handleTrackApplication(exam)}
                        disabled={isSavedInTracker}
                        className={`inline-flex items-center space-x-1 font-semibold ${
                          isSavedInTracker
                            ? "text-emerald-600 dark:text-emerald-400 cursor-default"
                            : "text-blue-600 dark:text-blue-400 hover:underline"
                        }`}
                      >
                        {isSavedInTracker ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>In My Tracker</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-3 h-3" />
                            <span>Add to Tracker</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. OUTGOING REDIRECT MODAL FOR APPLY NOW */}
      {activeRedirectExam && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <button
                onClick={() => setActiveRedirectExam(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Official Government Application Portal
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                Proceeding to {activeRedirectExam.conducting_authority}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                You are being redirected to the official government recruitment portal:
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div className="font-bold text-slate-900 dark:text-white truncate">
                {activeRedirectExam.official_application_url}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Official Commission Endpoint</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong>Security Notice:</strong> ExamHub India never collects official passwords, OTPs, or application fee payments. Complete your registration and fees directly on the authorized portal above.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={activeRedirectExam.official_application_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  handleTrackApplication(activeRedirectExam);
                  setActiveRedirectExam(null);
                }}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-center"
              >
                <span>Continue to Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setActiveRedirectExam(null)}
                className="py-3 px-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
