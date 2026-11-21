"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Award, Clock, ExternalLink, ShieldCheck, ChevronRight, ArrowLeft, 
  Search, Filter, CheckCircle2, AlertTriangle, AlertCircle, X, HelpCircle
} from "lucide-react";
import { fetchApi } from "@/lib/api";

function SchoolResultsContent() {
  const searchParams = useSearchParams();
  const initialClass = searchParams.get("class") || "ALL";

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeRedirectResult, setActiveRedirectResult] = useState<any | null>(null);

  useEffect(() => {
    loadResults();
  }, [selectedClass, statusFilter]);

  async function loadResults() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClass !== "ALL") params.append("class", selectedClass);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      const res = await fetchApi(`/api/school/results?${params.toString()}`);
      setResults(res.results || []);
    } catch (err) {
      console.error("Failed to load school results:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = results.filter((r) => {
    const term = search.toLowerCase();
    return (
      r.exam_name.toLowerCase().includes(term) ||
      r.board_name.toLowerCase().includes(term) ||
      r.board_code.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <section className="bg-gradient-to-b from-[#102D59] via-[#0D2344] to-[#0A1A33] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-300">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
            <Link href="/school" className="hover:text-white transition-colors">School Education</Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
            <span className="text-white">Board Results</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 mb-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Verified Official Gazettes & Portals</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Class 10, 11 & 12 Board Results 2026
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-blue-100/90 max-w-xl">
                Real-time official announcement dates, verified gazette links, and direct result checker pathways for National and State Boards across India.
              </p>
            </div>

            <Link
              href="/school"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>School Portal</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Class Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: "ALL", label: "All Classes" },
              { id: "10", label: "Class 10 (SSLC / Matric)" },
              { id: "11", label: "Class 11 (+1 / FYJC)" },
              { id: "12", label: "Class 12 (HSC / +2)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedClass(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedClass === tab.id
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
              placeholder="Filter by board or exam..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Loading official board result schedules...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <Award className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No result announcements matching your query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-mono text-xs font-bold border border-blue-200 dark:border-blue-800">
                      Class {item.class_level} • {item.board_code}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === "CONFIRMED_OFFICIAL"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {item.status === "CONFIRMED_OFFICIAL" ? "Official Confirmed Date" : "Tentative Expected Window"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#102D59] dark:text-white leading-snug">
                      {item.exam_name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.board_name}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Scheduled Date:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.result_date_display}</span>
                    </div>

                    {item.is_school_level ? (
                      <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 text-[11px] text-purple-700 dark:text-purple-300">
                        <strong>Class 11 Notice:</strong> Evaluated and published at the school level. Contact your school portal or administration desk.
                      </div>
                    ) : (
                      <div>
                        <span className="text-[11px] text-slate-400 block">Required for Checking:</span>
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          {item.required_credentials?.join(" • ") || "Roll Number, DOB"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Session: {item.academic_year}
                  </span>
                  <button
                    onClick={() => setActiveRedirectResult(item)}
                    className="px-3.5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
                  >
                    <span>View Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* OUTGOING OFFICIAL RESULT REDIRECT MODAL */}
      {activeRedirectResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-5">
            <button
              onClick={() => setActiveRedirectResult(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Official Board Results Gateway
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                You are proceeding to {activeRedirectResult.board_name}
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="font-semibold">Important Student Privacy & Anti-Phishing Advisory:</p>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                <li>ExamHub India does <strong>NOT</strong> collect or store your Class 10/11/12 roll numbers, dates of birth, or admit card passwords.</li>
                <li>Enter your credentials solely on the verified government server ending in <strong>.gov.in</strong> or <strong>.nic.in</strong>.</li>
                <li>ExamHub India is 100% free; beware of fake third-party websites asking for payment to view board marks.</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-mono break-all text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {activeRedirectResult.official_result_url}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setActiveRedirectResult(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <a
                href={activeRedirectResult.official_result_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setActiveRedirectResult(null)}
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-2"
              >
                <span>Continue to Official Result Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SchoolResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex items-center justify-center text-slate-500 text-sm">Loading Board Results...</div>}>
      <SchoolResultsContent />
    </Suspense>
  );
}
