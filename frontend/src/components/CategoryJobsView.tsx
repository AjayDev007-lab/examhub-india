"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Search, Building, MapPin, ShieldCheck, 
  Bookmark, BookmarkCheck, ExternalLink, ChevronRight, RefreshCw, Briefcase, Filter
} from "lucide-react";
import { fetchApi } from "@/lib/api";

interface CategoryJobsViewProps {
  title: string;
  subtitle: string;
  badge: string;
  defaultCategory?: string;
  defaultSector?: string;
  defaultWorkMode?: string;
  onlyLatest?: boolean;
}

export default function CategoryJobsView({
  title,
  subtitle,
  badge,
  defaultCategory,
  defaultSector,
  defaultWorkMode,
  onlyLatest
}: CategoryJobsViewProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [qualification, setQualification] = useState("ALL");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    loadCategoryJobs();
  }, [search, qualification, sortBy]);

  async function loadCategoryJobs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (defaultCategory) params.append("category", defaultCategory);
      if (defaultSector) params.append("sector", defaultSector);
      if (defaultWorkMode) params.append("work_mode", defaultWorkMode);
      if (search.trim()) params.append("search", search.trim());
      if (qualification !== "ALL") params.append("qualification", qualification);
      params.append("sort_by", sortBy);
      params.append("limit", "50");

      const res = await fetchApi(`/api/jobs?${params.toString()}`);
      let list = res.jobs || [];
      if (onlyLatest) {
        // Filter jobs published in last 14 days
        const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
        list = list.filter((j: any) => new Date(j.published_at || j.created_at).getTime() >= twoWeeksAgo);
      }
      setJobs(list);
    } catch (err: any) {
      console.error("Failed to load category jobs:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleSave = async (e: React.MouseEvent, job: any) => {
    e.preventDefault();
    try {
      const res = await fetchApi(`/api/jobs/${job.slug}/save`, { method: "POST" });
      setJobs(jobs.map(j => j.id === job.id ? { ...j, is_saved: res.saved } : j));
    } catch (err: any) {
      console.error("Save error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Breadcrumbs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Link href="/jobs" className="hover:text-white flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Jobs</span>
              </Link>
              <span>/</span>
              <span className="text-blue-400 font-semibold">{badge}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{title}</h1>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>

          <button
            onClick={loadCategoryJobs}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search in this category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Qualifications</option>
            <option value="10th">10th / Matriculation</option>
            <option value="Graduate">Any Graduate</option>
            <option value="B.E">B.E. / B.Tech</option>
            <option value="Diploma">Diploma / ITI</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="latest">Latest Published</option>
            <option value="deadline">Closing Soonest</option>
            <option value="vacancies">Highest Vacancies</option>
          </select>
        </div>

        {/* Jobs list */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-xs font-semibold">Loading opportunities...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
            <Briefcase className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No active openings in this section</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Check back shortly or explore other categories across Central, State, and IT sectors.
            </p>
            <Link
              href="/jobs"
              className="inline-flex px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Browse All Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {job.category?.replace("_", " ")}
                      </span>
                      {job.is_closing_soon && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30">
                          Closing Soon
                        </span>
                      )}
                    </div>

                    <Link href={`/jobs/${job.slug}`}>
                      <h2 className="text-base font-bold text-white hover:text-blue-400 transition-colors">
                        {job.title}
                      </h2>
                    </Link>

                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span>{job.organization_name}</span>
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleToggleSave(e, job)}
                    className={`p-2 rounded-xl border transition-all ${
                      job.is_saved
                        ? "bg-blue-600/20 border-blue-500 text-blue-400"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {job.is_saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Qualification</span>
                    <span className="text-slate-200 font-semibold truncate block">{job.qualification}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Vacancies</span>
                    <span className="text-emerald-400 font-bold block">{job.vacancies_count?.toLocaleString()} Posts</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Location</span>
                    <span className="text-slate-200 font-semibold truncate block">{job.location}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Last Date</span>
                    <span className="text-slate-200 font-semibold block">
                      {job.application_end_date ? new Date(job.application_end_date).toLocaleDateString("en-IN") : "Ongoing"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800/60 text-xs">
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    View Details
                  </Link>

                  <a
                    href={job.official_application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1"
                  >
                    <span>Apply Online</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
