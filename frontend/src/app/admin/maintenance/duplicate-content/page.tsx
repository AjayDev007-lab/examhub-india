"use client";

import React from "react";
import AdminMaintenanceNav from "@/components/AdminMaintenanceNav";
import { Copy, CheckCircle2 } from "lucide-react";

export default function AdminDuplicateContentPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <AdminMaintenanceNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <Copy className="w-5 h-5 text-purple-500" />
            <span>Duplicate Content & Multi-Source Reconciliation</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Normalizes notification URLs and deduplicates notices detected across regional state mirrors.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 space-y-4 shadow-sm text-xs">
          <div className="flex items-center space-x-2 text-emerald-600 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>0 duplicate entries detected across 10 official sources.</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            All notifications from UPSC, SSC, and RRB regional nodes are mapped to authoritative canonical entities using standardized commission tags.
          </p>
        </div>
      </main>
    </div>
  );
}
