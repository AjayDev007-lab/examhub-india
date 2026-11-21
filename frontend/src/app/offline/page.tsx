"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ShieldCheck, Lock, ExternalLink } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-[#0B132B] to-[#050B1A] text-white flex flex-col justify-between p-6 sm:p-10">
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-white border border-slate-700">
            <ShieldCheck className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-lg tracking-tight text-white">EXAMHUB</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-black bg-slate-700 text-slate-300 tracking-wider">
                INDIA
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">National Examination & Student Portal</p>
          </div>
        </div>

        <Link
          href="/admin/login"
          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all"
        >
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Administrative Console</span>
        </Link>
      </header>

      <main className="max-w-xl mx-auto w-full text-center space-y-6 my-auto py-12">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-2xl">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
          <span>PORTAL TEMPORARILY OFFLINE</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Service Temporarily Unavailable
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
          ExamHub India has been temporarily taken offline for critical administrative maintenance. All student databases and application records are securely isolated. Public access will be restored once operational validation concludes.
        </p>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs text-slate-400 space-y-1">
          <div>Status: <strong>Offline by Super Administrator</strong></div>
          <div>All official government portals remain accessible directly on their respective .gov.in domains.</div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto w-full pt-8 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500">
        <div>ExamHub India • Protected Public Education Platform</div>
        <div>Inquiries: support@examhub.gov.in</div>
      </footer>
    </div>
  );
}
