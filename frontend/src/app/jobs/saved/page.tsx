"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bookmark, ArrowLeft, Building, MapPin, Calendar, 
  ExternalLink, Trash2, ShieldCheck, Briefcase, RefreshCw
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedJobs();
  }, []);

  async function loadSavedJobs() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/jobs/saved");
      setJobs(res.jobs || []);
    } catch (err: any) {
      console.error("Failed to load saved jobs:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleRemove = async (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    try {
      await fetchApi(`/api/jobs/${slug}/save`, { method: "POST" });
      setJobs(jobs.filter(j => j.slug !== slug));
    } catch (err: any) {
      console.error("Remove saved job error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Breadcrumbs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <Link href="/jobs" className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Job Portal</span>
            </Link>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white">Saved Job Bookmarks</h1>
                <p className="text-xs text-slate-400">Your personalized career bookmarks and saved notifications</p>
              </div>
            </div>
          </div>

          <button
            onClick={loadSavedJobs}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
          </button>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-xs font-semibold">Loading your saved jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Saved Jobs Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't bookmarked any opportunities yet. Browse notifications and click the bookmark button to save them here.
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <span>Explore Active Jobs</span>
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
                        {job.category?.replace("_", " ") || "RECRUITMENT"}
                      </span>
                      <span className="text-[10px] text-slate-500">Saved on {new Date(job.saved_at || Date.now()).toLocaleDateString("en-IN")}</span>
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

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleRemove(e, job.slug)}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-800 text-slate-400 hover:text-red-400 transition-colors"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px]">
                    <span>Qualification: <strong className="text-slate-200">{job.qualification}</strong></span>
                    <span>•</span>
                    <span>Deadline: <strong className="text-slate-200">{job.application_end_date ? new Date(job.application_end_date).toLocaleDateString("en-IN") : "Ongoing"}</strong></span>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <Link
                      href={`/jobs/${job.slug}`}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                    >
                      View Notice
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
