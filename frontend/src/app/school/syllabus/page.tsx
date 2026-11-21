"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, Search, Download, ChevronRight, ArrowLeft, 
  ShieldCheck, CheckCircle2, Layers, BookOpen, ExternalLink
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function SchoolSyllabusPage() {
  const [syllabusList, setSyllabusList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadSyllabus();
  }, [selectedClass]);

  async function loadSyllabus() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClass !== "ALL") params.append("class", selectedClass);
      const res = await fetchApi(`/api/school/syllabus?${params.toString()}`);
      setSyllabusList(res.syllabus || []);
    } catch (err) {
      console.error("Failed to load syllabus:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = syllabusList.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.subject.toLowerCase().includes(term) ||
      s.board_code.toLowerCase().includes(term)
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
            <span className="text-white">Official Syllabus</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 mb-2">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Academic Curriculum & Deleted Topics</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Class 10, 11 & 12 Board Curriculum & Syllabus
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-blue-100/90 max-w-xl">
                Official curriculum guides, topic weightages, and authorized syllabus PDFs published by national and state boards.
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
          <div className="flex items-center space-x-1">
            {["ALL", "10", "11", "12"].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedClass(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedClass === c
                    ? "bg-[#102D59] dark:bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {c === "ALL" ? "All Classes" : `Class ${c}`}
              </button>
            ))}
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

        {/* Syllabus Grid */}
        {loading ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
            <p className="text-xs text-slate-500 font-semibold">Loading official syllabus...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No syllabus entries found for this selection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-mono text-xs font-bold border border-blue-200 dark:border-blue-800">
                      {item.board_code}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                      Class {item.class_level}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Academic Year {item.academic_year}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#102D59] dark:text-white">
                    {item.subject} Syllabus
                  </h3>
                </div>

                {/* Chapter Topics Preview */}
                <div className="space-y-2 text-xs">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block">Key Modules & Topic Weightage:</span>
                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                    {(item.chapter_topics || []).map((ch: any, idx: number) => (
                      <div key={idx} className="space-y-0.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{ch.chapter}</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {ch.topics?.join(" • ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <a
                    href={item.official_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Official Syllabus PDF</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
