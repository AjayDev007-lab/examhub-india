"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  BookOpen, ArrowLeft, Download, ExternalLink, ShieldCheck, 
  ChevronRight, CheckCircle2, Bookmark, Check, Share2, Eye
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function SingleBookReaderPage() {
  const params = useParams();
  const id = (params?.id as string) || "";

  const [book, setBook] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) {
      loadBook();
    }
  }, [id]);

  async function loadBook() {
    setLoading(true);
    try {
      const res = await fetchApi(`/api/school/books/${id}`);
      if (res && res.book) {
        setBook(res.book);
      }
    } catch (err) {
      console.error("Failed to load book:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
        <p className="text-xs text-slate-500 font-semibold">Opening textbook reader...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Textbook Not Found</h2>
          <Link
            href="/school/books"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Library</span>
          </Link>
        </div>
      </div>
    );
  }

  const chapters = book.chapters || [];
  const currentChapter = chapters[activeChapterIndex] || { chapter_no: 1, title: "Introduction" };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <section className="bg-gradient-to-b from-[#102D59] via-[#0D2344] to-[#0A1A33] text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-300">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
            <Link href="/school/books" className="hover:text-white">Textbooks Library</Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
            <span className="text-white truncate">{book.title}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[11px] font-bold border border-blue-400/30">
                  Class {book.class_level} • {book.subject}
                </span>
                <span className="text-xs text-blue-200">
                  {book.publisher}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {book.title}
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={book.official_download_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Full PDF</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Reader Layout */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Table of Contents / Chapter List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Table of Contents ({chapters.length})</span>
            </h2>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {chapters.map((ch: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveChapterIndex(idx)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start space-x-2 ${
                  activeChapterIndex === idx
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span className="font-mono text-slate-400 shrink-0 mt-0.5">#{ch.chapter_no}</span>
                <span className="line-clamp-2">{ch.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reader Display Pane */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Chapter {currentChapter.chapter_no}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {currentChapter.title}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                Official Digital Textbook
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {book.description}
            </p>

            {/* Official Source Reader Frame / Direct Reader */}
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-blue-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                Read on Official Publisher Portal
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Access the official interactive reader with diagrams, exercises, and audio tools hosted directly by {book.publisher}.
              </p>
              <div className="flex items-center justify-center space-x-3 pt-2">
                <a
                  href={book.online_reader_url || book.official_download_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all"
                >
                  <span>Launch Official Reader</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Edition: {book.edition}</span>
              <span>Academic Year: {book.academic_year}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
