"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, Search, Globe, Phone, ExternalLink, ChevronRight, 
  ArrowLeft, CheckCircle2, Award, BookOpen, Clock, Building2
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function SchoolBoardDirectoryPage() {
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    loadBoards();
  }, [typeFilter]);

  async function loadBoards() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "ALL") params.append("type", typeFilter);
      const res = await fetchApi(`/api/school/boards?${params.toString()}`);
      setBoards(res.boards || []);
    } catch (err) {
      console.error("Failed to load boards:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = boards.filter((b) => {
    const term = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(term) ||
      b.code.toLowerCase().includes(term) ||
      b.short_name.toLowerCase().includes(term) ||
      b.state_name.toLowerCase().includes(term)
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
            <span className="text-white">All India Boards Directory</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
                <Building2 className="w-8 h-8 text-blue-400" />
                <span>All India School Education Board Directory</span>
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-blue-100/90 max-w-xl">
                Verified directory of National and State Education Boards covering official websites, results portals, textbook repositories, and helpline desks.
              </p>
            </div>

            <Link
              href="/school"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>School Hub</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-1 w-full sm:w-auto">
            {[
              { id: "ALL", label: "All Boards" },
              { id: "NATIONAL", label: "National Boards (CBSE, ICSE, NIOS)" },
              { id: "STATE", label: "State Boards" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  typeFilter === tab.id
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
              placeholder="Search by board or state..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Loading official board directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No boards matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((board) => (
              <div
                key={board.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-mono text-xs font-bold border border-blue-200 dark:border-blue-800">
                      {board.code}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Official</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#102D59] dark:text-white leading-snug">
                      {board.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                      {board.state_name} • Classes: {board.classes_supported?.join(", ") || "10, 11, 12"}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs space-y-1.5">
                    {board.helpline_contact && (
                      <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Helpline: <strong>{board.helpline_contact}</strong></span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{board.official_website}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                  <a
                    href={board.official_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition-colors"
                  >
                    Portal
                  </a>
                  <a
                    href={board.results_portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold hover:bg-emerald-100 transition-colors"
                  >
                    Results
                  </a>
                  <a
                    href={board.textbooks_portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold hover:bg-blue-100 transition-colors"
                  >
                    Books
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
