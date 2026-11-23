"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  GraduationCap, BookOpen, Award, FileText, Calendar, Search, 
  ChevronRight, ExternalLink, ShieldCheck, CheckCircle2, Clock, 
  Sparkles, Download, Layers, ArrowRight, Eye, Bookmark, Filter,
  Play, Video, HelpCircle
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { initialSchoolChapters, SchoolChapterResource } from "@/lib/platformData";

export default function SchoolEducationHomePage() {
  const [boards, setBoards] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [textbooks, setTextbooks] = useState<any[]>([]);
  const [chapters, setChapters] = useState<SchoolChapterResource[]>(initialSchoolChapters);
  const [selectedBoardFilter, setSelectedBoardFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<"ALL" | "10" | "11" | "12">("ALL");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [resBoards, resResults, resBooks, resChapters] = await Promise.all([
        fetchApi("/api/school/boards").catch(() => ({ boards: [] })),
        fetchApi("/api/school/results").catch(() => ({ results: [] })),
        fetchApi("/api/school/books").catch(() => ({ books: [] })),
        fetchApi("/api/school/chapters").catch(() => ({ chapters: initialSchoolChapters }))
      ]);
      setBoards(resBoards.boards || []);
      setResults(resResults.results || []);
      setTextbooks(resBooks.books || []);
      if (resChapters?.chapters && resChapters.chapters.length > 0) {
        setChapters(resChapters.chapters);
      }
    } catch (err) {
      console.error("Failed to load school data:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredChapters = chapters.filter(c => {
    if (selectedClass !== "ALL" && c.class_level !== selectedClass) return false;
    if (selectedBoardFilter !== "ALL" && c.board_code !== selectedBoardFilter) return false;
    return true;
  });

  const filteredResults = selectedClass === "ALL" 
    ? results 
    : results.filter((r) => r.class_level === selectedClass);

  const filteredBooks = selectedClass === "ALL" 
    ? textbooks 
    : textbooks.filter((b) => b.class_level === selectedClass);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* 1. HERO BANNER */}
      <section className="bg-gradient-to-b from-[#102D59] via-[#0D2344] to-[#0A1A33] text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>National & State Board School Education Portal • Classes 10, 11 & 12</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Board Results, Official Textbooks & <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-300">
              Study Resources for Indian Students
            </span>
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
            Centralized All-India directory for CBSE, ICSE/ISC, NIOS, and State Boards. Access official result announcement dates, download 100% free authorized NCERT and SCERT textbooks, and practice with previous year question papers.
          </p>

          {/* Quick Submenu Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { label: "Class 10 Portal", href: "/school/results?class=10", icon: Award },
              { label: "Class 11 Portal", href: "/school/results?class=11", icon: Layers },
              { label: "Class 12 Portal", href: "/school/results?class=12", icon: Award },
              { label: "Board Results", href: "/school/results", icon: Clock },
              { label: "Textbooks Library", href: "/school/books", icon: BookOpen },
              { label: "Syllabus", href: "/school/syllabus", icon: FileText },
              { label: "Previous Papers", href: "/school/question-papers", icon: Bookmark },
              { label: "All Boards", href: "/school/boards", icon: ShieldCheck },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all shadow-sm"
                >
                  <Icon className="w-3.5 h-3.5 text-blue-300" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. CLASS FILTER SWITCHER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-2 border border-slate-200 dark:border-slate-800 flex items-center justify-center space-x-2 w-fit mx-auto">
          {[
            { id: "ALL", label: "All Classes (10, 11, 12)" },
            { id: "10", label: "Class 10 (SSLC / Matric)" },
            { id: "11", label: "Class 11 (+1 / FYJC)" },
            { id: "12", label: "Class 12 (HSC / +2)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedClass(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedClass === tab.id
                  ? "bg-[#102D59] dark:bg-blue-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {/* 2.5 INTERACTIVE CHAPTER-WISE STUDY CENTER & VIDEO CLASSES */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[11px] font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Curriculum Learning Suite</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#102D59] dark:text-white flex items-center space-x-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <span>Interactive Chapter-Wise Study Center & Video Classes</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Full chapter video lessons, NCERT notes summaries, formulas, past board exam questions, and practice quizzes.
              </p>
            </div>

            {/* Board Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
              {[
                { id: "ALL", label: "All Boards" },
                { id: "CBSE", label: "CBSE" },
                { id: "ICSE", label: "ICSE" },
                { id: "TNSB", label: "Tamil Nadu" },
                { id: "KSEEB", label: "Karnataka" }
              ].map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBoardFilter(b.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedBoardFilter === b.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredChapters.map(ch => (
              <div
                key={ch.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-200/60 dark:border-blue-800">
                      {ch.board_code} • Class {ch.class_level}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {ch.subject}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                      Chapter {ch.chapter_number}
                    </span>
                    <h3 className="text-base font-bold text-[#102D59] dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                      {ch.chapter_title}
                    </h3>
                  </div>

                  {/* Feature Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 flex items-center gap-1">
                      <Video className="w-3 h-3 text-red-500" />
                      <span>{ch.video_lessons?.length || 1} Video Lessons</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-blue-500" />
                      <span>Notes & Formulas</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-emerald-500" />
                      <span>{ch.practice_quiz?.length || 3} Qs Quiz</span>
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <Link
                    href={`/school/chapter/${ch.id}`}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                  >
                    <span>Start Learning</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {ch.pdf_notes_url && (
                    <a
                      href={ch.pdf_notes_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors shrink-0"
                      title="Download Official NCERT/State PDF"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. LATEST RESULT ANNOUNCEMENTS */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#102D59] dark:text-white flex items-center space-x-2">
                <Award className="w-6 h-6 text-blue-600" />
                <span>Class 10, 11 & 12 Board Result Announcements 2026</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Verified official result dates and direct links to commission gazette result portals.
              </p>
            </div>
            <Link
              href="/school/results"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>View All Board Results</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResults.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-200/60 dark:border-blue-800">
                      Class {item.class_level} • {item.board_code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === "CONFIRMED_OFFICIAL"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {item.status === "CONFIRMED_OFFICIAL" ? "Official Confirmed" : "Tentative Expected"}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#102D59] dark:text-white line-clamp-2">
                    {item.exam_name}
                  </h3>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Target Date:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.result_date_display}</span>
                    </div>
                    {item.is_school_level && (
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold block">
                        ℹ School-level internal annual result
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Source: {item.board_name.slice(0, 24)}...
                  </span>
                  <a
                    href={item.official_result_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-sm transition-all"
                  >
                    <span>Check Result</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. OFFICIAL TEXTBOOK LIBRARY */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#102D59] dark:text-white flex items-center space-x-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <span>Authorized School Textbooks (100% Free Open Access)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official digital books from NCERT and State SCERTs. Read online or download complete textbooks legally.
              </p>
            </div>
            <Link
              href="/school/books"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>Browse All Textbooks</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredBooks.slice(0, 8).map((book) => (
              <div
                key={book.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-[10px] font-bold border border-blue-200/60 dark:border-blue-800">
                      Class {book.class_level}
                    </span>
                    {book.stream && book.stream !== "GENERAL" && (
                      <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 text-[10px] font-bold">
                        {book.stream}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#102D59] dark:text-white line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Subject: <strong>{book.subject}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {book.publisher}
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl flex justify-between">
                    <span>{book.chapters?.length || 10} Chapters</span>
                    <span>{book.file_size_mb} MB</span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2">
                  <Link
                    href={`/school/books/reader/${book.id}`}
                    className="flex-1 py-1.5 px-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold text-center flex items-center justify-center space-x-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Read Online</span>
                  </Link>

                  <a
                    href={book.official_download_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                    title="Download Official PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. ALL-INDIA POPULAR BOARDS DIRECTORY */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#102D59] dark:text-white flex items-center space-x-2">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
                <span>All India Education Boards Directory</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official portals, helpline contacts, and verified result portals across Indian national and state education boards.
              </p>
            </div>
            <Link
              href="/school/boards"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>View All 28+ Boards</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {boards.slice(0, 8).map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    {b.code}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </div>

                <h3 className="text-xs font-bold text-[#102D59] dark:text-white line-clamp-2">
                  {b.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {b.state_name}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <a
                    href={b.official_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 text-[11px] font-bold"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={b.results_portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 hover:underline text-[11px] font-bold"
                  >
                    Results
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. SYLLABUS & PREVIOUS PAPERS QUICK ACCESS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-900 to-[#102D59] text-white shadow-xl space-y-3">
            <span className="px-2.5 py-1 rounded-lg bg-white/10 text-blue-200 text-xs font-bold uppercase tracking-wider inline-block">
              Study Curriculum
            </span>
            <h3 className="text-xl font-bold">Class 10, 11 & 12 Official Syllabus</h3>
            <p className="text-xs text-blue-100/90 leading-relaxed">
              Download latest official academic year curriculum PDFs with chapter weightages, practical marks breakdown, and deleted topic lists.
            </p>
            <div className="pt-2">
              <Link
                href="/school/syllabus"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-[#102D59] hover:bg-blue-50 font-bold rounded-xl text-xs transition-colors"
              >
                <span>Access Syllabus Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-xl space-y-3">
            <span className="px-2.5 py-1 rounded-lg bg-white/10 text-indigo-200 text-xs font-bold uppercase tracking-wider inline-block">
              Exam Practice
            </span>
            <h3 className="text-xl font-bold">Previous Year Board Question Papers (PYQPs)</h3>
            <p className="text-xs text-indigo-100/90 leading-relaxed">
              Official annual and compartment question papers with board marking schemes and answer keys for 2025, 2024, and 2023.
            </p>
            <div className="pt-2">
              <Link
                href="/school/question-papers"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs transition-colors"
              >
                <span>Download Question Papers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 7. COPYRIGHT & SECURITY NOTICE */}
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Official Open-Access Education Notice:</p>
            <p className="text-slate-600 dark:text-slate-400">
              ExamHub India provides direct, authorized access to textbooks published under open government access by NCERT and State SCERTs. ExamHub India does not charge students any fees and never collects roll numbers, dates of birth, or confidential passwords.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
