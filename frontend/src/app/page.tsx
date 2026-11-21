"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, Award, FileText, CreditCard, ChevronRight, CheckCircle2, 
  Calendar, Building2, MapPin, Bell, ArrowRight, ShieldCheck, Download, 
  Sparkles, AlertCircle, BookOpen, Clock, Users, ArrowUpRight, Briefcase, ExternalLink,
  Instagram, MessageSquare, Mail
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

  useEffect(() => {
    // Load initial reference data & announcements
    async function loadData() {
      try {
        const [statesData, catsData, examsData, annData, jobsData] = await Promise.all([
          fetchApi("/api/states").catch(() => []),
          fetchApi("/api/categories").catch(() => []),
          fetchApi("/api/exams?limit=6").catch(() => []),
          fetchApi("/api/announcements?limit=5").catch(() => []),
          fetchApi("/api/jobs?limit=4").catch(() => []),
        ]);
        setStates(statesData || []);
        setCategories(catsData || []);
        setFeaturedExams(examsData || []);
        setAnnouncements(annData || []);
        setFeaturedJobs(jobsData || []);
      } catch (err) {
        console.error("Failed to load initial directory data:", err);
      }
    }
    loadData();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("q", searchQuery.trim());
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

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION WITH GLOBAL EXAMINATION SEARCH */}
      <section className="relative bg-gradient-to-b from-[#102D59] via-[#0D2344] to-[#0A1A33] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#387ec4_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>100% Free Public Portal • Centralized Educational & Career Platform for Indian Students</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            All Your Examination Documents & Results in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300">One Place.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover and retrieve officially published examination scorecards, verified admit cards, real-time job alerts, and legitimate credentials across all Indian states and institutions.
          </p>

          {/* Global Search Box */}
          <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-2xl text-slate-800 dark:text-slate-100 text-left mt-8 border border-slate-100 dark:border-slate-800">
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Exam Name (e.g., NEET, UPSC CSE, JEE, CGL, Semester VI)..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white font-medium placeholder-slate-400"
                  />
                </div>

                {/* Category Dropdown */}
                <div className="md:w-52">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full py-3 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700 dark:text-slate-200 font-medium"
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
                    className="w-full py-3 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700 dark:text-slate-200 font-medium"
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
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>{isSearching ? "Searching..." : "Search"}</span>
                </button>
              </div>
            </form>

            {/* Quick tags */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 mt-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Popular Searches:</span>
              {["NEET UG 2026", "UPSC Civil Services", "SSC CGL", "JEE Main", "Delhi University", "RRB NTPC"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                    setIsSearching(true);
                    setHasSearched(true);
                    fetchApi(`/api/exams/search?q=${encodeURIComponent(tag)}`).then(res => {
                      setSearchResults(res || []);
                      setIsSearching(false);
                    });
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-300 text-slate-600 dark:text-slate-300 font-medium transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH RESULTS DROPDOWN / LISTING (if searched) */}
      {hasSearched && (
        <section className="max-w-6xl mx-auto px-4 -mt-10">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Search Results ({searchResults.length})
              </h2>
              <button 
                onClick={() => setHasSearched(false)}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline"
              >
                Clear Search
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-medium">No matching examinations found.</p>
                <p className="text-xs text-slate-400">Try searching with a broader keyword or browse the full All-India directory.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((exam) => (
                  <div key={exam.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <span className="font-semibold text-blue-700 dark:text-blue-400">{exam.organization_code}</span>
                        <span>{exam.year} ({exam.cycle})</span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1">{exam.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{exam.organization_name}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <Link
                        href={`/results?exam_id=${exam.id}`}
                        className="flex-1 text-center py-1.5 px-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Check Result
                      </Link>
                      <Link
                        href={`/hall-tickets?exam_id=${exam.id}`}
                        className="flex-1 text-center py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
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

      {/* 2. THREE MAIN CORE SERVICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Three Dedicated Examination Engines
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Direct, official and authorized retrieval pathways built specifically for Indian students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Service 1: Results */}
          <div className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2.5 py-1 rounded-full">
              SERVICE 1
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-3 mb-2">Examination Result Checker</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Search by exam, university, college, or state. View authentic marks, percentages, grades, ranks, and qualifying statuses. Download official PDF scorecards directly into personal vault.
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 mb-6">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>UPSC, SSC, RRB & State PSC Results</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>NEET, JEE & CUET National Scorecards</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>University Semester Marksheets & CGPA</span>
              </li>
            </ul>
            <Link
              href="/results"
              className="inline-flex items-center space-x-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <span>Check Results Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Service 2: Hall Tickets */}
          <div className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-500 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 px-2.5 py-1 rounded-full">
              SERVICE 2
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-3 mb-2">Hall Ticket Download</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Retrieve newly released e-Admit cards for recruitment and entrance exams. Check venue addresses, shift reporting times, rules and generate high-resolution PDF printouts.
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 mb-6">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Central & State Recruitment Admit Cards</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Entrance Exam Hall Tickets with Center Code</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>PDF Preview, Barcode & Instructions</span>
              </li>
            </ul>
            <Link
              href="/hall-tickets"
              className="inline-flex items-center space-x-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300"
            >
              <span>Download Admit Cards</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Service 3: Student ID Cards */}
          <div className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-500 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/40 px-2.5 py-1 rounded-full">
              SERVICE 3
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-3 mb-2">Student ID Card Download</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Access institution-issued student digital identity credentials or securely archive legitimate scans in your personal document library with zero forgery tolerance.
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 mb-6">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Government & Central University ID Portals</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Autonomous & Private College ERP Sync</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Malware Scanned & Signed Encrypted Vault</span>
              </li>
            </ul>
            <Link
              href="/id-cards"
              className="inline-flex items-center space-x-2 text-sm font-semibold text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
            >
              <span>Access Student ID Cards</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. LIVE ANNOUNCEMENTS & RECENT RESULTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recently Announced Results & Hall Tickets */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Active Indian Examinations</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Live indexed examination scorecards and entry passes</p>
              </div>
              <Link href="/directory" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800">
                View Full Directory →
              </Link>
            </div>

            <div className="space-y-3">
              {featuredExams.map((exam) => (
                <div key={exam.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                        {exam.organization_code}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                        Verified Available
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{exam.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{exam.organization_name} • Cycle: {exam.cycle} ({exam.year})</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <Link
                      href={`/results?exam_id=${exam.id}`}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm"
                    >
                      Check Score
                    </Link>
                    <Link
                      href={`/hall-tickets?exam_id=${exam.id}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                    >
                      Admit Card
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Announcement Feed */}
          <div className="bg-[#102D59] text-slate-200 rounded-2xl p-6 sm:p-8 border border-blue-950 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Official Bulletins</h3>
              </div>
              <p className="text-xs text-blue-200/80 mb-6 leading-relaxed">
                Live verified circulars published by national councils, commissions, and universities.
              </p>

              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-3.5 rounded-xl bg-white/10 border border-white/10 text-xs space-y-1.5">
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
                        className="inline-flex items-center space-x-1 text-sky-300 hover:text-white text-[11px] font-medium pt-1"
                      >
                        <span>View Official Circular</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/15 text-[11px] text-blue-200 flex items-center justify-between">
              <span>Updated automatically</span>
              <Link href="/dashboard" className="text-sky-300 hover:underline">
                Get Notifications →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. VERIFIED JOB VACANCIES & CAREER OPPORTUNITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Official Recruitment Desk</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Latest Verified Job Notifications
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Government ministries, public sector undertakings, and verified openings with confirmed source gazettes.
            </p>
          </div>
          <Link
            href="/jobs"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-all shrink-0 self-start sm:self-auto"
          >
            <span>Explore All Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredJobs && featuredJobs.length > 0 ? (
            featuredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                      {job.category || "Government"}
                    </span>
                    <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Verified</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{job.organization}</span>
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Vacancies</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{job.vacancies || "Open"} Posts</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Salary</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{job.salary || "As per norms"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Last Date</span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">{job.last_date || "Rolling"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={`/jobs/${job.slug || job.id}`}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <span>View Eligibility & Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            [
              { id: 1, title: "UPSC Civil Services Examination 2026", org: "Union Public Service Commission", cat: "Central Gov", posts: "1,056", salary: "Level 10 (₹56,100)", lastDate: "05 Mar 2026", slug: "upsc-cse-2026" },
              { id: 2, title: "RRB Assistant Loco Pilot & Tech Grade 1", org: "Railway Recruitment Control Board", cat: "Railway", posts: "18,799", salary: "Level 2 (₹19,900)", lastDate: "18 Mar 2026", slug: "rrb-alp-2026" },
              { id: 3, title: "SBI Probationary Officer (PO) Scale I", org: "State Bank of India", cat: "Banking", posts: "2,000", salary: "₹41,960 + Allowances", lastDate: "28 Feb 2026", slug: "sbi-po-2026" },
              { id: 4, title: "ISRO Scientist/Engineer 'SC' Recruitment", org: "Indian Space Research Organisation", cat: "Defence & Research", posts: "85", salary: "Level 10 (₹56,100)", lastDate: "12 Apr 2026", slug: "isro-scientist-sc" },
            ].map((j) => (
              <div
                key={j.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                      {j.cat}
                    </span>
                    <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Verified</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug">
                      {j.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{j.org}</span>
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Vacancies</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{j.posts} Posts</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Salary</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{j.salary}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Last Date</span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">{j.lastDate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={`/jobs/${j.slug}`}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <span>View Eligibility & Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 5. INDIA-WIDE DIRECTORY HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#102D59] via-[#0E284E] to-[#1D4ED8] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 font-bold text-xs uppercase tracking-wider">
              PAN-INDIA DIRECTORY
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Coverage Across All 28 States & 8 Union Territories
            </h2>
            <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed">
              From central recruitment boards to state public service commissions, deemed universities, and autonomous colleges, ExamHub India connects verified access pathways with official institutional portals.
            </p>
            <div className="pt-4 flex flex-wrap gap-3">
              <Link
                href="/directory"
                className="px-6 py-3 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-semibold text-sm transition-all shadow-md flex items-center space-x-2"
              >
                <span>Browse All-India Directory</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm transition-all border border-white/20"
              >
                Create Student Vault
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOLLOW US & OFFICIAL SOCIAL MEDIA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Info header */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300 text-xs font-bold uppercase tracking-wider">
                <Instagram className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                <span>Stay Connected</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Follow ExamHub India on Official Channels
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Receive prompt alerts for examination dates, admit card releases, verified answer keys, and newly gazetted job openings directly in your feed.
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Visit Contact & Helpdesk Centre →</span>
                </Link>
              </div>
            </div>

            {/* Social cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Featured Instagram Profile Card */}
              <div className="group relative bg-gradient-to-br from-slate-50 via-white to-pink-50/40 dark:from-slate-850 dark:via-slate-900 dark:to-pink-950/20 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-pink-400 dark:hover:border-pink-500 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                      <Instagram className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300">
                      Official Handle
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                      Instagram Profile
                    </h3>
                    <p className="text-xs font-semibold text-pink-600 dark:text-pink-400 mt-0.5">
                      {SITE_CONFIG.social.instagram.username}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      Instant circular notifications, admit card release announcements, and examination cycle updates.
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={SITE_CONFIG.social.instagram.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Follow on Instagram</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Student Support Helpdesk Card */}
              <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#102D59] text-white flex items-center justify-center shadow-md">
                      <Mail className="w-6 h-6 text-blue-300" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                      Helpdesk
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                      Direct Inquiries
                    </h3>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                      {SITE_CONFIG.social.email}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      Submit questions regarding scorecards, admit card retrieval, or official institution directory records.
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/contact"
                    className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Contact Support Desk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Everything you need to know about ExamHub India verification</p>
        </div>

        <div className="space-y-4 text-sm">
          {[
            {
              q: "Does ExamHub India generate fake or synthetic marksheets?",
              a: "Absolutely not. ExamHub India only retrieves and displays officially verified examination marks and scorecards published by official commissions, testing agencies, and universities. We never fabricate scorecards, admit cards, or student ID cards."
            },
            {
              q: "How does the hall ticket download service work?",
              a: "When an admit card is officially released, students enter their application or registration number. The platform retrieves verified exam center details and generates an authentic electronic entry document with instructions."
            },
            {
              q: "Can I save my results and documents permanently?",
              a: "Yes. Once you register for a free student account, any retrieved scorecard, admit card, or uploaded legitimate student ID card is encrypted and stored in your private Personal Document Library for instant retrieval."
            },
            {
              q: "What if my college or university is not yet integrated?",
              a: "ExamHub India provides direct, verified portal links and exact step-by-step instructions for all unsupported institutions. Administrators regularly add new verified institutions to the registry without modifying system code."
            }
          ].map((faq, i) => (
            <div key={i} className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">{faq.q}</h4>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
