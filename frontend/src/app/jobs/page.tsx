"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Briefcase, Search, Filter, Calendar, MapPin, GraduationCap, 
  Clock, ShieldCheck, Bookmark, BookmarkCheck, ExternalLink, 
  ChevronRight, ArrowRight, Building, Sparkles, AlertCircle, RefreshCw, X
} from "lucide-react";
import { fetchApi } from "@/lib/api";

const CATEGORIES = [
  { id: "ALL", label: "All Opportunities" },
  { id: "GOVERNMENT", label: "Central Govt" },
  { id: "STATE_GOVERNMENT", label: "State Govt" },
  { id: "RAILWAY", label: "Railways" },
  { id: "BANKING", label: "Banking & Finance" },
  { id: "DEFENCE", label: "Defence & Police" },
  { id: "TEACHING", label: "Teaching & Faculty" },
  { id: "IT", label: "IT & Software" },
  { id: "INTERNSHIP", label: "Internships" },
  { id: "APPRENTICESHIP", label: "Apprenticeships" },
  { id: "REMOTE", label: "Remote Jobs" }
];

const QUALIFICATIONS = [
  "All Qualifications",
  "10th / 12th",
  "ITI / Diploma",
  "Any Graduate",
  "B.E/B.Tech",
  "B.Sc / BCA / B.Com",
  "Post Graduate / MBA / MCA",
  "B.Ed / Teaching"
];

const EXPERIENCES = [
  { id: "ALL", label: "Any Experience" },
  { id: "FRESHER", label: "Fresher Friendly" },
  { id: "0-1", label: "0 - 1 Years" },
  { id: "1-3", label: "1 - 3 Years" },
  { id: "3-5", label: "3 - 5 Years" },
  { id: "5+", label: "5+ Years" }
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedQualification, setSelectedQualification] = useState("All Qualifications");
  const [selectedExperience, setSelectedExperience] = useState("ALL");
  const [selectedSector, setSelectedSector] = useState("ALL");
  const [selectedWorkMode, setSelectedWorkMode] = useState("ALL");
  const [closingSoonOnly, setClosingSoonOnly] = useState(false);
  const [sortBy, setSortBy] = useState("latest");

  // Mobile Filter Drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    loadJobs();
  }, [selectedCategory, selectedQualification, selectedExperience, selectedSector, selectedWorkMode, closingSoonOnly, sortBy]);

  async function loadJobs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (selectedCategory !== "ALL") params.append("category", selectedCategory);
      if (selectedQualification !== "All Qualifications") params.append("qualification", selectedQualification);
      if (selectedExperience !== "ALL") params.append("experience", selectedExperience);
      if (selectedSector !== "ALL") params.append("sector", selectedSector);
      if (selectedWorkMode !== "ALL") params.append("work_mode", selectedWorkMode);
      if (closingSoonOnly) params.append("closing_soon", "true");
      params.append("sort_by", sortBy);
      params.append("limit", "50");

      const res = await fetchApi(`/api/jobs?${params.toString()}`);
      setJobs(res.jobs || []);
      setTotalCount(res.total || 0);
    } catch (err: any) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs();
  };

  const handleToggleSave = async (e: React.MouseEvent, job: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetchApi(`/api/jobs/${job.slug}/save`, { method: "POST" });
      setJobs(jobs.map(j => j.id === job.id ? { ...j, is_saved: res.saved } : j));
    } catch (err: any) {
      console.error("Save job error:", err);
    }
  };

  const clearAllFilters = () => {
    setSearch("");
    setSelectedCategory("ALL");
    setSelectedQualification("All Qualifications");
    setSelectedExperience("ALL");
    setSelectedSector("ALL");
    setSelectedWorkMode("ALL");
    setClosingSoonOnly(false);
    setSortBy("latest");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Banner */}
      <section className="relative border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Verified Government & Authorized Career Updates</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
            National Job Notifications & Career Opportunities Portal
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Discover verified Central & State Government recruitments, Railways, Banking, Defence, Teaching, and IT engineering openings with official gazette PDFs.
          </p>

          {/* Quick Sub-navigation Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Link
              href="/jobs/latest"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-semibold hover:text-white transition-all"
            >
              🔥 Latest Notifications
            </Link>
            <Link
              href="/jobs/government"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-semibold hover:text-white transition-all"
            >
              🏛️ Central Government
            </Link>
            <Link
              href="/jobs/railway"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-semibold hover:text-white transition-all"
            >
              🚆 Railway Recruitment
            </Link>
            <Link
              href="/jobs/banking"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-semibold hover:text-white transition-all"
            >
              🏦 Banking & SBI / IBPS
            </Link>
            <Link
              href="/jobs/it"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-semibold hover:text-white transition-all"
            >
              💻 IT & Software
            </Link>
            <Link
              href="/jobs/saved"
              className="px-3.5 py-1.5 rounded-xl bg-blue-950/60 border border-blue-900 text-xs text-blue-300 font-bold hover:bg-blue-900/80 transition-all flex items-center space-x-1"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Jobs</span>
            </Link>
            <Link
              href="/jobs/applied"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-900 text-xs text-emerald-300 font-bold hover:bg-emerald-900/80 transition-all flex items-center space-x-1"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Application Tracker</span>
            </Link>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto pt-3">
            <div className="relative flex items-center shadow-2xl rounded-2xl bg-slate-900/90 border border-slate-800 p-1.5">
              <Search className="w-5 h-5 text-slate-400 ml-3.5 shrink-0" />
              <input
                type="text"
                placeholder="Search by job title, organization (UPSC, SSC, RRB), qualification (10th, B.Tech), or skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/30 shrink-0"
              >
                Search Jobs
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Results Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white text-sm">
              {loading ? "Searching opportunities..." : `${totalCount} Verified Job Notifications`}
            </span>
            {closingSoonOnly && (
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
                Closing Within 3 Days
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="sm:hidden px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center space-x-1.5 text-xs font-semibold"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="latest">Latest Published</option>
                <option value="deadline">Closing Soonest</option>
                <option value="popular">Most Viewed</option>
                <option value="vacancies">Highest Vacancies</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2-Column Layout: Sidebar Filters + Job Roster */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className={`lg:block ${mobileFilterOpen ? "block" : "hidden"} bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6 text-xs`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-400" />
                Refine Search
              </h3>
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
              >
                Reset All
              </button>
            </div>

            {/* Closing Soon Toggle */}
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/40 space-y-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={closingSoonOnly}
                  onChange={(e) => setClosingSoonOnly(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-red-600 focus:ring-0 w-4 h-4"
                />
                <span className="text-xs font-bold text-red-300">Deadlines Approaching</span>
              </label>
              <p className="text-[10px] text-slate-400 pl-6">Applications closing within 3 days</p>
            </div>

            {/* Qualification Filter */}
            <div className="space-y-2">
              <label className="font-bold text-slate-300 block uppercase tracking-wider text-[10px]">
                Educational Qualification
              </label>
              <select
                value={selectedQualification}
                onChange={(e) => setSelectedQualification(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {QUALIFICATIONS.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>

            {/* Experience Filter */}
            <div className="space-y-2">
              <label className="font-bold text-slate-300 block uppercase tracking-wider text-[10px]">
                Experience Level
              </label>
              <div className="space-y-1">
                {EXPERIENCES.map((exp) => (
                  <label key={exp.id} className="flex items-center space-x-2 text-slate-300 cursor-pointer hover:text-white py-0.5">
                    <input
                      type="radio"
                      name="experience_filter"
                      checked={selectedExperience === exp.id}
                      onChange={() => setSelectedExperience(exp.id)}
                      className="text-blue-600 bg-slate-950 border-slate-700 focus:ring-0"
                    />
                    <span>{exp.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sector Filter */}
            <div className="space-y-2">
              <label className="font-bold text-slate-300 block uppercase tracking-wider text-[10px]">
                Sector Classification
              </label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Sectors</option>
                <option value="CENTRAL_GOVT">Central Government</option>
                <option value="STATE_GOVT">State Government</option>
                <option value="PSU">Public Sector (PSU / Bank)</option>
                <option value="PRIVATE">Private Sector</option>
              </select>
            </div>

            {/* Work Mode */}
            <div className="space-y-2">
              <label className="font-bold text-slate-300 block uppercase tracking-wider text-[10px]">
                Work Mode
              </label>
              <select
                value={selectedWorkMode}
                onChange={(e) => setSelectedWorkMode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Modes</option>
                <option value="ON_SITE">On-Site</option>
                <option value="REMOTE">Remote / Work from Home</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            {/* Official Sources Notice */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-slate-400">
              <p className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Anti-Phishing Guarantee
              </p>
              <p className="text-[10px] leading-relaxed">
                ExamHub India only links directly to verified .gov.in, .nic.in, and authorized corporate career portals.
              </p>
            </div>
          </aside>

          {/* Job Roster Cards */}
          <div className="lg:col-span-3 space-y-4">
            {loading ? (
              <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-sm font-semibold">Loading verified job notifications...</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <h3 className="text-base font-bold text-white">No job notifications found</h3>
                <p className="text-xs max-w-md mx-auto">
                  No notifications match your current filter selection. Try adjusting your qualification, sector, or keyword filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              jobs.map((job) => {
                const isClosingSoon = job.is_closing_soon;
                const isExpired = job.is_expired;

                return (
                  <div
                    key={job.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 sm:p-6 transition-all space-y-4 shadow-sm hover:shadow-md"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                            job.sector === "CENTRAL_GOVT" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" :
                            job.sector === "STATE_GOVT" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                            job.sector === "PSU" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" :
                            "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                          }`}>
                            {job.sector.replace("_", " ")}
                          </span>

                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-semibold">
                            {job.category.replace("_", " ")}
                          </span>

                          {isClosingSoon && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30 animate-pulse">
                              ⏳ Closing in ≤ 3 Days
                            </span>
                          )}

                          {isExpired && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 text-[10px] font-bold">
                              Application Closed
                            </span>
                          )}
                        </div>

                        <Link href={`/jobs/${job.slug}`}>
                          <h2 className="text-base sm:text-lg font-bold text-white hover:text-blue-400 transition-colors leading-snug">
                            {job.title}
                          </h2>
                        </Link>

                        <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          <span>{job.organization_name}</span>
                        </p>
                      </div>

                      {/* Bookmark Button */}
                      <button
                        onClick={(e) => handleToggleSave(e, job)}
                        className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                          job.is_saved
                            ? "bg-blue-600/20 border-blue-500 text-blue-400"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                        }`}
                        title={job.is_saved ? "Saved" : "Save Job"}
                      >
                        {job.is_saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Metadata Pill Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 block uppercase font-semibold">Qualification</span>
                        <span className="text-slate-200 font-semibold truncate block" title={job.qualification}>
                          {job.qualification}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 block uppercase font-semibold">Total Vacancies</span>
                        <span className="text-emerald-400 font-bold block">
                          {job.vacancies_count ? `${job.vacancies_count.toLocaleString()} Posts` : "Refer Notification"}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 block uppercase font-semibold">Salary / Pay Scale</span>
                        <span className="text-slate-200 font-semibold truncate block" title={job.salary_range || "As per 7th CPC"}>
                          {job.salary_range || "Official Rules"}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 block uppercase font-semibold">Last Date to Apply</span>
                        <span className={`font-bold block ${isClosingSoon ? "text-red-400 font-black" : "text-slate-200"}`}>
                          {job.application_end_date ? new Date(job.application_end_date).toLocaleDateString("en-IN") : "Ongoing"}
                        </span>
                      </div>
                    </div>

                    {/* Footer Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/60 text-xs">
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {job.location} ({job.work_mode})
                        </span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      </div>

                      <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
                        <Link
                          href={`/jobs/${job.slug}`}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                        >
                          <span>{isExpired ? "Notice Details" : "Full Details"}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>

                        {isExpired ? (
                          <span className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold flex items-center space-x-1 cursor-default">
                            <span>Applications Closed</span>
                          </span>
                        ) : (
                          <a
                            href={job.official_application_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              fetchApi(`/api/jobs/${job.slug}/apply`, { method: "POST" }).catch(() => {});
                            }}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-blue-600/20 transition-all"
                          >
                            <span>Apply Online</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
