"use client";

import React, { useState, useEffect } from "react";
import AdminDailyUpdatesNav from "@/components/AdminDailyUpdatesNav";
import AdminUpdateCard from "@/components/AdminUpdateCard";
import { fetchApi } from "@/lib/api";
import { Search, Filter, ShieldCheck, CheckCircle2 } from "lucide-react";

interface AdminCategoryUpdatesPageProps {
  category: string;
  title: string;
  subtitle: string;
}

export default function AdminCategoryUpdatesPage({ category, title, subtitle }: AdminCategoryUpdatesPageProps) {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [notificationMsg, setNotificationMsg] = useState("");

  useEffect(() => {
    loadCategoryUpdates();
  }, [category, statusFilter]);

  async function loadCategoryUpdates() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "ALL") params.append("category", category);
      if (statusFilter !== "ALL") params.append("verification_status", statusFilter);
      const res = await fetchApi(`/api/admin/daily-updates/updates?${params.toString()}`);
      setUpdates(res.updates || []);
    } catch (err) {
      console.error(`Failed to load updates for category ${category}:`, err);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(id: number, action: "APPROVE" | "PUBLISH" | "REJECT" | "ARCHIVE") {
    try {
      await fetchApi(`/api/admin/daily-updates/updates/${id}/verify`, {
        method: "POST",
        body: JSON.stringify({ action })
      });
      setNotificationMsg(`Update #${id} updated to ${action}`);
      setTimeout(() => setNotificationMsg(""), 4000);
      await loadCategoryUpdates();
    } catch (err) {
      console.error("Failed verification:", err);
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <AdminDailyUpdatesNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {notificationMsg && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search updates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#102D59]/40 border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#102D59]/40 border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Content Stream */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading updates stream...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#102D59]/20 rounded-2xl border border-slate-200 dark:border-blue-900/30 text-slate-500 text-xs">
            No updates matched the selected filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((update) => (
              <AdminUpdateCard
                key={update.id}
                update={update}
                onVerify={(action) => handleVerify(update.id, action)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
