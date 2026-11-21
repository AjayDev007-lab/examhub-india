"use client";

import React, { useState, useEffect } from "react";
import AdminDailyUpdatesNav from "@/components/AdminDailyUpdatesNav";
import AdminUpdateCard from "@/components/AdminUpdateCard";
import { fetchApi } from "@/lib/api";
import { CheckSquare, ShieldCheck, CheckCircle2, Clock } from "lucide-react";

export default function AdminDailyVerificationQueuePage() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationMsg, setNotificationMsg] = useState("");

  useEffect(() => {
    loadQueue();
  }, []);

  async function loadQueue() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/admin/daily-updates/updates");
      setUpdates(res.updates || []);
    } catch (err) {
      console.error("Failed to load verification queue:", err);
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
      setNotificationMsg(`Update #${id} status changed to ${action}. Audit entry recorded.`);
      setTimeout(() => setNotificationMsg(""), 4000);
      await loadQueue();
    } catch (err) {
      console.error("Verification error:", err);
    }
  }

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

        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-blue-500" />
            <span>Editorial Verification & Publishing Queue</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Strict human verification pipeline: Detected → Processing → Pending Verification → Approved → Published → Archived.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading queue items...</div>
        ) : updates.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#102D59]/20 rounded-2xl border border-slate-200 dark:border-blue-900/30 text-slate-500 text-xs">
            All detected updates have been reviewed and published.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {updates.map((update) => (
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
