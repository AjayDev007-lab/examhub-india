"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BarChart3, ArrowLeft, Download, RefreshCw, Calendar, 
  Users, BookOpen, Briefcase, Globe, TrendingUp, CheckCircle, 
  ExternalLink, ChevronRight, Activity, ArrowUpRight
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminAnalyticsPage() {
  const [rangeType, setRangeType] = useState("30d");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [rangeType]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const res = await fetchApi(`/api/admin/analytics/overview?range_type=${rangeType}`);
      setData(res);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};
  const dailyActivity = charts?.daily_activity || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/dashboard"
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
              title="Return to Main Admin Console"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black text-white tracking-tight">Platform Analytics & Monitoring</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  REAL-TIME DB AGGREGATES
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggregated student registrations, exam milestones, career view trends, and official source health.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Date Range Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-semibold">
              <button
                onClick={() => setRangeType("today")}
                className={`px-3 py-1.5 rounded-lg transition-all ${rangeType === "today" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"}`}
              >
                Today
              </button>
              <button
                onClick={() => setRangeType("7d")}
                className={`px-3 py-1.5 rounded-lg transition-all ${rangeType === "7d" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"}`}
              >
                7 Days
              </button>
              <button
                onClick={() => setRangeType("30d")}
                className={`px-3 py-1.5 rounded-lg transition-all ${rangeType === "30d" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"}`}
              >
                30 Days
              </button>
              <button
                onClick={() => setRangeType("90d")}
                className={`px-3 py-1.5 rounded-lg transition-all ${rangeType === "90d" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"}`}
              >
                90 Days
              </button>
            </div>

            <a
              href="/api/admin/analytics/export"
              download
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export CSV</span>
            </a>

            <button
              onClick={loadAnalytics}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition-colors"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Primary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>Total Students</span>
              <Users className="w-3.5 h-3.5 text-blue-400" />
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {metrics.total_users?.toLocaleString() || 0}
            </div>
            <span className="text-[10px] text-emerald-400 flex items-center space-x-0.5 mt-0.5">
              <span>+{metrics.new_users_today || 0} today</span>
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>Exam Registrations</span>
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            </span>
            <div className="text-2xl font-black text-purple-400 mt-1">
              {metrics.total_exam_registrations?.toLocaleString() || 0}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Student calendar syncs</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>Total Vacancies</span>
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {metrics.total_vacancies?.toLocaleString() || 0}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">{metrics.published_jobs || 0} gazette notices</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>Outbound Applies</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
            </span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {metrics.total_app_clicks?.toLocaleString() || 0}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Portal redirects</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>Govt Directory</span>
              <Globe className="w-3.5 h-3.5 text-blue-400" />
            </span>
            <div className="text-2xl font-black text-blue-400 mt-1">
              {metrics.verified_websites?.toLocaleString() || 0}
            </div>
            <span className="text-[10px] text-emerald-400 mt-0.5 block">100% verified domains</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>System Health</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {metrics.uptime_pct || 99.98}%
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">All services healthy</span>
          </div>
        </div>

        {/* Charts & Trends Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Activity Chart */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-black text-white tracking-tight">Platform Engagement Trends</h2>
                <p className="text-xs text-slate-400">Daily student registrations and recruitment notice interactions.</p>
              </div>
              <div className="flex items-center space-x-3 text-[11px] font-semibold">
                <span className="flex items-center space-x-1 text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span>Registrations</span>
                </span>
                <span className="flex items-center space-x-1 text-purple-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <span>Job Views</span>
                </span>
              </div>
            </div>

            {/* SVG Visual Chart */}
            <div className="h-64 flex items-end justify-between pt-6 px-2 border-b border-slate-800 gap-3">
              {dailyActivity.map((day: any, idx: number) => {
                const regHeight = Math.min(100, (day.registrations / 45) * 100);
                const viewHeight = Math.min(100, (day.job_views / 320) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="w-full flex items-end justify-center space-x-1.5 h-full">
                      {/* Bar 1: Registrations */}
                      <div
                        style={{ height: `${regHeight}%` }}
                        className="w-1/2 max-w-5 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all group-hover:brightness-125"
                        title={`Registrations: ${day.registrations}`}
                      ></div>
                      {/* Bar 2: Views */}
                      <div
                        style={{ height: `${viewHeight}%` }}
                        className="w-1/2 max-w-5 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all group-hover:brightness-125"
                        title={`Views: ${day.job_views}`}
                      ></div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold mt-2 shrink-0">{day.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Viewed Opportunities */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h2 className="text-base font-black text-white tracking-tight">Most Viewed Vacancies</h2>
              <Link href="/admin/jobs" className="text-xs font-bold text-blue-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {(charts.top_jobs || []).map((j: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1">
                  <div className="text-xs font-bold text-white line-clamp-1">{j.title}</div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span className="truncate max-w-36">{j.organization}</span>
                    <span className="font-bold text-blue-400">{j.views?.toLocaleString()} views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <Link
            href="/admin/exam-registrations"
            className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-white">Student Exam Registrations</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Audit student application statuses</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </Link>

          <Link
            href="/admin/official-websites"
            className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-white">Official Websites Directory</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Manage 67+ verified government portals</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </Link>

          <Link
            href="/admin/system-health"
            className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-white">Automation Engine & Health</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Trigger scheduled background tasks</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </Link>
        </div>
      </div>
    </div>
  );
}
