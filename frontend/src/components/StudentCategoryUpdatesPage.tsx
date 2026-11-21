"use client";

import React, { useState, useEffect } from "react";
import StudentUpdatesNav from "@/components/StudentUpdatesNav";
import StudentUpdateCard from "@/components/StudentUpdateCard";
import { fetchApi } from "@/lib/api";
import { Search, Filter, ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";

interface StudentCategoryUpdatesPageProps {
  category: string;
  title: string;
  subtitle: string;
}

export default function StudentCategoryUpdatesPage({ category, title, subtitle }: StudentCategoryUpdatesPageProps) {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [badgeFilter, setBadgeFilter] = useState("ALL");
  const [closingSoonOnly, setClosingSoonOnly] = useState(false);

  useEffect(() => {
    loadCategoryUpdates();
  }, [category, badgeFilter, closingSoonOnly]);

  async function loadCategoryUpdates() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "ALL") params.append("category", category);
      if (badgeFilter !== "ALL") params.append("badge", badgeFilter);
      if (closingSoonOnly) params.append("closing_soon", "true");
      const res = await fetchApi(`/api/updates?${params.toString()}`);
      setUpdates(res.updates || []);
    } catch (err) {
      console.error(`Failed to load category ${category} updates:`, err);
    } finally {
      setLoading(false);
    }
  }

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
      {/* Header */}
      <section className="bg-gradient-to-b from-[#102D59] via-[#0D2344] to-[#0A1A33] text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-300">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
            <Link href="/updates" className="hover:text-white transition-colors">Daily Updates</Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
            <span className="text-white font-bold">{title}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white">{title}</h1>
          <p className="text-xs sm:text-sm text-blue-200/90 max-w-2xl leading-relaxed">{subtitle}</p>
        </div>
      </section>

      <StudentUpdatesNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications, organizations..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <select
              value={badgeFilter}
              onChange={(e) => setBadgeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="ALL">All Verification Badges</option>
              <option value="OFFICIALLY_VERIFIED">Officially Verified</option>
              <option value="THIRD_PARTY">Employer Direct</option>
              <option value="EXPECTED_UNOFFICIAL">Expected – Confirmation Pending</option>
            </select>

            <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={closingSoonOnly}
                onChange={(e) => setClosingSoonOnly(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Closing Soon Only</span>
            </label>
          </div>
        </div>

        {/* Updates Feed */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading verified notifications...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#102D59]/20 rounded-3xl border border-slate-200 dark:border-blue-900/30 text-slate-500 text-xs">
            No updates found matching your filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((u) => (
              <StudentUpdateCard key={u.id} update={u} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
