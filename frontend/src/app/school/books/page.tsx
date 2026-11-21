"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, Search, Download, Eye, Bookmark, Check, ShieldCheck, 
  ChevronRight, ArrowLeft, Filter, Layers, CheckCircle2, X
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function SchoolBooksLibraryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [selectedStream, setSelectedStream] = useState("ALL");
  const [search, setSearch] = useState("");
  const [savedBookIds, setSavedBookIds] = useState<number[]>([]);

  useEffect(() => {
    loadBooks();
    loadStudentProfile();
  }, [selectedClass, selectedStream]);

  async function loadBooks() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClass !== "ALL") params.append("class", selectedClass);
      if (selectedStream !== "ALL") params.append("stream", selectedStream);
      const res = await fetchApi(`/api/school/books?${params.toString()}`);
      setBooks(res.books || []);
    } catch (err) {
      console.error("Failed to load textbooks:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadStudentProfile() {
    try {
      const res = await fetchApi("/api/student/school-profile");
      if (res && res.profile) {
        setSavedBookIds(res.profile.saved_book_ids || []);
      }
    } catch (_) {}
  }

  const handleToggleSaveBook = async (bookId: number) => {
    const isSaved = savedBookIds.includes(bookId);
    const updatedIds = isSaved
      ? savedBookIds.filter((id) => id !== bookId)
      : [...savedBookIds, bookId];

    setSavedBookIds(updatedIds);
    try {
      await fetchApi("/api/student/school-profile", {
        method: "PUT",
        body: JSON.stringify({ saved_book_ids: updatedIds })
      });
    } catch (_) {}
  };

  const filtered = books.filter((b) => {
    const term = search.toLowerCase();
    return (
      b.title.toLowerCase().includes(term) ||
      b.subject.toLowerCase().includes(term) ||
      b.publisher.toLowerCase().includes(term) ||
      b.board_code.toLowerCase().includes(term)
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
            <span className="text-white">Textbooks Library</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>100% Free Legal Digital Textbooks</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                School Textbook Library (Classes 10, 11 & 12)
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-blue-100/90 max-w-xl">
                Official digital books from NCERT and State SCERTs for Science, Commerce, and Humanities streams. Read online or download complete authorized PDFs.
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
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {/* Class filter */}
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

            {/* Stream filter */}
            {(selectedClass === "11" || selectedClass === "12" || selectedClass === "ALL") && (
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                {[
                  { id: "ALL", label: "All Streams" },
                  { id: "SCIENCE", label: "Science" },
                  { id: "COMMERCE", label: "Commerce" },
                  { id: "HUMANITIES", label: "Humanities / Arts" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStream(s.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      selectedStream === s.id
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or subject..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Textbooks Grid */}
        {loading ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Loading official open-access textbooks...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No textbooks matching your selection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((book) => {
              const isSaved = savedBookIds.includes(book.id);
              return (
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
                      <button
                        onClick={() => handleToggleSaveBook(book.id)}
                        className={`p-1.5 rounded-lg transition-colors ml-auto ${
                          isSaved ? "text-amber-500 bg-amber-50 dark:bg-amber-950/60" : "text-slate-400 hover:text-slate-600"
                        }`}
                        title={isSaved ? "Saved in My Books" : "Save to My Books"}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#102D59] dark:text-white line-clamp-1">
                        {book.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Subject: <strong>{book.subject}</strong> ({book.language})
                      </p>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {book.publisher}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl flex justify-between">
                      <span>{book.chapters?.length || 8} Chapters</span>
                      <span className="font-mono">{book.file_size_mb} MB</span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2">
                    <Link
                      href={`/school/books/reader/${book.id}`}
                      className="flex-1 py-2 px-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read Online</span>
                    </Link>

                    <a
                      href={book.official_download_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
                      title="Download Authorized Full PDF"
                    >
                      <Download className="w-4 h-4" />
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
