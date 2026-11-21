"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Clock, Calendar, Award, AlertCircle, ShieldCheck, ChevronRight, 
  ExternalLink, Sparkles, Filter, Bell, Check, ArrowRight, BookOpen
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function StudentCountdownCentralPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");
  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  useEffect(() => {
    loadCountdowns();
    const timer = setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  async function loadCountdowns() {
    setLoading(true);
    try {
      const [resExams, resResults] = await Promise.all([
        fetchApi("/api/countdowns/exams"),
        fetchApi("/api/countdowns/results"),
      ]);

      const examEvents = resExams.countdowns || [];
      const resultEvents = resResults.countdowns || [];
      setEvents([...examEvents, ...resultEvents]);
    } catch (err) {
      console.error("Failed to load countdowns:", err);
    } finally {
      setLoading(false);
    }
  }

  const getTimeRemaining = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime();
    const diff = target - currentTime;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds, isPassed: false };
  };

  const filteredEvents = events.filter((ev) => {
    if (filterType === "ALL") return true;
    if (filterType === "EXAM") return ev.event_type === "EXAM_DATE";
    if (filterType === "RESULT") return ev.event_type === "RESULT_ANNOUNCEMENT";
    if (filterType === "DEADLINE") return ev.event_type === "APPLICATION_DEADLINE";
    return true;
  });

  const handleAddToGoogleCalendar = (ev: any) => {
    const title = encodeURIComponent(ev.title);
    const details = encodeURIComponent(`Authority: ${ev.authority_code}\nVerified source: ${ev.official_source}\nOfficial URL: ${ev.official_portal_url}`);
    const dateFormatted = new Date(ev.target_date).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateFormatted}/${dateFormatted}&details=${details}&location=India`;
    window.open(gCalUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* 1. HERO HEADER */}
      <section className="bg-gradient-to-b from-[#102D59] via-[#0D2344] to-[#0A1A33] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-300">
            <Link href="/dashboard" className="hover:text-white transition-colors">Student Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
            <span className="text-white">Countdown Central</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 mb-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Real-Time Examination & Result Clocks</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                All-India Countdown Hub
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-blue-100/90 max-w-xl">
                Ticking second-by-second countdown timers for competitive exams, commission deadlines, and verified result releases across India.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                href="/student/upcoming-exams"
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-colors"
              >
                Upcoming Exams
              </Link>
              <Link
                href="/student/upcoming-results"
                className="px-3.5 py-2 bg-[#2563EB] hover:bg-blue-600 rounded-xl text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all"
              >
                Upcoming Results
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN COUNTDOWNS GRID */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm w-fit">
          {[
            { id: "ALL", label: "All Clocks" },
            { id: "EXAM", label: "Upcoming Exams" },
            { id: "RESULT", label: "Result Announcements" },
            { id: "DEADLINE", label: "Application Deadlines" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterType === tab.id
                  ? "bg-[#102D59] dark:bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Synchronizing real-time official countdown clocks...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
            <Clock className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Countdown Events Found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto">
              No active countdowns matching this category. Check back soon as commissions publish new exam gazettes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => {
              const remaining = getTimeRemaining(ev.target_date);
              const isResult = ev.event_type === "RESULT_ANNOUNCEMENT";
              const isDeadline = ev.event_type === "APPLICATION_DEADLINE";

              return (
                <div
                  key={ev.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-200/60 dark:border-blue-800">
                        {ev.authority_code}
                      </span>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          ev.verification_status === "CONFIRMED_OFFICIAL" || ev.verification_status === "VERIFIED"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                        }`}
                      >
                        {ev.verification_status === "CONFIRMED_OFFICIAL" || ev.verification_status === "VERIFIED"
                          ? "Official Confirmed"
                          : "Tentative Expected"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#102D59] dark:text-white leading-snug">
                        {ev.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                        Source: {ev.official_source}
                      </p>
                    </div>

                    {/* COUNTDOWN TIMER BOX */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-[#102D59] text-white">
                      {remaining.isPassed ? (
                        <div className="text-center py-2">
                          <span className="text-sm font-bold text-emerald-400 block">Event Date Reached</span>
                          <span className="text-xs text-slate-300">Check official portal for updates</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                            <span className="text-2xl font-black block font-mono">{remaining.days}</span>
                            <span className="text-[10px] text-blue-200 font-medium block uppercase tracking-wider">Days</span>
                          </div>
                          <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                            <span className="text-2xl font-black block font-mono">{String(remaining.hours).padStart(2, "0")}</span>
                            <span className="text-[10px] text-blue-200 font-medium block uppercase tracking-wider">Hours</span>
                          </div>
                          <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                            <span className="text-2xl font-black block font-mono">{String(remaining.minutes).padStart(2, "0")}</span>
                            <span className="text-[10px] text-blue-200 font-medium block uppercase tracking-wider">Mins</span>
                          </div>
                          <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                            <span className="text-2xl font-black block font-mono text-amber-300">{String(remaining.seconds).padStart(2, "0")}</span>
                            <span className="text-[10px] text-amber-200 font-medium block uppercase tracking-wider">Secs</span>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-200">
                        <span>Target:</span>
                        <span className="font-semibold text-white">
                          {new Date(ev.target_date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleAddToGoogleCalendar(ev)}
                      className="text-xs font-semibold px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors flex items-center space-x-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Add to Calendar</span>
                    </button>

                    <a
                      href={ev.official_portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold px-3.5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
                    >
                      <span>Official Notice</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
