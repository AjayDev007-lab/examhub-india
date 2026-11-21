"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StudentUpdatesNav from "@/components/StudentUpdatesNav";
import StudentUpdateCard from "@/components/StudentUpdateCard";
import { fetchApi } from "@/lib/api";
import { 
  Radio, Sparkles, Clock, ShieldCheck, Search, Filter, 
  ArrowRight, Briefcase, GraduationCap, Award, BookOpen, Layers 
} from "lucide-react";

export default function StudentUpdatesHomePage() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUpdates();
  }, []);

  async function loadUpdates() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/updates");
      setUpdates(res.updates || []);
    } catch (err) {
      console.error("Failed to load public updates:", err);
    } finally {
      setLoading(false);
    }
  }

  const closingSoon = updates.filter(u => u.is_closing_soon);
  const featured = updates.filter(u => u.is_featured);

  const filtered = updates.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.title.toLowerCase().includes(term) ||
      u.organization.toLowerCase().includes(term) ||
      (u.qualification && u.qualification.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-[#102D59] via-[#0D2344] to-[#0A1A33] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 text-xs font-bold px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>DAILY VERIFIED INDIAN EDUCATION & RECRUITMENT UPDATES</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Smart Daily Updates Centre
          </h1>
          <p className="text-sm sm:text-base text-blue-200/90 max-w-2xl leading-relaxed">
            Directly monitoring UPSC, SSC, Railways, Banking, State PSCs, CBSE, and SCERT education authorities. 100% verified, 100% free, and updated multiple times daily.
          </p>

          {/* Quick Search */}
          <div className="pt-2 max-w-xl">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-blue-300" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search today's jobs, examinations, board results..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs sm:text-sm backdrop-blur-md"
              />
            </div>
          </div>
        </div>
      </section>

      <StudentUpdatesNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Closing Soon Section */}
        {closingSoon.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-red-500 animate-pulse" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Applications Closing Soon
                </h2>
              </div>
              <Link href="/updates/jobs" className="text-xs font-bold text-[#2563EB] hover:underline flex items-center space-x-1">
                <span>View All Vacancies</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {closingSoon.map((u) => (
                <StudentUpdateCard key={u.id} update={u} />
              ))}
            </div>
          </div>
        )}

        {/* Today's Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Today&apos;s Highlights & Latest Notifications
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every entry is cross-checked against official gazette notifications and commission servers.
              </p>
            </div>
            <Link href="/updates/latest" className="text-xs font-bold text-[#2563EB] hover:underline flex items-center space-x-1">
              <span>View Chronological Feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs">Loading updates feed...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#102D59]/20 rounded-3xl border border-slate-200 dark:border-blue-900/30 text-slate-500 text-xs">
              No updates found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {filtered.map((u) => (
                <StudentUpdateCard key={u.id} update={u} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
