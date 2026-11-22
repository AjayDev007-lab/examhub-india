"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Search, Award, FileText, CheckCircle2, Briefcase, 
  ChevronRight, ArrowRight, ExternalLink, SlidersHorizontal,
  X, AlertCircle, RefreshCw, ChevronDown
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [states, setStates] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredExams, setFeaturedExams] = useState<any[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [statesData, catsData, examsData, jobsData] = await Promise.all([
          fetchApi("/api/states").catch(() => []),
          fetchApi("/api/categories").catch(() => []),
          fetchApi("/api/exams?limit=6").catch(() => []),
          fetchApi("/api/jobs?limit=4").catch(() => [])
        ]);
        setStates(statesData || []);
        setCategories(catsData || []);
        setFeaturedExams(examsData || []);
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

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedState("");
    setHasSearched(false);
    setSearchResults([]);
    searchInputRef.current?.focus();
  };

  const officialExternalLinks = [
    { name: "NTA", fullName: "National Testing Agency", url: "https://nta.ac.in/" },
    { name: "CBSE", fullName: "Central Board of Secondary Education", url: "https://www.cbse.gov.in/" },
    { name: "UPSC", fullName: "Union Public Service Commission", url: "https://upsc.gov.in/" },
    { name: "SSC", fullName: "Staff Selection Commission", url: "https://ssc.gov.in/" },
  ];

  const mainServices = [
    {
      title: "Results",
      description: "Check the latest examination results.",
      buttonText: "Explore Results",
      href: "/results",
      icon: Award,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
    },
    {
      title: "Admit Cards",
      description: "Find and download examination hall tickets.",
      buttonText: "Find Admit Cards",
      href: "/hall-tickets",
      icon: FileText,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/30",
    },
    {
      title: "Answer Keys",
      description: "Access provisional and final answer keys.",
      buttonText: "View Answer Keys",
      href: "/results",
      icon: CheckCircle2,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-900/30",
    },
    {
      title: "Jobs",
      description: "Explore government and private job opportunities.",
      buttonText: "Explore Jobs",
      href: "/jobs",
      icon: Briefcase,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/30",
    },
  ];

  return (
    <div className="space-y-12 pb-16 font-sans selection:bg-blue-600 selection:text-white">

      {/* ================================================================= */}
      {/* 1. HERO SECTION & PROMINENT SEARCH                                */}
      {/* ================================================================= */}
      <section className="bg-gradient-to-b from-[#0B1E3F] via-[#102D59] to-[#0A162B] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          
          {/* Headline (Max 2 lines, ~40px desktop, ~28px mobile) */}
          <h1 className="text-[28px] sm:text-[40px] font-black tracking-tight text-white leading-tight max-w-2xl mx-auto">
            Your Exams. Your Results.<br className="hidden sm:inline" /> Everything in One Place.
          </h1>

          {/* Supporting Text */}
          <p className="text-sm sm:text-base text-blue-100/90 max-w-xl mx-auto leading-relaxed">
            Find examination results, admit cards, answer keys and job opportunities easily.
          </p>

          {/* Primary Action: One Prominent Search Box */}
          <div className="pt-4 max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative shadow-xl rounded-2xl">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exam, e.g. NEET"
                  className="w-full pl-12 pr-28 py-3.5 sm:py-4 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-sm sm:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md transition-all"
                />

                {/* Clear Button */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-24 text-slate-400 hover:text-slate-600 p-1"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Submit Search Button */}
                <button
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSearching ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Search</span>
                  )}
                </button>
              </div>

              {/* Collapsible Filters Toggle */}
              <div className="pt-2 flex items-center justify-between text-xs text-blue-200">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center space-x-1 hover:text-white font-semibold transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{showFilters ? "Hide Filters" : "Filters (Category & State)"}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </button>

                {/* Trending tags hint */}
                <span className="hidden sm:inline text-blue-200/70 text-[11px]">
                  Popular: NEET, UPSC, SSC CGL, JEE, CBSE
                </span>
              </div>

              {/* Collapsible Filters Container */}
              {showFilters && (
                <div className="mt-2.5 p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left animate-fadeIn">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-1">
                      Examination Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900/90 text-white border border-blue-400/30 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                      <option value="">All Categories</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-1">
                      State / Union Territory
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900/90 text-white border border-blue-400/30 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                      <option value="">All States & UTs</option>
                      {states.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </form>

            {/* Quick Keyword Suggestions */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-4 text-xs">
              {["NEET", "UPSC Civil Services", "SSC CGL", "JEE Main", "CBSE 10th", "RRB NTPC"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 text-[11px] font-medium transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* SEARCH RESULTS DROPDOWN (Shown When Search Is Active)            */}
      {/* ================================================================= */}
      {hasSearched && (
        <section className="max-w-6xl mx-auto px-4 -mt-8 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                <span>Search Results ({searchResults.length})</span>
              </h2>
              <button 
                onClick={clearSearch}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Clear Results
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">No matching examinations found.</p>
                <p className="text-slate-400 mt-1">Try another examination name or keyword.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((exam) => (
                  <div 
                    key={exam.id} 
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span className="font-bold text-blue-600">{exam.organization_code}</span>
                        <span>{exam.year}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{exam.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{exam.organization_name}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <Link
                        href={`/results?exam_id=${exam.id}`}
                        className="flex-1 text-center py-2 px-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Check Result
                      </Link>
                      <Link
                        href={`/hall-tickets?exam_id=${exam.id}`}
                        className="flex-1 text-center py-2 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Admit Card
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
      {/* 2. MAIN SERVICE CARDS (4 LARGE CARDS DIRECTLY BELOW SEARCH)        */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {mainServices.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-xl ${card.bgColor} ${card.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed min-h-[36px]">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={card.href}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-1.5 group-hover:bg-blue-700"
                  >
                    <span>{card.buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 3. OFFICIAL EXTERNAL EXAM AUTHORITY LINKS                         */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Official Examination Authorities
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Always verify schedules, results and notices on the official website of the conducting examination body.
              </p>
            </div>
            <span className="text-[11px] text-slate-400">External Official Portals</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {officialExternalLinks.map((org) => (
              <a
                key={org.name}
                href={org.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:shadow-sm transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {org.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                    {org.fullName}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 4. RECENTLY INDEXED EXAMINATIONS & JOB UPDATES                    */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Latest Examinations */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Popular Examinations</span>
              </h3>
              <Link href="/results" className="text-xs font-semibold text-blue-600 hover:underline">
                View All Results →
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              {featuredExams.slice(0, 4).map((exam) => (
                <div
                  key={exam.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {exam.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {exam.organization_code} • {exam.year}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/results?exam_id=${exam.id}`}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-colors"
                    >
                      Results
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Job Opportunities */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-600" />
                <span>Recent Job Opportunities</span>
              </h3>
              <Link href="/jobs" className="text-xs font-semibold text-purple-600 hover:underline">
                View All Jobs →
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              {featuredJobs.slice(0, 4).map((job: any) => (
                <div
                  key={job.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-1">
                      {job.title}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {job.organization_name || job.company} • {job.qualification || "Graduate"}
                    </div>
                  </div>
                  <Link
                    href={`/jobs/${job.slug || job.id}`}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition-colors shrink-0"
                  >
                    Details
                  </Link>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ================================================================= */}
      {/* 5. FREQUENTLY ASKED QUESTIONS                                     */}
      {/* ================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-1.5 mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500">
            Clear, transparent information about ExamHub India
          </p>
        </div>

        <div className="space-y-2.5 text-xs">
          {[
            {
              q: "Is ExamHub India an official government website?",
              a: "No. ExamHub India is an independent educational information platform. We organize and index links to official government exam results, admit cards, and job notifications for Indian students."
            },
            {
              q: "How do I check my examination results?",
              a: "Navigate to the Results section or click 'Explore Results'. Select your target examination, enter your roll number or hall ticket number, and view your result details."
            },
            {
              q: "How can I verify if an examination notification is authentic?",
              a: "We provide direct links to the verified official websites of bodies like NTA, CBSE, UPSC, and SSC. We advise every student to verify closing dates and official circulars on the conducting authority's official domain."
            },
            {
              q: "Is there any fee to check results or admit cards on ExamHub India?",
              a: "No. ExamHub India is completely free to use. We do not charge students for accessing examination results, hall ticket links, or job notices."
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
                  className="w-full p-4 text-left font-bold text-slate-900 dark:text-white flex items-center justify-between text-xs sm:text-sm hover:text-blue-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
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
