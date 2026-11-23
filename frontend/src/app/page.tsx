"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Briefcase, Laptop, GraduationCap, BookOpen, Sparkles,
  ArrowRight, CheckCircle2, Building2, MapPin, Calendar, Clock,
  DollarSign, Download, ShieldCheck, ChevronRight, Send, ArrowUpRight,
  ExternalLink, Layers
} from "lucide-react";
import { initialITJobs, initialUniversityQuestionPapers, initialSchoolChapters } from "@/lib/platformData";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [govtJobs, setGovtJobs] = useState<any[]>([]);
  const [itJobs] = useState<any[]>(initialITJobs.slice(0, 4));
  const [univPapers] = useState<any[]>(initialUniversityQuestionPapers.slice(0, 4));

  useEffect(() => {
    fetch("/api/jobs?limit=4")
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : (d.jobs || []);
        setGovtJobs(list);
      })
      .catch(() => {});
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  const primaryPillars = [
    {
      title: "Government Jobs",
      description: "Central, State, Railway, SSC, UPSC, Banking & Defence notifications with official PDF links.",
      href: "/jobs",
      badge: "Verified Vacancies",
      icon: Briefcase,
      color: "from-blue-600 to-indigo-700",
      accent: "text-blue-400"
    },
    {
      title: "IT & Tech Careers",
      description: "Software Engineer, Full Stack, Data Analyst & AI roles for freshers and experienced pros.",
      href: "/jobs/it",
      badge: "Top Tech Employers",
      icon: Laptop,
      color: "from-sky-600 to-blue-700",
      accent: "text-sky-400"
    },
    {
      title: "University Question Papers",
      description: "Previous semester examination question papers for Anna University, Madras, Bharathiar & more.",
      href: "/university",
      badge: "Semesters 1 - 8",
      icon: GraduationCap,
      color: "from-purple-600 to-indigo-700",
      accent: "text-purple-400"
    },
    {
      title: "School Learning & Notes",
      description: "CBSE & State Board Classes 6-12 chapter summaries, YouTube lessons, NCERT PDFs & quizzes.",
      href: "/school",
      badge: "Classes 6 to 12",
      icon: BookOpen,
      color: "from-emerald-600 to-teal-700",
      accent: "text-emerald-400"
    },
    {
      title: "AI Career Tools",
      description: "AI Job Eligibility Checker, custom career roadmaps, and automated deadline rescue trackers.",
      href: "/ai-tools",
      badge: "100% Free for Students",
      icon: Sparkles,
      color: "from-amber-600 to-orange-700",
      accent: "text-amber-400"
    }
  ];

  return (
    <div className="space-y-16 pb-20 font-sans selection:bg-blue-600 selection:text-white">
      {/* ================================================================= */}
      {/* 1. HERO SECTION & SMART GLOBAL SEARCH                             */}
      {/* ================================================================= */}
      <section className="bg-gradient-to-b from-[#081629] via-[#0f2746] to-[#081629] text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-500/10 blur-3xl pointer-events-none rounded-full"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official Government Portals • Top IT Drives • College Archives • School Education</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Everything You Need for <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-300">
              Exams, Careers & Learning
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            ExamHub India is your centralized educational technology platform. Access verified government recruitment, IT tech jobs, university semester question papers, and school learning resources.
          </p>

          {/* Unified Global Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 pt-2">
            <div className="relative w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search jobs, subjects (e.g. 12th Physics), universities, or IT companies..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 shadow-2xl transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 shrink-0"
            >
              Explore
            </button>
          </form>

          {/* Quick Search Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-400">
            <span>Trending:</span>
            {[
              { label: "UPSC CSE 2026", q: "UPSC" },
              { label: "SSC CGL", q: "SSC" },
              { label: "Zoho Careers", q: "Zoho" },
              { label: "Anna University Papers", q: "Anna University" },
              { label: "Class 10 Science", q: "Electricity Class 10" }
            ].map((t, idx) => (
              <button
                key={idx}
                onClick={() => router.push(`/search?q=${encodeURIComponent(t.q)}`)}
                className="hover:text-blue-300 underline underline-offset-4 transition-colors"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 2. FIVE PRIMARY PLATFORM PILLARS                                  */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {primaryPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Link
                key={idx}
                href={pillar.href}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {pillar.description}
                  </p>
                </div>

                <div className="flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                  <span>Enter Section</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 3. LATEST GOVERNMENT RECRUITMENT NOTIFICATIONS                   */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Latest Government Recruitment
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Central & State official notifications verified from UPSC, SSC, Railways, Banking, and Posts.
            </p>
          </div>

          <Link
            href="/jobs"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Government Jobs</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {govtJobs.map(job => (
            <div
              key={job.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {job.organization_name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {job.vacancies_count ? `${job.vacancies_count.toLocaleString()} Posts` : "Recruitment"}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                  {job.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {job.job_description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Deadline: {job.application_end_date ? new Date(job.application_end_date).toLocaleDateString("en-IN") : "Active"}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Official Source Verified
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/jobs/${job.slug || job.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all"
                  >
                    Details
                  </Link>
                  <a
                    href={job.official_application_url || "https://upsc.gov.in"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                  >
                    <span>Apply</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 4. VERIFIED IT & TECH CAREERS                                     */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Laptop className="w-6 h-6 text-sky-500" />
              <span>IT & Software Industry Openings</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Fresher hiring drives, product software roles, and remote opportunities from verified tech firms.
            </p>
          </div>

          <Link
            href="/jobs/it"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Explore All IT Jobs</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {itJobs.map(job => (
            <div
              key={job.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {job.category_display}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">{job.work_mode}</span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase">{job.company_name}</h4>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                    {job.title}
                  </h3>
                </div>

                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {job.salary_range}
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {job.job_description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">{job.experience_level}</span>
                <Link
                  href={`/jobs/it?id=${job.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                >
                  <span>View Role</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 5. COLLEGE & UNIVERSITY QUESTION PAPERS                           */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-purple-500" />
              <span>Popular University Semester Question Papers</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Download previous year examination papers for Engineering, Science, Arts & Commerce degrees.
            </p>
          </div>

          <Link
            href="/university"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Browse Full University Archive</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {univPapers.map(paper => (
            <div
              key={paper.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:border-purple-400 dark:hover:border-purple-600 transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block uppercase">
                  {paper.university_name}
                </span>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                  {paper.subject_name}
                </h3>

                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{paper.subject_code}</span>
                  <span>•</span>
                  <span>{paper.degree} Sem {paper.semester}</span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {paper.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-mono">{paper.exam_year} {paper.exam_session}</span>
                <Link
                  href={`/university?paper_id=${paper.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800 hover:bg-purple-100 flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 6. SCHOOL LEARNING BY BOARDS & CLASSES                            */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-500" />
              <span>School Education: CBSE & State Boards</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your education board to access chapter notes, YouTube lessons, and practice quizzes for Classes 6 to 12.
            </p>
          </div>

          <Link
            href="/school"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Go to School Learning Portal</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          {[
            { code: "CBSE", name: "CBSE National Board", state: "All India", href: "/school" },
            { code: "TNSB", name: "Tamil Nadu State Board", state: "Tamil Nadu", href: "/school/chapter/tn-10-sci-ch01" },
            { code: "ICSE", name: "ICSE / ISC Board", state: "National", href: "/school" },
            { code: "KSEEB", name: "Karnataka State Board", state: "Karnataka", href: "/school" },
            { code: "DHSE", name: "Kerala State Board", state: "Kerala", href: "/school" },
            { code: "BIEAP", name: "Andhra & Telangana", state: "AP / TS", href: "/school" }
          ].map((board, idx) => (
            <Link
              key={idx}
              href={board.href}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center space-y-1 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs">
                {board.code}
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 transition-colors">
                {board.name}
              </h4>
              <span className="text-[10px] text-slate-400">{board.state}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 7. 24/7 AI GUARDIAN & OFFICIAL TELEGRAM CHANNEL BANNER            */}
      {/* ================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#081629] via-[#0f2746] to-[#081629] text-white border border-blue-900/60 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 text-xs font-bold">
              <Send className="w-3.5 h-3.5" />
              <span>Official Telegram Job & Exam Broadcasts</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Get Instant Job Alerts & Exam Dates on Telegram
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Join over thousands of students receiving verified government recruitment notifications, IT drive announcements, and hall ticket releases directly on <strong>@india102210</strong>. Monitored 24/7 by AI Guardian.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href="https://t.me/india102210"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-sky-500/30 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Join @india102210 Channel</span>
            </a>

            <Link
              href="/ai-tools"
              className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-2 border border-slate-700 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Try AI Tools</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
