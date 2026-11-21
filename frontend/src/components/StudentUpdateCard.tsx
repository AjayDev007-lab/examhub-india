"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, AlertTriangle, ExternalLink, Calendar, Users, 
  Bookmark, Check, Building, Clock, ArrowUpRight, AlertCircle
} from "lucide-react";
import { DetectedUpdate } from "@/lib/dailyUpdatesData";

interface StudentUpdateCardProps {
  update: DetectedUpdate;
}

export default function StudentUpdateCard({ update }: StudentUpdateCardProps) {
  const [saved, setSaved] = useState(false);

  const toggleSave = () => {
    setSaved(!saved);
  };

  const getBadgeConfig = (badge: string) => {
    switch (badge) {
      case "OFFICIALLY_VERIFIED":
        return {
          label: "Officially Verified",
          icon: ShieldCheck,
          className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
        };
      case "THIRD_PARTY":
        return {
          label: "Employer Direct / Third-Party",
          icon: Building,
          className: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800"
        };
      case "EXPECTED_UNOFFICIAL":
        return {
          label: "Expected – Official Confirmation Pending",
          icon: Clock,
          className: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800"
        };
      default:
        return {
          label: "Awaiting Verification",
          icon: AlertCircle,
          className: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800"
        };
    }
  };

  const badgeConfig = getBadgeConfig(update.verification_badge);
  const BadgeIcon = badgeConfig.icon;

  return (
    <div className="bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Top Badges & Save Action */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badgeConfig.className} flex items-center space-x-1`}>
              <BadgeIcon className="w-3 h-3 shrink-0" />
              <span>{badgeConfig.label}</span>
            </span>

            {update.is_closing_soon && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">
                Closing Soon
              </span>
            )}
          </div>

          <button
            onClick={toggleSave}
            className={`p-2 rounded-xl transition-all ${
              saved
                ? "bg-blue-50 dark:bg-blue-950 text-[#2563EB]"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title={saved ? "Saved" : "Save Update"}
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Title & Organization */}
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#2563EB]">
            {update.title}
          </h3>
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
            <Building className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">{update.organization}</span>
            <span>•</span>
            <span>{update.state}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {update.description}
        </p>

        {/* Key Examination / Job Attributes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs">
          {update.vacancies_count ? (
            <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Vacancies: <strong>{update.vacancies_count.toLocaleString("en-IN")} Posts</strong></span>
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
              <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>Last Date: <strong>{update.important_dates.application_end}</strong></span>
            </div>
          )}

          {update.important_dates?.result_date && (
            <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Result Date: <strong>{update.important_dates.result_date}</strong></span>
            </div>
          )}

          {update.qualification && (
            <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 sm:col-span-2">
              <span>Eligibility: <strong>{update.qualification}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Action Links */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-blue-900/30 gap-3 mt-2">
        <div className="text-[11px] text-slate-400">
          Published: {new Date(update.detection_date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
        </div>

        <div className="flex items-center space-x-2">
          {update.official_notification_url && (
            <a
              href={update.official_notification_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1"
            >
              <span>Official Notice</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {update.application_url && (
            <a
              href={update.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1"
            >
              <span>Apply Online</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
