"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Briefcase, ArrowLeft, Building, ExternalLink, 
  CheckCircle, Clock, AlertCircle, RefreshCw, ChevronRight, FileCheck
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AppliedJobsTrackerPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/jobs/applied");
      setApplications(res.applications || []);
    } catch (err: any) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  }

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
              <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white">Application Tracker</h1>
                <p className="text-xs text-slate-400">Track and manage your submitted job applications and candidate portals</p>
              </div>
            </div>
          </div>

          <button
            onClick={loadApplications}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-semibold">Loading your application records...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Tracked Applications</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When you click "Apply Online" on any verified notification, your activity is automatically recorded here so you can keep track of registration numbers and status.
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <span>Browse Active Recruitments</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.application_id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {app.application_status}
                      </span>
                      {app.application_number && (
                        <span className="px-2 py-0.5 rounded bg-slate-950 font-mono text-[10px] text-slate-400 border border-slate-800">
                          Reg No: {app.application_number}
                        </span>
                      )}
                    </div>

                    <Link href={`/jobs/${app.slug}`}>
                      <h2 className="text-base font-bold text-white hover:text-blue-400 transition-colors">
                        {app.title}
                      </h2>
                    </Link>

                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span>{app.organization_name}</span>
                    </p>
                  </div>

                  <a
                    href={app.official_application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-blue-600/20 shrink-0"
                  >
                    <span>Open Candidate Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span>Notes: <strong className="text-slate-300 font-medium">{app.notes || "Official redirect completed."}</strong></span>
                  <span className="text-[10px] text-slate-500">
                    Tracked on {new Date(app.applied_at || Date.now()).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
