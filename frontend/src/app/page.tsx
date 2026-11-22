"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, Award, FileText, CreditCard, ChevronRight, CheckCircle2, 
  Calendar, Building2, MapPin, Bell, ArrowRight, ShieldCheck, Download, 
  Sparkles, AlertCircle, BookOpen, Clock, Users, ArrowUpRight, Briefcase, ExternalLink,
  Instagram, MessageSquare, Mail, Radio, ChevronDown, Check, Zap, Landmark, GraduationCap
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { SITE_CONFIG } from "@/config/site";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredExams, setFeaturedExams] = useState<any[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [statesData, catsData, examsData, annData, jobsData] = await Promise.all([
          fetchApi("/api/states").catch(() => []),
          fetchApi("/api/categories").catch(() => []),
          fetchApi("/api/exams?limit=6").catch(() => []),
          fetchApi("/api/announcements?limit=5").catch(() => []),
          fetchApi("/api/jobs?limit=4").catch(() => [])
        ]);
        setStates(statesData || []);
        setCategories(catsData || []);
        setFeaturedExams(examsData || []);
        setAnnouncements(annData || []);
        const rawJobs = Array.isArray(jobsData) ? jobsData : (jobsData?.jobs || []);
        setFeaturedJobs(rawJobs);
      } catch (err) {
        console.error("Failed to load initial directory data:", err);
      }
    }
    loadData();
  }, []);

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery !== undefined ? customQuery : searchQuery;
    if (!query.trim() && !selectedCategory && !selectedState) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append("q", query.trim());
      if (selectedCategory) params.append("category_id", selectedCategory);
      if (selectedState) params.append("state_id", selectedState);

      const results = await fetchApi(`/api/exams/search?${params.toString()}`);
      setSearchResults(results || []);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    handleSearch(undefined, tag);
  };

  return (
    <div className="space-y-16 pb-20 font-sans selection:bg-blue-600 selection:text-white">

      {/* ================================================================= */}
      {/* 1. HERO SECTION WITH MODERN USER-FRIENDLY SEARCH                  */}
      {/* ================================================================= */}
      <section className="relative bg-gradient-to-b from-[#0B1E3F] via-[#0D244D] to-[#0A162B] text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Soft Radial Ambient Lights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute -bottom-10 right-10 w-72 h-72 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          
          {/* Friendly Trust Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-200 text-xs font-semibold tracking-wide shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>100% Free National Student Public Portal • Verified Government Sources</span>
          </div>

          {/* Main Inspiring Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Check Exam Results, Admit Cards & Jobs <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300">
              Across All Indian States
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Centralized single-window gateway for Indian students. Easily find official scorecards, verified hall tickets, fresh IT & government vacancies, and gazette notices.
          </p>

          {/* User-Friendly Floating Search Card */}
          <div className="max-w-4xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-3 sm:p-4 shadow-2xl text-slate-800 dark:text-slate-100 text-left mt-8 border border-white/20 dark:border-slate-800">
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="flex flex-col md:flex-row gap-2.5">
                
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-blue-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Exam Name (e.g., NEET, UPSC CSE, JEE, SSC CGL, CBSE)..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 dark:text-white font-medium placeholder-slate-400 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-3.5 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Category Dropdown */}
                <div className="md:w-52">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full py-3 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* State Dropdown */}
                <div className="md:w-48">
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full py-3 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
                  >
                    <option value="">All 36 States/UTs</option>
                    {states.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-xs shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>{isSearching ? "Searching..." : "Search"}</span>
                </button>
              </div>
            </form>

            {/* Quick Popular Search Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs mt-2">
              <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px] mr-1">Trending:</span>
              {[
                "NEET UG 2026",
                "UPSC Civil Services",
                "SSC CGL",
                "JEE Main",
                "CBSE 10th / 12th",
                "RRB Group D",
                "TCS Digital IT Jobs"
              ].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300 text-slate-600 dark:text-slate-300 text-[11px] font-medium transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* SEARCH RESULTS DROPDOWN (if searched)                            */}
      {/* ================================================================= */}
      {hasSearched && (
        <section className="max-w-6xl mx-auto px-4 -mt-10 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                <span>Search Results ({searchResults.length})</span>
              </h2>
              <button 
                onClick={() => setHasSearched(false)}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Clear Search
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-sm">No matching examinations found.</p>
                <p className="text-slate-400 mt-1">Try another keyword or browse the full All-India directory.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((exam) => (
                  <div key={exam.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-all flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span className="font-bold text-blue-600">{exam.organization_code}</span>
                        <span>{exam.year} ({exam.cycle})</span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{exam.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{exam.organization_name}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <Link
                        href={`/results?exam_id=${exam.id}`}
                        className="flex-1 text-center py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Check Result
                      </Link>
                      <Link
                        href={`/hall-tickets?exam_id=${exam.id}`}
                        className="flex-1 text-center py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Hall Ticket
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================================================================= */}
      {/* 2. FOUR PRIMARY CORE SERVICES (CLEAN ACTION GATEWAYS)              */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-1.5 mb-10">
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Essential Candidate Gateways</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            What Would You Like to Check Today?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Choose from the four dedicated portals built for seamless, zero-hassle student access.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Results */}
          <Link
            href="/results"
            className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Service 1
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Check Exam Results
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Search authentic marks, ranks, percentages, and download official PDF scorecards for Central, State & University exams.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
              <span>Open Results Portal</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 2: Hall Tickets */}
          <Link
            href="/hall-tickets"
            className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-500 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Service 2
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Download Hall Tickets
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Get newly released e-Admit cards, verify test centers, shift reporting timings, and print entry passes.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
              <span>Download Admit Card</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 3: Jobs & Careers */}
          <Link
            href="/jobs"
            className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-purple-400 dark:hover:border-purple-500 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Service 3
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Jobs & IT Careers
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Explore Central Govt, State PSC vacancies, and verified IT freshers drives (TCS, Infosys, Amazon, Microsoft).
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform">
              <span>View Active Vacancies</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 4: Official Directory */}
          <Link
            href="/official-websites"
            className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-cyan-400 dark:hover:border-cyan-500 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                  Service 4
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Official Portal Directory
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Access 100% verified official government portals across all 28 States and 8 Union Territories with zero fraud risk.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-cyan-600 dark:text-cyan-400 group-hover:translate-x-0.5 transition-transform">
              <span>Browse 36 States</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

        </div>
      </section>

      {/* ================================================================= */}
      {/* 3. LIVE EXAMINATION NOTICES & RESULTS TICKER                      */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recently Announced Results & Hall Tickets */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Recently Announced Results & Passes</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Direct links to officially verified scorecard portals</p>
              </div>
              <Link href="/directory" className="text-xs font-semibold text-blue-600 hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {featuredExams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-400 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                        {exam.organization_code}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        Verified Live
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{exam.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{exam.organization_name} • Cycle: {exam.cycle} ({exam.year})</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <Link
                      href={`/results?exam_id=${exam.id}`}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-sm"
                    >
                      Check Score
                    </Link>
                    <Link
                      href={`/hall-tickets?exam_id=${exam.id}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                    >
                      Admit Card
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Announcement Feed */}
          <div className="bg-[#0B1E3F] text-slate-200 rounded-2xl p-6 sm:p-7 border border-blue-900/60 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">Official Gazettes & Circulars</h3>
              </div>
              <p className="text-xs text-blue-200/80 mb-5 leading-relaxed">
                Live circulars published by national councils, commissions, and testing agencies.
              </p>

              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-3 rounded-xl bg-white/10 border border-white/10 text-xs space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded bg-blue-400/20 text-blue-200 font-semibold text-[10px]">
                      {ann.announcement_type?.replace(/_/g, " ")}
                    </span>
                    <h4 className="font-semibold text-white leading-snug">{ann.title}</h4>
                    <p className="text-blue-100/70 text-[11px] line-clamp-2">{ann.announcement_text}</p>
                    {ann.circular_url && (
                      <a
                        href={ann.circular_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-sky-300 hover:text-white text-[11px] font-medium pt-0.5"
                      >
                        <span>Official Gazette</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/15 text-[11px] text-blue-200 flex items-center justify-between">
              <span>Auto-indexed 24/7</span>
              <Link href="/updates" className="text-sky-300 hover:underline font-semibold">
                Daily Updates Feed →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ================================================================= */}
      {/* 4. VERIFIED IT & GOVT JOB OPENINGS HIGHLIGHT                     */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Verified Career Openings</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Featured IT Freshers & Government Vacancies
              </h2>
            </div>
            <Link
              href="/jobs"
              className="text-xs font-bold text-purple-600 hover:text-purple-500 flex items-center gap-1"
            >
              <span>Explore All Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {featuredJobs.slice(0, 4).map((job: any) => (
              <div
                key={job.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:border-purple-400 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-purple-600 dark:text-purple-400">{job.organization_name || job.company}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                      {job.salary_range || "Official Scale"}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">{job.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">{job.location || "All India"} • {job.qualification || "Graduate"}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Deadline: {job.last_date || "Active"}</span>
                  <Link
                    href={`/jobs/${job.slug || job.id}`}
                    className="font-bold text-purple-600 hover:underline flex items-center gap-0.5"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 5. STATE & UT QUICK DIRECTORY (36 STATES & UNION TERRITORIES)     */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span>Explore Official Portals by State & UT</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Direct access to State Public Service Commissions, Higher Education Boards & School Directorates
              </p>
            </div>
            <Link href="/official-websites" className="text-xs font-bold text-blue-600 hover:underline">
              View Full 36 States Directory →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs">
            {[
              { name: "Andhra Pradesh", code: "AP" },
              { name: "Bihar", code: "BR" },
              { name: "Delhi", code: "DL" },
              { name: "Gujarat", code: "GJ" },
              { name: "Karnataka", code: "KA" },
              { name: "Kerala", code: "KL" },
              { name: "Madhya Pradesh", code: "MP" },
              { name: "Maharashtra", code: "MH" },
              { name: "Odisha", code: "OD" },
              { name: "Punjab", code: "PB" },
              { name: "Rajasthan", code: "RJ" },
              { name: "Tamil Nadu", code: "TN" },
              { name: "Telangana", code: "TS" },
              { name: "Uttar Pradesh", code: "UP" },
              { name: "West Bengal", code: "WB" },
              { name: "Jammu & Kashmir", code: "JK" },
              { name: "Assam", code: "AS" },
              { name: "Haryana", code: "HR" }
            ].map(stateItem => (
              <Link
                key={stateItem.code}
                href={`/official-websites?state=${stateItem.code}`}
                className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 hover:shadow-sm transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block group-hover:text-blue-600 transition-colors">
                    {stateItem.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">[{stateItem.code}]</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 6. PERSONAL STUDENT DOCUMENT VAULT HIGHLIGHT                      */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 text-white p-8 sm:p-10 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Personal Document Vault</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Never Lose Your Examination Scorecards & Hall Tickets Again
            </h2>
            <p className="text-sm text-blue-100 leading-relaxed">
              Register for your free student account to securely save every retrieved result, admit card, and job application in your encrypted personal library with instant PDF export.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/auth/register"
                className="px-6 py-3 rounded-xl bg-white text-blue-800 hover:bg-blue-50 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Create Free Student Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/login"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all"
              >
                Existing Candidate Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 7. FREQUENTLY ASKED QUESTIONS ACCORDION                          */}
      {/* ================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-1.5 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Quick, transparent answers about ExamHub India verification and authenticity
          </p>
        </div>

        <div className="space-y-3 text-xs">
          {[
            {
              q: "Does ExamHub India generate fake or synthetic marksheets?",
              a: "Absolutely not. ExamHub India only retrieves and displays officially verified examination marks and scorecards published by official commissions, testing agencies, and universities. We never fabricate scorecards, admit cards, or student ID cards."
            },
            {
              q: "How does the hall ticket download service work?",
              a: "When an admit card is officially released, students enter their application or registration number. The platform retrieves verified exam center details and generates an authentic electronic entry document with official instructions."
            },
            {
              q: "Can I save my results and documents permanently?",
              a: "Yes. Once you register for a free student account, any retrieved scorecard, admit card, or uploaded legitimate student ID card is stored in your private Personal Document Library for instant access anywhere."
            },
            {
              q: "What if my college or university is not yet integrated?",
              a: "ExamHub India provides direct, verified portal links and exact step-by-step instructions for all unsupported institutions. Our discovery agents regularly index new verified institutions without modifying system code."
            }
          ].map((faq, i) => {
            const isOpen = activeFaq === i;
            return (
              <div
                key={i}
                className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : i)}
                  className="w-full p-4 text-left font-bold text-slate-900 dark:text-white flex items-center justify-between text-sm hover:text-blue-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
