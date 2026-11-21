"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Wrench, ShieldCheck, Clock, ExternalLink, Mail, Instagram, Lock } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function MaintenancePage() {
  const [status, setStatus] = useState<any>({
    mode: "MAINTENANCE",
    maintenance_message: "ExamHub India is currently undergoing scheduled platform upgrades to serve you better. All student records and applications are secure and will be available once maintenance completes.",
    estimated_return_time: "Tonight by 23:30 IST"
  });

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetchApi("/api/status");
        if (res) setStatus(res);
      } catch (_) {}
    }
    loadStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#102D59] via-[#0D2344] to-[#0A1A33] text-white flex flex-col justify-between p-6 sm:p-10">
      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <ShieldCheck className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-lg tracking-tight text-white">EXAMHUB</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-black bg-blue-500 text-white tracking-wider">
                INDIA
              </span>
            </div>
            <p className="text-[10px] text-blue-200/70 font-medium">National Examination & Student Portal</p>
          </div>
        </div>

        <Link
          href="/admin/login"
          className="text-xs text-blue-300 hover:text-white flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
        >
          <Lock className="w-3.5 h-3.5 text-blue-400" />
          <span>Admin Access</span>
        </Link>
      </header>

      {/* Main Maintenance Notice */}
      <main className="max-w-2xl mx-auto w-full text-center space-y-6 my-auto py-12">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center shadow-2xl backdrop-blur-md">
          <Wrench className="w-10 h-10 text-blue-400 animate-pulse" />
        </div>

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" />
          <span>SCHEDULED PLATFORM MAINTENANCE IN PROGRESS</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          We&apos;ll Be Back Online Shortly
        </h1>

        <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-xl mx-auto">
          {status.maintenance_message}
        </p>

        {status.estimated_return_time && (
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl max-w-md mx-auto backdrop-blur-sm">
            <div className="text-xs text-blue-300 font-medium">Estimated Platform Return:</div>
            <div className="text-lg font-black text-white mt-1">{status.estimated_return_time}</div>
          </div>
        )}

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-blue-200/80">
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>All student applications & credentials safely preserved</span>
          </span>
        </div>
      </main>

      {/* Footer Support Info */}
      <footer className="max-w-6xl mx-auto w-full pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-300/70">
        <div>
          Official Inquiries: <a href="mailto:support@examhub.gov.in" className="text-white hover:underline">support@examhub.gov.in</a>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://www.instagram.com/the_smiley_hacker_5933z/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-white flex items-center space-x-1"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>@the_smiley_hacker_5933z</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
