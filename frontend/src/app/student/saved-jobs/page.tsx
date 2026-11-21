"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bookmark, Trash2, ExternalLink, ArrowRight, 
  Building, MapPin, Briefcase
} from "lucide-react";
import StudentNav from "@/components/StudentNav";
import { fetchApi } from "@/lib/api";

export default function StudentSavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedJobs();
  }, []);

  async function loadSavedJobs() {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("examhub_user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || 1;

      const res = await fetchApi(`/api/jobs/saved?user_id=${userId}`);
      if (res && (res.jobs || res.saved_jobs)) {
        setSavedJobs(res.jobs || res.saved_jobs);
      }
    } catch (err) {
      console.error("Failed to load saved jobs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveSaved(jobId: number) {
    try {
      const userStr = localStorage.getItem("examhub_user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || 1;

      await fetchApi(`/api/jobs/${jobId}/save?user_id=${userId}`, { method: "POST" });
      setSavedJobs(savedJobs.filter((j) => j.id !== jobId));
    } catch (err) {
      alert("Failed to remove bookmark");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <StudentNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Saved Career Bookmarks
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Verified recruitment notices and vacancies you have bookmarked for future review and application.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading saved jobs...
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm space-y-3">
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No saved jobs yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click the bookmark icon on any job notification card to save it here for quick access.
            </p>
            <Link
              href="/jobs"
              className="inline-block px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Explore Job Openings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {job.sector}
                    </span>
                    <button
                      onClick={() => handleRemoveSaved(job.id)}
                      className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight line-clamp-1">
                      {job.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">{job.organization_name}</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pay Scale:</span>
                      <span className="font-bold text-slate-900">{job.salary_range || job.pay_scale || "Govt Rules"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Date:</span>
                      <span className="font-bold text-slate-900">
                        {job.application_end_date ? new Date(job.application_end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Open"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/jobs/${job.slug || job.id}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <span>View Gazette Notice</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {job.official_application_url && (
                    <a
                      href={job.official_application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                      title="Official Portal"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
