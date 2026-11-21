"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Radio, Briefcase, GraduationCap, Award, BookOpen, 
  FileCheck2, Layers, Sparkles
} from "lucide-react";

export default function StudentUpdatesNav() {
  const pathname = usePathname();

  const tabs = [
    { label: "Today's Highlights", href: "/updates", icon: Sparkles },
    { label: "All Latest", href: "/updates/latest", icon: Radio },
    { label: "Job Vacancies", href: "/updates/jobs", icon: Briefcase },
    { label: "Examinations", href: "/updates/exams", icon: GraduationCap },
    { label: "Exam Results", href: "/updates/results", icon: Award },
    { label: "School Results (10-12)", href: "/updates/school-results", icon: BookOpen },
    { label: "Admit Cards", href: "/updates/admit-cards", icon: FileCheck2 },
    { label: "Scholarships", href: "/updates/scholarships", icon: Layers },
    { label: "Admissions", href: "/updates/admissions", icon: GraduationCap },
  ];

  return (
    <div className="bg-white dark:bg-[#102D59]/30 border-b border-slate-200 dark:border-blue-900/40 sticky top-0 z-20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-3 text-xs font-semibold">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
