"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap, Search, Filter, BookOpen, Download,
  ExternalLink, Bookmark, CheckCircle2, ChevronRight,
  Layers, FileText, ArrowRight, Clock, Building2, Eye, X
} from "lucide-react";
import { UniversityItem, UniversityQuestionPaper, initialUniversities, initialUniversityQuestionPapers } from "@/lib/platformData";

export default function UniversityQuestionPapersPage() {
  const [universities, setUniversities] = useState<UniversityItem[]>(initialUniversities);
  const [papers, setPapers] = useState<UniversityQuestionPaper[]>(initialUniversityQuestionPapers);
  const [loading, setLoading] = useState(false);

  // Drill-down filters
  const [selectedUniversity, setSelectedUniversity] = useState<string>("ALL");
  const [selectedDegree, setSelectedDegree] = useState<string>("ALL");
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [savedPaperIds, setSavedPaperIds] = useState<number[]>([]);
  const [previewPaper, setPreviewPaper] = useState<UniversityQuestionPaper | null>(null);

  useEffect(() => {
    fetchUniversities();
    fetchPapers();
    const saved = localStorage.getItem("examhub_saved_university_papers");
    if (saved) {
      try {
        setSavedPaperIds(JSON.parse(saved));
      } catch (_) {}
    }
  }, []);

  async function fetchUniversities() {
    try {
      const res = await fetch("/api/universities");
      const data = await res.json();
      if (data.universities) setUniversities(data.universities);
    } catch (_) {}
  }

  async function fetchPapers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedUniversity !== "ALL") params.append("university_id", selectedUniversity);
      if (selectedDegree !== "ALL") params.append("degree", selectedDegree);
      if (selectedSemester !== "ALL") params.append("semester", selectedSemester);
      if (selectedYear !== "ALL") params.append("year", selectedYear);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/university-papers?${params.toString()}`);
      const data = await res.json();
      if (data.papers) setPapers(data.papers);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPapers();
  }, [selectedUniversity, selectedDegree, selectedSemester, selectedYear]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchPapers();
  }

  function toggleSavePaper(id: number) {
    let updated: number[];
    if (savedPaperIds.includes(id)) {
      updated = savedPaperIds.filter(p => p !== id);
    } else {
      updated = [...savedPaperIds, id];
    }
    setSavedPaperIds(updated);
    localStorage.setItem("examhub_saved_university_papers", JSON.stringify(updated));
  }

  const degreesList = ["B.E.", "B.Tech.", "B.Sc.", "B.Com.", "B.A.", "BCA", "BBA", "MBA", "MCA", "M.Sc.", "M.Com."];
  const semestersList = [1, 2, 3, 4, 5, 6, 7, 8];
  const yearsList = [2025, 2024, 2023, 2022, 2021, 2020];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* 1. HERO HEADER */}
      <section className="bg-gradient-to-b from-[#081629] via-[#0f2746] to-[#081629] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-6xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>Centralized Higher Education Archive • Semester Exam Papers</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            College & University <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-300">
              Previous Year Question Papers
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Free verified semester question papers from Anna University, University of Madras, Bharathiar, Bharathidasan, and major Indian state & central universities.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-2 pt-2">
            <div className="relative w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search subject code (e.g. CS8591), subject name, or degree..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 shadow-xl"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 shrink-0"
            >
              Search Papers
            </button>
          </form>
        </div>
      </section>

      {/* 2. UNIVERSITY DIRECTORY QUICK SELECTOR */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-200 dark:border-slate-800 mb-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span>Step 1: Choose Your University</span>
            </span>
            {selectedUniversity !== "ALL" && (
              <button
                onClick={() => setSelectedUniversity("ALL")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {universities.map(u => (
              <button
                key={u.id}
                onClick={() => setSelectedUniversity(String(u.id))}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  selectedUniversity === String(u.id)
                    ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="font-bold text-xs line-clamp-1">{u.name}</span>
                <span className="text-[10px] text-slate-400">{u.city}, {u.state}</span>
              </button>
            ))}
          </div>

          {/* Step 2: Degree, Semester, Year Drilldown Filters */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Step 2 Filters:
            </span>

            {/* Degree */}
            <select
              value={selectedDegree}
              onChange={e => setSelectedDegree(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
            >
              <option value="ALL">All Degrees / Courses</option>
              {degreesList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Semester */}
            <select
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
            >
              <option value="ALL">All Semesters</option>
              {semestersList.map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>

            {/* Year */}
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
            >
              <option value="ALL">All Exam Years</option>
              {yearsList.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <span className="ml-auto text-xs text-slate-400">
              Found <strong className="text-blue-600 dark:text-blue-400">{papers.length}</strong> Papers
            </span>
          </div>
        </div>

        {/* 3. PAPERS DIRECTORY GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : papers.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Question Papers Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No papers matched your selected university or filter criteria. Try expanding your search or selecting "All Semesters".
            </p>
            <button
              onClick={() => {
                setSelectedUniversity("ALL");
                setSelectedDegree("ALL");
                setSelectedSemester("ALL");
                setSelectedYear("ALL");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-500"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {papers.map(paper => {
              const isSaved = savedPaperIds.includes(paper.id);
              return (
                <div
                  key={paper.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                          {paper.university_name}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {paper.subject_name}
                        </h3>
                      </div>

                      <button
                        onClick={() => toggleSavePaper(paper.id)}
                        className={`p-2 rounded-xl border transition-all shrink-0 ${
                          isSaved
                            ? "bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-950 dark:border-blue-700"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-600"
                        }`}
                        title={isSaved ? "Saved" : "Save Paper"}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    {/* Metadata Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {paper.subject_code}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                        {paper.degree} Sem {paper.semester}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800">
                        {paper.exam_year} {paper.exam_session}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {paper.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {paper.file_size_mb} MB • {paper.download_count} Downloads
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewPaper(paper)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Preview</span>
                      </button>

                      <a
                        href={paper.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. PDF PREVIEW MODAL */}
      {previewPaper && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{previewPaper.university_name}</span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {previewPaper.subject_name} ({previewPaper.subject_code})
                </h2>
                <p className="text-xs text-slate-500">
                  {previewPaper.degree} • Semester {previewPaper.semester} • {previewPaper.exam_year} {previewPaper.exam_session}
                </p>
              </div>

              <button
                onClick={() => setPreviewPaper(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-200">Syllabus & Topics Covered in this Paper:</span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {previewPaper.description}
              </p>
            </div>

            <div className="h-64 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <FileText className="w-12 h-12 text-blue-500" />
              <div className="text-sm font-bold text-slate-800 dark:text-white">
                Official Examination Paper PDF Document
              </div>
              <p className="text-xs text-slate-500 max-w-md">
                Verified question paper document matching official university formatting and question scheme.
              </p>
              <a
                href={previewPaper.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/30"
              >
                <Download className="w-4 h-4" />
                <span>Open & Download Full PDF ({previewPaper.file_size_mb} MB)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
