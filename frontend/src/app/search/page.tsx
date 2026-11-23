"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search, X, Briefcase, GraduationCap, BookOpen, Video,
  Layers, ArrowRight, ExternalLink, Filter, Sparkles
} from "lucide-react";
import { GlobalSearchResultItem } from "@/lib/platformData";

export default function GlobalSearchPage() {
  const searchParams = useSearchParams();
  const initialQ = searchParams?.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [category, setCategory] = useState("ALL");
  const [results, setResults] = useState<GlobalSearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialQ) {
      executeSearch(initialQ, category);
    }
  }, [initialQ]);

  async function executeSearch(qStr: string, catStr: string) {
    if (!qStr.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(qStr.trim())}&category=${catStr}`);
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
      }
    } catch (_) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    executeSearch(query, category);
  }

  function handleCategoryChange(newCat: string) {
    setCategory(newCat);
    executeSearch(query, newCat);
  }

  const categoryFilters = [
    { id: "ALL", label: "All Content" },
    { id: "GOVT_JOB", label: "Government Jobs" },
    { id: "IT_JOB", label: "IT & Tech Jobs" },
    { id: "UNIVERSITY_PAPER", label: "University Papers" },
    { id: "SCHOOL_CHAPTER", label: "School Notes & Videos" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* 1. SEARCH HEADER */}
      <section className="bg-gradient-to-b from-[#081629] via-[#0f2746] to-[#081629] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            Smart Global Search
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Instantly search across thousands of verified Government Jobs, IT Openings, University Question Papers, and School Chapters.
          </p>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-2xl mx-auto">
            <div className="relative w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Try '12th Physics', 'Anna University', 'Zoho', 'SSC CGL'..."
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 shadow-xl"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); setResults([]); setHasSearched(false); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all shrink-0"
            >
              Search
            </button>
          </form>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categoryFilters.map(c => (
              <button
                key={c.id}
                onClick={() => handleCategoryChange(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  category === c.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. RESULTS CONTAINER */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {hasSearched ? `Found ${results.length} result(s) for "${query}"` : "Popular Suggested Searches"}
            </span>
          </div>

          {!hasSearched ? (
            <div className="space-y-4 py-4">
              <span className="text-xs text-slate-400 block font-semibold">Recommended topics:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  "Electricity Class 10",
                  "Current Electricity Class 12",
                  "Anna University Computer Networks",
                  "Zoho Full Stack Developer",
                  "UPSC Civil Services",
                  "SSC CGL 2026",
                  "University of Madras Corporate Accounting"
                ].map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setQuery(s); executeSearch(s, category); }}
                    className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all"
                  >
                    <Search className="w-3 h-3 text-slate-400" />
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : loading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse h-16"></div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Search className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No matching records found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for broad terms like "Class 10", "Engineering", "Developer", or "Anna University".
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map(item => (
                <Link
                  key={item.id}
                  href={item.url}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      {item.category_label}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500">{item.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <span className="text-xs text-slate-400 font-mono hidden sm:inline">{item.meta}</span>
                    <span className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm">
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
