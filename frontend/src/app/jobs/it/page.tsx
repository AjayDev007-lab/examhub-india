"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase, Search, Filter, MapPin, Building2, Calendar,
  ExternalLink, Bookmark, CheckCircle2, DollarSign, Laptop,
  Sparkles, SlidersHorizontal, ArrowRight, Share2, Layers,
  ChevronRight, ArrowUpRight, Clock
} from "lucide-react";
import { ITJobItem } from "@/lib/platformData";

export default function ITJobsPage() {
  const [jobs, setJobs] = useState<ITJobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedExperience, setSelectedExperience] = useState("ALL");
  const [selectedWorkMode, setSelectedWorkMode] = useState("ALL");
  const [savedJobIds, setSavedJobIds] = useState<number[]>([]);
  const [activeJobModal, setActiveJobModal] = useState<ITJobItem | null>(null);

  useEffect(() => {
    fetchJobs();
    const saved = localStorage.getItem("examhub_saved_it_jobs");
    if (saved) {
      try {
        setSavedJobIds(JSON.parse(saved));
      } catch (_) {}
    }
  }, [selectedCategory, selectedExperience, selectedWorkMode]);

  async function fetchJobs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "ALL") params.append("category", selectedCategory);
      if (selectedExperience !== "ALL") params.append("experience", selectedExperience);
      if (selectedWorkMode !== "ALL") params.append("work_mode", selectedWorkMode);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/it-jobs?${params.toString()}`);
      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);
      }
    } catch (err) {
      console.error("Failed to load IT jobs:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchJobs();
  }

  function toggleSaveJob(id: number) {
    let updated: number[];
    if (savedJobIds.includes(id)) {
      updated = savedJobIds.filter(j => j !== id);
    } else {
      updated = [...savedJobIds, id];
    }
    setSavedJobIds(updated);
    localStorage.setItem("examhub_saved_it_jobs", JSON.stringify(updated));
  }

  const categories = [
    { id: "ALL", label: "All Tech Roles" },
    { id: "SOFTWARE_DEV", label: "Software Developer" },
    { id: "FULLSTACK", label: "Full Stack Developer" },
    { id: "FRONTEND", label: "Frontend Engineer" },
    { id: "DATA_ANALYST", label: "Data Analyst" },
    { id: "AI_ML", label: "AI & Machine Learning" },
    { id: "INTERNSHIP", label: "Internships & Freshers" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* 1. HERO HEADER */}
      <section className="bg-gradient-to-b from-[#081629] via-[#0f2746] to-[#081629] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-6xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
            <Laptop className="w-4 h-4 text-sky-400" />
            <span>IT & Private Tech Careers • Verified Job Drives 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Discover Verified <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-300">IT & Software Jobs</span> across India
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Curated openings from top product companies, IT giants, and high-growth startups. Direct official career portal links, transparent salary ranges, and zero registration fees.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-2 pt-2">
            <div className="relative w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by role, company (Zoho, TCS, Infosys), or skills (React, Python)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 shadow-xl"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 shrink-0"
            >
              Find Tech Jobs
            </button>
          </form>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT AREA */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Secondary Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-200 dark:border-slate-800 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </span>

            {/* Experience Filter */}
            <select
              value={selectedExperience}
              onChange={e => setSelectedExperience(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 focus:outline-none"
            >
              <option value="ALL">All Experience Levels</option>
              <option value="FRESHER">Fresher / 0-1 Yr</option>
              <option value="EXPERIENCED">Experienced (1-3+ Yrs)</option>
              <option value="INTERNSHIP">Internship Only</option>
            </select>

            {/* Work Mode Filter */}
            <select
              value={selectedWorkMode}
              onChange={e => setSelectedWorkMode(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 focus:outline-none"
            >
              <option value="ALL">All Work Modes</option>
              <option value="REMOTE">100% Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ON_SITE">On-Site Office</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-blue-600 dark:text-blue-400">{jobs.length}</span> Opportunities
          </div>
        </div>

        {/* Jobs List Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-4">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No IT Jobs Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No openings matched your current filter criteria. Try resetting filters or searching with broad terms like "Developer" or "Fresher".
            </p>
            <button
              onClick={() => {
                setSelectedCategory("ALL");
                setSelectedExperience("ALL");
                setSelectedWorkMode("ALL");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-500"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map(job => {
              const isSaved = savedJobIds.includes(job.id);
              return (
                <div
                  key={job.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Company Logo & Action */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                          {job.company_logo_url ? (
                            <img src={job.company_logo_url} alt={job.company_name} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <Building2 className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{job.company_name}</h4>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {job.title}
                          </h3>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        className={`p-2 rounded-xl border transition-all ${
                          isSaved
                            ? "bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-950 dark:border-blue-700"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-600"
                        }`}
                        title={isSaved ? "Saved to your dashboard" : "Save this job"}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    {/* Meta Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> {job.salary_range}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium border border-blue-200 dark:border-blue-800">
                        {job.category_display}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium border border-purple-200 dark:border-purple-800">
                        {job.work_mode}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-800">
                        {job.experience_level}
                      </span>
                    </div>

                    {/* Location & Summary */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {job.job_description}
                    </p>

                    {/* Skills pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {job.required_skills.slice(0, 4).map((skill, sIdx) => (
                        <span key={sIdx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-mono">
                          {skill}
                        </span>
                      ))}
                      {job.required_skills.length > 4 && (
                        <span className="text-[10px] text-slate-400">+{job.required_skills.length - 4} more</span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom / Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3 h-3" /> {job.location.split("/")[0]}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveJobModal(job)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all"
                      >
                        Details
                      </button>

                      <a
                        href={job.official_apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                      >
                        <span>Apply</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. MODAL: DETAILED JOB VIEW */}
      {activeJobModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl animate-fadeIn">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{activeJobModal.company_name}</span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{activeJobModal.title}</h2>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" /> {activeJobModal.location}
                </p>
              </div>

              <button
                onClick={() => setActiveJobModal(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Salary</span>
                <span className="font-bold text-slate-800 dark:text-white">{activeJobModal.salary_range}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Experience</span>
                <span className="font-bold text-slate-800 dark:text-white">{activeJobModal.experience_level}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Work Mode</span>
                <span className="font-bold text-slate-800 dark:text-white">{activeJobModal.work_mode}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Deadline</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {new Date(activeJobModal.application_deadline).toLocaleDateString("en-IN")}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Role Overview</h3>
              <p className="leading-relaxed">{activeJobModal.job_description}</p>
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Key Responsibilities</h3>
              <ul className="list-disc pl-5 space-y-1">
                {activeJobModal.responsibilities.map((resp, rIdx) => (
                  <li key={rIdx}>{resp}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Required Skills & Technologies</h3>
              <div className="flex flex-wrap gap-1.5">
                {activeJobModal.required_skills.map((skill, sIdx) => (
                  <span key={sIdx} className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-xs border border-blue-200 dark:border-blue-800">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => toggleSaveJob(activeJobModal.id)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
              >
                <Bookmark className={`w-4 h-4 ${savedJobIds.includes(activeJobModal.id) ? "fill-current text-blue-600" : ""}`} />
                <span>{savedJobIds.includes(activeJobModal.id) ? "Saved" : "Save Job"}</span>
              </button>

              <a
                href={activeJobModal.official_apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30"
              >
                <span>Apply on Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
