"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Award, Clock, ShieldCheck, ChevronRight, ExternalLink, 
  Search, ArrowLeft, CheckCircle2, AlertCircle
} from "lucide-react";
import { fetchApi } from "@/lib/api";

const RESULT_STATUS_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  CONFIRMED_OFFICIAL: {
    label: "Confirmed Official Date",
    color: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
    desc: "Notified by the commission via official press note or annual calendar."
  },
  EXPECTED_UNOFFICIAL: {
    label: "Tentative Estimated Window",
    color: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
    desc: "Estimated window based on previous cycles. Subject to commission confirmation."
  },
  NOT_ANNOUNCED: {
    label: "Date Not Yet Announced",
    color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
    desc: "Commission has not released tentative schedule for this stage."
  },
  PUBLISHED: {
    label: "Result Published",
    color: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800 animate-pulse",
    desc: "Official merit list and scorecards are live on the government commission portal."
  },
  DELAYED: {
    label: "Announced as Delayed",
    color: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800",
    desc: "Commission released a postponement notice."
  }
};

export default function StudentUpcomingResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadResults();
  }, []);

  async function loadResults() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/countdowns/results");
      setResults(res.countdowns || []);
    } catch (err) {
      console.error("Failed to load upcoming results:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = results.filter((r) => {
    const term = search.toLowerCase();
    return (
      (r.title || "").toLowerCase().includes(term) ||
      (r.authority_code || "").toLowerCase().includes(term) ||
      (r.exam_name || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      <section className="bg-gradient-to-b from-[#102D59] via-[#0D2344] to-[#0A1A33] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-300">
            <Link href="/dashboard" className="hover:text-white transition-colors">Student Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
            <Link href="/student/countdown" className="hover:text-white transition-colors">Countdown Central</Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
            <span className="text-white">Upcoming Results</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-3">
                <Award className="w-8 h-8 text-amber-400" />
                <span>Upcoming Result Announcements</span>
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-blue-100/90 max-w-xl">
                Transparent tracking of upcoming examination merit lists and scorecards with verified official commission status tags.
              </p>
            </div>

            <Link
              href="/student/countdown"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Countdown Hub</span>
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Verification Status Legend */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Official Verification Status Legend:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Confirmed Official Date</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Tentative Expected Window</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Result Published</span>
            </div>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search result announcements..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 rounded-xl text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {loading ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Loading upcoming result schedules...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
            <Award className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Result Announcements Found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto">
              Check back soon as commissions release new evaluation schedules.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => {
              const statusCfg = RESULT_STATUS_LABELS[item.result_status || "EXPECTED_UNOFFICIAL"] || RESULT_STATUS_LABELS.EXPECTED_UNOFFICIAL;
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-200/60 dark:border-blue-800">
                        {item.authority_code}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#102D59] dark:text-white">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {statusCfg.desc}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Expected Date</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {new Date(item.target_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    </div>

                    <a
                      href={item.official_portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
                    >
                      <span>Check Gazette</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
