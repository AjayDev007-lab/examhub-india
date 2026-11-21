"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bookmark, Search, Download, ChevronRight, ArrowLeft, 
  CheckCircle2, FileText, Check, ExternalLink
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function SchoolQuestionPapersPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadPapers();
  }, [selectedClass, selectedYear]);

  async function loadPapers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClass !== "ALL") params.append("class", selectedClass);
      if (selectedYear !== "ALL") params.append("year", selectedYear);
      const res = await fetchApi(`/api/school/question-papers?${params.toString()}`);
      setPapers(res.papers || []);
    } catch (err) {
      console.error("Failed to load question papers:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = papers.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.subject.toLowerCase().includes(term) ||
      p.board_code.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <section className="bg-gradient-to-b from-[#102D59] via-[#0D2344] to-[#0A1A33] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-300">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
            <Link href="/school" className="hover:text-white">School Education</Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
            <span className="text-white">Previous Year Papers</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 mb-2">
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>Authorized Board Exam Papers & Marking Schemes</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Class 10, 11 & 12 Previous Year Question Papers (PYQPs)
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-blue-100/90 max-w-xl">
                Official board question papers and authorized marking schemes for practice. 100% genuine and legally available.
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

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {["ALL", "10", "11", "12"].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedClass(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedClass === c
                      ? "bg-white dark:bg-slate-900 text-[#102D59] dark:text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {c === "ALL" ? "All Classes" : `Class ${c}`}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {["ALL", "2025", "2024", "2023"].map((y) => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedYear === y
                      ? "bg-[#2563EB] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {y === "ALL" ? "All Years" : y}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subject or board..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none"
            />
          </div>
        </div>

        {/* Papers Grid */}
        {loading ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
            <p className="text-xs text-slate-500 font-semibold">Loading question papers...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <Bookmark className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No question papers matching your query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((paper) => (
              <div
                key={paper.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-mono text-xs font-bold border border-blue-200 dark:border-blue-800">
                      {paper.board_code}
                    </span>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      Year {paper.year}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#102D59] dark:text-white">
                    {paper.subject} (Class {paper.class_level})
                  </h3>

                  <span className="inline-block text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1 rounded-lg">
                    {paper.exam_type.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <a
                    href={paper.paper_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Question Paper</span>
                  </a>

                  {paper.answer_key_pdf_url && (
                    <a
                      href={paper.answer_key_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors"
                      title="Marking Scheme / Answer Key"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Answer Key</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
