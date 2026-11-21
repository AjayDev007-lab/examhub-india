"use client";

import React from "react";
import { 
  ShieldCheck, AlertTriangle, ExternalLink, Calendar, Users, 
  CheckCircle2, XCircle, ArrowUpRight, Clock, Building
} from "lucide-react";
import { DetectedUpdate } from "@/lib/dailyUpdatesData";

interface AdminUpdateCardProps {
  update: DetectedUpdate;
  onVerify?: (action: "APPROVE" | "PUBLISH" | "REJECT" | "ARCHIVE") => void;
}

export default function AdminUpdateCard({ update, onVerify }: AdminUpdateCardProps) {
  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case "OFFICIALLY_VERIFIED":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "THIRD_PARTY":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "EXPECTED_UNOFFICIAL":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      default:
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "APPROVED":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "PENDING_VERIFICATION":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "REJECTED":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  return (
    <div className="bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 p-5 shadow-sm hover:shadow-md transition-all space-y-4">
      {/* Header Tags */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getBadgeStyle(update.verification_badge)} flex items-center space-x-1`}>
            <ShieldCheck className="w-3 h-3" />
            <span>{update.verification_badge.replace(/_/g, " ")}</span>
          </span>

          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(update.verification_status)}`}>
            {update.verification_status.replace(/_/g, " ")}
          </span>

          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {update.category}
          </span>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>Detected: {new Date(update.detection_date).toLocaleDateString("en-IN")}</span>
        </div>
      </div>

      {/* Title & Org */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
          {update.title}
        </h3>
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
          <Building className="w-3.5 h-3.5 text-blue-500" />
          <span>{update.organization}</span>
          <span>•</span>
          <span>{update.state}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        {update.description}
      </p>

      {/* Important Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs">
        {update.vacancies_count ? (
          <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
            <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Vacancies: <strong>{update.vacancies_count.toLocaleString("en-IN")}</strong></span>
          </div>
        ) : null}

        {update.important_dates?.exam_date && (
          <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span>Exam Date: <strong>{update.important_dates.exam_date}</strong></span>
          </div>
        )}

        {update.important_dates?.application_end && (
          <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span>Last Date: <strong>{update.important_dates.application_end}</strong></span>
          </div>
        )}

        {update.important_dates?.result_date && (
          <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Result: <strong>{update.important_dates.result_date}</strong></span>
          </div>
        )}

        {update.qualification && (
          <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 sm:col-span-2">
            <span>Qual: <strong>{update.qualification}</strong></span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-blue-900/30">
        <div className="flex items-center space-x-2">
          {update.official_notification_url && (
            <a
              href={update.official_notification_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>View Official Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {update.application_url && (
            <>
              <span className="text-slate-300">•</span>
              <a
                href={update.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:underline flex items-center space-x-1"
              >
                <span>Apply Portal</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </>
          )}
        </div>

        {onVerify && (
          <div className="flex items-center space-x-2">
            {update.verification_status !== "PUBLISHED" && (
              <button
                onClick={() => onVerify("PUBLISH")}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Publish</span>
              </button>
            )}
            {update.verification_status !== "REJECTED" && (
              <button
                onClick={() => onVerify("REJECT")}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-300 hover:text-red-600 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
