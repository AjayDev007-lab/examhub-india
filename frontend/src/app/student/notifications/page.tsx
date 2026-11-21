"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bell, CheckCircle2, Clock, AlertTriangle, 
  Briefcase, BookOpen, Calendar, ArrowRight, Trash2
} from "lucide-react";
import StudentNav from "@/components/StudentNav";
import { fetchApi } from "@/lib/api";

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "EXAM" | "DEADLINE" | "JOB">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/notifications");
      setNotifications(res || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id: number) {
    try {
      await fetchApi(`/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications(notifications.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  }

  const filtered = notifications.filter((n) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "EXAM") return n.type?.includes("EXAM");
    if (activeTab === "DEADLINE") return n.type?.includes("DEADLINE") || n.type?.includes("CLOSING");
    if (activeTab === "JOB") return n.type?.includes("JOB") || n.type?.includes("CAREER");
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <StudentNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Student Notification Centre
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Automated examination schedule alerts, deadline reminders, admit card notifications, and matching job postings.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex border-b border-slate-200 space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`pb-3 transition-colors ${activeTab === "ALL" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-900"}`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab("EXAM")}
            className={`pb-3 transition-colors ${activeTab === "EXAM" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-900"}`}
          >
            Examination Alerts
          </button>
          <button
            onClick={() => setActiveTab("DEADLINE")}
            className={`pb-3 transition-colors ${activeTab === "DEADLINE" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-900"}`}
          >
            Application Deadlines
          </button>
          <button
            onClick={() => setActiveTab("JOB")}
            className={`pb-3 transition-colors ${activeTab === "JOB" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-900"}`}
          >
            Job Recommendations
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading notifications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900">No notifications in this category</h3>
            <p className="text-xs text-slate-500 mt-1">You are all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  n.is_read
                    ? "bg-white border-slate-200 text-slate-700"
                    : "bg-blue-50/50 border-blue-200 text-slate-900 shadow-sm"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    n.type?.includes("EXAM") ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold">{n.title}</h4>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                    <span className="text-[10px] text-slate-400 block mt-2">
                      {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs rounded-xl font-semibold shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
