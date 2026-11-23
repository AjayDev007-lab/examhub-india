"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { initialITJobs, initialUniversityQuestionPapers } from "@/lib/platformData";
import { initialJobs } from "@/lib/data";
import {
  Award,
  FileText,
  CreditCard,
  FolderArchive,
  Calendar,
  Bell,
  User,
  HelpCircle,
  Settings,
  Building2,
  Download,
  Eye,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Plus,
  Send,
  Sparkles,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Clock,
  Bookmark,
  ExternalLink,
  ChevronRight,
  Zap,
  CheckCircle,
  Search,
  Filter,
  BookOpen,
  MessageCircle,
  Laptop,
  FileCheck2,
  TrendingUp,
  PlayCircle,
  Check,
  Share2
} from "lucide-react";
import { fetchApi, getFileUrl } from "@/lib/api";
import { isFirebaseConfigured, auth, onAuthStateChanged, db, doc, getDoc } from "@/lib/firebase";
import StudentSidebar from "@/components/StudentSidebar";
import StudentHeader from "@/components/StudentHeader";

export default function StudentDashboardPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 font-medium">Loading Student Dashboard...</div>}>
      <StudentDashboardContent />
    </React.Suspense>
  );
}

function StudentDashboardContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams?.get("tab");
  const [activeTab, setActiveTab] = useState("overview");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Saved items states
  const [savedGovtJobs, setSavedGovtJobs] = useState<any[]>([]);
  const [savedITJobs, setSavedITJobs] = useState<any[]>([]);
  const [savedUnivPapers, setSavedUnivPapers] = useState<any[]>([]);

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    try {
      const itSavedIds: number[] = JSON.parse(localStorage.getItem("examhub_saved_it_jobs") || "[]");
      setSavedITJobs(initialITJobs.filter(j => itSavedIds.includes(j.id)));

      const univSavedIds: number[] = JSON.parse(localStorage.getItem("examhub_saved_university_papers") || "[]");
      setSavedUnivPapers(initialUniversityQuestionPapers.filter(p => univSavedIds.includes(p.id)));

      const govtSavedIds: number[] = JSON.parse(localStorage.getItem("examhub_saved_jobs") || "[]");
      setSavedGovtJobs(initialJobs.filter((j: any) => govtSavedIds.includes(j.id)));
    } catch (_) {}
  }, [activeTab]);

  const [savedFilter, setSavedFilter] = useState<"ALL" | "GOVT" | "IT" | "UNIV">("ALL");

  const removeSavedGovtJob = (id: number) => {
    const updated = savedGovtJobs.filter((j) => j.id !== id);
    setSavedGovtJobs(updated);
    try {
      localStorage.setItem("examhub_saved_jobs", JSON.stringify(updated.map((j) => j.id)));
    } catch (_) {}
  };

  const removeSavedITJob = (id: number) => {
    const updated = savedITJobs.filter((j) => j.id !== id);
    setSavedITJobs(updated);
    try {
      localStorage.setItem("examhub_saved_it_jobs", JSON.stringify(updated.map((j) => j.id)));
    } catch (_) {}
  };

  const removeSavedUnivPaper = (id: number) => {
    const updated = savedUnivPapers.filter((p) => p.id !== id);
    setSavedUnivPapers(updated);
    try {
      localStorage.setItem("examhub_saved_university_papers", JSON.stringify(updated.map((p) => p.id)));
    } catch (_) {}
  };

  // Data states
  const [documents, setDocuments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [registeredExams, setRegisteredExams] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobPrefs, setJobPrefs] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Support ticket form
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("RESULT_ISSUE");
  const [ticketMsg, setTicketMsg] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("examhub_user");
    if (!userStr && !isFirebaseConfigured) {
      window.location.href = "/auth/login";
      return;
    }
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (_) {}
    }

    // Live Firebase Auth sync
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser && !localStorage.getItem("examhub_token")) {
          window.location.href = "/auth/login";
          return;
        }
        if (firebaseUser) {
          let updatedUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            full_name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Student",
            role: "student"
          };
          if (db) {
            try {
              const snap = await getDoc(doc(db, "students", firebaseUser.uid));
              if (snap.exists()) {
                const data = snap.data();
                updatedUser = {
                  uid: firebaseUser.uid,
                  email: data.email || firebaseUser.email,
                  full_name: data.fullName || firebaseUser.displayName || "Student",
                  role: data.role || "student"
                };
              }
            } catch (_) {}
          }
          setCurrentUser(updatedUser);
          localStorage.setItem("examhub_user", JSON.stringify(updatedUser));
        }
      });
      loadDashboardData();
      return () => unsubscribe();
    }

    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [
        docs,
        notifs,
        tickets,
        exList,
        regExamsRes,
        calEventsRes,
        jobsRes,
        prefsRes
      ] = await Promise.all([
        fetchApi("/api/documents").catch(() => []),
        fetchApi("/api/notifications").catch(() => []),
        fetchApi("/api/support").catch(() => []),
        fetchApi("/api/exams?limit=8").catch(() => []),
        fetchApi("/api/student/exams").catch(() => ({ registered_exams: [] })),
        fetchApi("/api/student/calendar/events").catch(() => ({ events: [] })),
        fetchApi("/api/jobs?limit=4").catch(() => ({ jobs: [] })),
        fetchApi("/api/student/job-preferences").catch(() => null)
      ]);

      setDocuments(docs || []);
      setNotifications(notifs || []);
      setSupportTickets(tickets || []);
      setExams(exList || []);
      setRegisteredExams(regExamsRes?.registered_exams || []);
      setCalendarEvents(calEventsRes?.events || []);
      setJobs(jobsRes?.jobs || []);
      setJobPrefs(prefsRes || null);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteDoc = async (id: number) => {
    if (!confirm("Are you sure you want to remove this document from your vault?")) return;
    try {
      await fetchApi(`/api/documents/${id}`, { method: "DELETE" });
      setDocuments(documents.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete document");
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi("/api/support", {
        method: "POST",
        body: JSON.stringify({
          subject: ticketSubject.trim(),
          category: ticketCategory,
          message: ticketMsg.trim(),
          priority: "MEDIUM"
        })
      });
      setSupportTickets([res, ...supportTickets]);
      setTicketSubject("");
      setTicketMsg("");
      setTicketSuccess(true);
      setTimeout(() => setTicketSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to submit ticket");
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-[#F5F8FE] dark:bg-[#0B132B] text-[#14213D] dark:text-slate-100 flex transition-colors">
      {/* 1. COMPACT SIDEBAR */}
      <StudentSidebar />

      {/* Main Column (offset for 64 = 16rem on desktop) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* 2. TOP NAVIGATION HEADER */}
        <StudentHeader pageTitle="Student Control Hub" unreadCount={unreadCount} />

        {/* Dashboard Body Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* SECTION TABS FOR SUB-PAGES */}
          <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === "overview"
                  ? "bg-[#102D59] text-white shadow-md dark:bg-blue-600"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Academic Overview
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 ${
                activeTab === "saved"
                  ? "bg-[#102D59] text-white shadow-md dark:bg-blue-600"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              <span>Saved Items ({savedGovtJobs.length + savedITJobs.length + savedUnivPapers.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("reminders")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 ${
                activeTab === "reminders"
                  ? "bg-[#102D59] text-white shadow-md dark:bg-blue-600"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span>Deadlines & Reminders</span>
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 ${
                activeTab === "applications"
                  ? "bg-[#102D59] text-white shadow-md dark:bg-blue-600"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-purple-500" />
              <span>My Applications</span>
            </button>
            <button
              onClick={() => setActiveTab("learning")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 ${
                activeTab === "learning"
                  ? "bg-[#102D59] text-white shadow-md dark:bg-blue-600"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Learning Progress</span>
            </button>
            <button
              onClick={() => setActiveTab("vault")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 ${
                activeTab === "vault"
                  ? "bg-[#102D59] text-white shadow-md dark:bg-blue-600"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Document Vault ({documents.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("support")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 ${
                activeTab === "support"
                  ? "bg-[#102D59] text-white shadow-md dark:bg-blue-600"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Help & Support ({supportTickets.length})</span>
            </button>
            <Link
              href="/student/my-exams"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0 flex items-center space-x-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>My Exams Planner →</span>
            </Link>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Compact Greeting Banner */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Welcome back{currentUser?.full_name ? `, ${currentUser.full_name.split(" ")[0]}` : ""}!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Stay updated with your examinations and opportunities.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/student/my-exams"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    My Exams
                  </Link>
                  <Link
                    href="/jobs"
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all"
                  >
                    Explore Jobs
                  </Link>
                </div>
              </div>

              {/* Telegram Verified Student Broadcast Channel Banner */}
              <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-sky-900/40 border border-sky-800/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-sky-600/30">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Official Telegram Channel</span>
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-bold">@india102210</span>
                    </h3>
                    <p className="text-xs text-sky-200/80 mt-0.5">
                      Get real-time alerts for admit card releases, verified recruitment circulars, and exam result announcements.
                    </p>
                  </div>
                </div>
                <a
                  href="https://t.me/india102210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shrink-0"
                >
                  <span>Join Channel</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Three Dashboard Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* 1. Next Exam */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Next Exam
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                    </div>

                    {registeredExams.length > 0 ? (
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                          {registeredExams[0]?.examination?.name || "Registered Exam"}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {registeredExams[0]?.examination?.code || "Exam Schedule Active"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          No exams yet
                        </h3>
                        <p className="text-xs text-slate-500">
                          Add your upcoming examination to stay organised.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href="/student/my-exams"
                      className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
                    >
                      <span>{registeredExams.length > 0 ? "View Details" : "Add an Exam"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* 2. Pending Applications */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Pending Applications
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {registeredExams.length > 0 ? `${registeredExams.length} Active` : "No pending applications"}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {registeredExams.length > 0
                          ? "Your ongoing application filings"
                          : "Explore current examination and job opportunities."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href={registeredExams.length > 0 ? "/student/my-applications" : "/jobs"}
                      className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
                    >
                      <span>{registeredExams.length > 0 ? "Continue Application" : "Explore Opportunities"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* 3. Latest Result / Documents */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Latest Result
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                    </div>

                    {documents.length > 0 ? (
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                          {documents[0]?.title || "Saved Scorecard"}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {documents[0]?.created_at ? new Date(documents[0].created_at).toLocaleDateString() : "Verified Marksheet"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          No saved documents
                        </h3>
                        <p className="text-xs text-slate-500">
                          Upload your important examination documents.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href={documents.length > 0 ? "/results" : "/dashboard?tab=vault"}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
                    >
                      <span>{documents.length > 0 ? "View Result" : "Add Document"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </div>

              {/* 5. QUICK ACCESS SHORTCUTS (Requirement 9) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Quick Access Shortcuts
                  </h3>
                  <span className="text-xs text-slate-400">1-Click Direct Services</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <Link
                    href="/results"
                    className="p-4 rounded-2xl bg-white dark:bg-[#101E3D] border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm hover:shadow-md transition-all text-center space-y-2 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#2563EB] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">Check Results</span>
                  </Link>

                  <Link
                    href="/student/job-alerts"
                    className="p-4 rounded-2xl bg-white dark:bg-[#101E3D] border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm hover:shadow-md transition-all text-center space-y-2 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#16A34A] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">Job Alerts</span>
                  </Link>

                  <Link
                    href="/hall-tickets"
                    className="p-4 rounded-2xl bg-white dark:bg-[#101E3D] border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm hover:shadow-md transition-all text-center space-y-2 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-[#F59E0B] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">Hall Tickets</span>
                  </Link>

                  <Link
                    href="/assistant"
                    className="p-4 rounded-2xl bg-white dark:bg-[#101E3D] border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm hover:shadow-md transition-all text-center space-y-2 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">AI Assistant</span>
                  </Link>

                  <Link
                    href="/student/calendar"
                    className="p-4 rounded-2xl bg-white dark:bg-[#101E3D] border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm hover:shadow-md transition-all text-center space-y-2 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">My Calendar</span>
                  </Link>

                  <Link
                    href="/official-websites"
                    className="p-4 rounded-2xl bg-white dark:bg-[#101E3D] border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm hover:shadow-md transition-all text-center space-y-2 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">Gov Directory</span>
                  </Link>
                </div>
              </div>

              {/* TWO-COLUMN GRID: PROGRESS & UPCOMING CALENDAR */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 7. PROGRESS & COMPLETION CARD (Requirement 7) */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#101E3D] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-[#14213D] dark:text-white">Profile Readiness</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      85% COMPLETE
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#2563EB] to-emerald-500 rounded-full w-[85%]" />
                    </div>
                    <span className="text-[10px] text-slate-400 block text-right font-medium">
                      5 of 6 verification milestones finished
                    </span>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-200">
                      <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                      <span>Personal Registration Details</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-200">
                      <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                      <span>Degree & Educational Department</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-200">
                      <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                      <span>Career Skills & Target Roles</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-200">
                      <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                      <span>Personal Document Vault</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-400">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 shrink-0" />
                      <span>Identity Card Verification Upload</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/student/settings"
                      className="block text-center w-full py-2.5 bg-[#EAF3FF] dark:bg-blue-950/80 text-[#2563EB] dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 font-bold rounded-xl text-xs transition-colors"
                    >
                      Complete Profile & Preferences →
                    </Link>
                  </div>
                </div>

                {/* 5. EXAMINATION CALENDAR PREVIEW (Requirement 5) */}
                <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#101E3D] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-[#14213D] dark:text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#2563EB]" />
                        <span>Examination Milestones & Schedule</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Color-coded schedule: Admit cards, application ends, exam days
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <a
                        href="/api/student/calendar/export"
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-[11px] font-semibold flex items-center space-x-1"
                        title="Download RFC 5545 calendar file for Google Calendar, Apple, Outlook"
                      >
                        <Download className="w-3 h-3" />
                        <span>Export .ICS</span>
                      </a>
                      <Link
                        href="/student/calendar"
                        className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white hover:bg-blue-600 text-[11px] font-bold"
                      >
                        Full Calendar View
                      </Link>
                    </div>
                  </div>

                  {/* Calendar Legend */}
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold">
                    <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                      <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                      Exam Day
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                      Application Deadline
                    </span>
                    <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                      <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                      Admit Card
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                      Result Announcement
                    </span>
                  </div>

                  {/* Milestone Events List */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {calendarEvents.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">
                        No upcoming calendar events. Add exams in "My Exams" to auto-populate milestones.
                      </p>
                    ) : (
                      calendarEvents.slice(0, 4).map((ev) => (
                        <div key={ev.id} className="py-3 flex items-center justify-between gap-4">
                          <div className="flex items-center space-x-3 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                                ev.event_type === "EXAM_DATE"
                                  ? "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300"
                                  : ev.event_type === "APPLICATION_END"
                                  ? "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300"
                                  : ev.event_type === "ADMIT_CARD"
                                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300"
                                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300"
                              }`}
                            >
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">{ev.title}</h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {ev.notes || "Official milestone from national recruitment authority."}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                              {new Date(ev.event_date).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                              })}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                              {ev.event_type.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* 6. VERIFIED JOB VACANCIES SECTION (Requirement 6) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#14213D] dark:text-white">
                      Verified Career Vacancies & Recruitment Drives
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Cross-referenced against official gazettes & authentic government board notices
                    </p>
                  </div>
                  <Link
                    href="/jobs"
                    className="text-xs font-bold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center space-x-1"
                  >
                    <span>See All 250+ Jobs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {jobs.slice(0, 4).map((job) => (
                    <div
                      key={job.id}
                      className="p-5 rounded-3xl bg-white dark:bg-[#101E3D] border border-slate-200/80 dark:border-slate-800 shadow-sm card-hover-lift flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              job.sector === "CENTRAL_GOVT"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                : job.sector === "PSU"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            }`}
                          >
                            {job.sector.replace(/_/g, " ")}
                          </span>
                          <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Verified Source</span>
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-[#14213D] dark:text-white line-clamp-2 leading-snug">
                          {job.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                          {job.organization_name}
                        </p>

                        <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Scale:</span>
                            <span className="font-bold text-[#14213D] dark:text-white truncate max-w-[150px]">
                              {job.salary_range}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Degree:</span>
                            <span className="truncate max-w-[150px] font-medium">{job.qualification}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Deadline:</span>
                            <span className="font-mono text-red-600 dark:text-red-400 font-bold">
                              {job.application_end_date
                                ? new Date(job.application_end_date).toLocaleDateString("en-IN")
                                : "Rolling"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2">
                        <Link
                          href={`/jobs/${job.slug}`}
                          className="flex-1 py-2 text-center rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs transition-colors"
                        >
                          View Details
                        </Link>
                        <a
                          href={job.official_application_url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Apply on Official Portal"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 8. NOTIFICATION CENTRE WIDGET (Requirement 8) */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#101E3D] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-[#2563EB]" />
                    <h3 className="text-sm font-bold text-[#14213D] dark:text-white">
                      Official Gazette & Exam Alerts Centre
                    </h3>
                  </div>
                  <Link
                    href="/student/notifications"
                    className="text-xs text-[#2563EB] dark:text-blue-400 font-bold hover:underline"
                  >
                    View All Notices →
                  </Link>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No unread notifications at this time.</p>
                  ) : (
                    notifications.slice(0, 4).map((n) => (
                      <div key={n.id} className="py-3 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0" />
                            <h4 className="font-bold text-xs text-[#14213D] dark:text-white">{n.title}</h4>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 uppercase">
                              {n.notification_type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 pl-4">{n.message}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium">
                          {new Date(n.created_at).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VAULT SUB-PAGE (Preserved 100%) */}
          {activeTab === "vault" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-[#14213D] dark:text-white">Personal Document Vault</h2>
                  <p className="text-xs text-slate-500">
                    Encrypted storage compliant with DPDP standards for marksheets and hall tickets
                  </p>
                </div>
                <Link
                  href="/id-cards"
                  className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl hover:bg-blue-600 flex items-center space-x-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Document</span>
                </Link>
              </div>

              {documents.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-[#101E3D] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <FolderArchive className="w-10 h-10 mx-auto text-slate-400" />
                  <p className="text-xs text-slate-500">Your vault is currently empty. Check a result or download an admit card to archive it here automatically.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-5 rounded-3xl bg-white dark:bg-[#101E3D] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase">
                          {doc.document_type_code.replace(/_/g, " ")}
                        </span>
                        <h4 className="font-bold text-sm text-[#14213D] dark:text-white mt-2">{doc.title}</h4>
                        <p className="text-[11px] text-slate-400">
                          {doc.original_filename} • {(doc.file_size / 1024).toFixed(1)} KB
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <a
                          href={getFileUrl(doc.download_url)}
                          className="px-3 py-1.5 bg-[#EAF3FF] dark:bg-blue-950 text-[#2563EB] dark:text-blue-300 rounded-lg text-xs font-bold flex items-center space-x-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Marksheet</span>
                        </a>
                        <button
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUPPORT TICKETS SUB-PAGE (Preserved 100%) */}
          {activeTab === "support" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#14213D] dark:text-white">Student Support & Inquiry Desk</h2>
                <p className="text-xs text-slate-500">Submit requests regarding marksheet sync, hall ticket downloads, or exam portals</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-[#101E3D] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-[#14213D] dark:text-white">Create New Inquiry</h3>
                  {ticketSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Ticket submitted. Our grievance officer will review within 24 hours.</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateTicket} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Subject</label>
                      <input
                        type="text"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        required
                        placeholder="e.g. Issue retrieving NEET scorecard"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Category</label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium"
                      >
                        <option value="RESULT_ISSUE">Result Retrieval Issue</option>
                        <option value="HALL_TICKET_ISSUE">Hall Ticket Download Issue</option>
                        <option value="ID_CARD_ISSUE">Student ID Card Issue</option>
                        <option value="OTHER">Other Assistance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Message</label>
                      <textarea
                        rows={4}
                        value={ticketMsg}
                        onChange={(e) => setTicketMsg(e.target.value)}
                        required
                        placeholder="Include exam roll number, registration number and institution name..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center space-x-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Official Ticket</span>
                    </button>
                  </form>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-[#101E3D] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-[#14213D] dark:text-white">Recent Ticket History</h3>
                  {supportTickets.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No support tickets found.</p>
                  ) : (
                    <div className="space-y-3">
                      {supportTickets.map((t) => (
                        <div
                          key={t.id}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#14213D] dark:text-white">#{t.id} - {t.subject}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                t.status === "RESOLVED"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950"
                              }`}
                            >
                              {t.status}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px]">{t.message}</p>
                          {t.admin_response && (
                            <div className="mt-2 p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-200 text-[11px]">
                              <strong>Official Response:</strong> {t.admin_response}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: SAVED ITEMS */}
          {activeTab === "saved" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#14213D] dark:text-white flex items-center space-x-2">
                    <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span>My Bookmarks & Saved Items</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Access your bookmarked Government recruitment notices, Tech jobs, and University question papers.
                  </p>
                </div>
                <div className="flex items-center space-x-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setSavedFilter("ALL")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      savedFilter === "ALL" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    All ({savedGovtJobs.length + savedITJobs.length + savedUnivPapers.length})
                  </button>
                  <button
                    onClick={() => setSavedFilter("GOVT")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      savedFilter === "GOVT" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Govt ({savedGovtJobs.length})
                  </button>
                  <button
                    onClick={() => setSavedFilter("IT")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      savedFilter === "IT" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    IT Jobs ({savedITJobs.length})
                  </button>
                  <button
                    onClick={() => setSavedFilter("UNIV")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      savedFilter === "UNIV" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Papers ({savedUnivPapers.length})
                  </button>
                </div>
              </div>

              {/* Saved Govt Jobs */}
              {(savedFilter === "ALL" || savedFilter === "GOVT") && savedGovtJobs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    <span>Saved Government Recruitments ({savedGovtJobs.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedGovtJobs.map((j) => (
                      <div
                        key={j.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600">
                              {j.category || "Govt Job"}
                            </span>
                            <button
                              onClick={() => removeSavedGovtJob(j.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-1"
                              title="Remove bookmark"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">{j.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5 font-medium">{j.department || j.organization}</p>
                          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                            {j.total_vacancies && (
                              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-semibold">
                                {j.total_vacancies} Vacancies
                              </span>
                            )}
                            {j.last_date && (
                              <span className="bg-red-50 dark:bg-red-950/40 text-red-600 px-2 py-0.5 rounded-md font-semibold">
                                Last Date: {j.last_date}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <Link
                            href={`/jobs/${j.id}`}
                            className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1"
                          >
                            <span>Full Notification</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                          {j.official_link && (
                            <a
                              href={j.official_link}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1 bg-[#2563EB] text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 flex items-center space-x-1"
                            >
                              <span>Apply Online</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved IT Jobs */}
              {(savedFilter === "ALL" || savedFilter === "IT") && savedITJobs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Saved IT & Tech Roles ({savedITJobs.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedITJobs.map((job) => (
                      <div
                        key={job.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                              {job.role} • {job.workMode}
                            </span>
                            <button
                              onClick={() => removeSavedITJob(job.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-1"
                              title="Remove bookmark"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">{job.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5 font-medium">{job.company} — {job.location}</p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {job.skills?.slice(0, 4).map((skill: string) => (
                              <span
                                key={skill}
                                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs font-bold text-emerald-600 mt-2">{job.salary}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <Link
                            href="/jobs/it"
                            className="text-xs font-bold text-indigo-600 hover:underline flex items-center space-x-1"
                          >
                            <span>Browse Tech Jobs</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 bg-indigo-600 text-white text-[11px] font-bold rounded-lg hover:bg-indigo-700 flex items-center space-x-1"
                          >
                            <span>Apply on Careers</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved University Papers */}
              {(savedFilter === "ALL" || savedFilter === "UNIV") && savedUnivPapers.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    <span>Saved University Question Papers ({savedUnivPapers.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedUnivPapers.map((paper) => (
                      <div
                        key={paper.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600">
                              {paper.degree} • Semester {paper.semester} ({paper.year})
                            </span>
                            <button
                              onClick={() => removeSavedUnivPaper(paper.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-1"
                              title="Remove bookmark"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">{paper.subject}</h4>
                          <p className="text-xs text-slate-500 mt-0.5 font-medium">{paper.universityName} — Code: {paper.subjectCode}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <Link
                            href="/university"
                            className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1"
                          >
                            <span>Browse Question Papers</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                          <a
                            href={paper.downloadUrl}
                            download
                            className="px-3 py-1 bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-bold rounded-lg hover:bg-slate-800 flex items-center space-x-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download PDF</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {savedGovtJobs.length === 0 && savedITJobs.length === 0 && savedUnivPapers.length === 0 && (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500">
                    <Bookmark className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">No items bookmarked yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Save recruitment notifications, private tech vacancies, and university exam papers for quick reference anytime.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <Link
                      href="/jobs"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow"
                    >
                      Browse Government Jobs
                    </Link>
                    <Link
                      href="/jobs/it"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow"
                    >
                      Browse Tech Careers
                    </Link>
                    <Link
                      href="/university"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow"
                    >
                      University Question Papers
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: REMINDERS & DEADLINES */}
          {activeTab === "reminders" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#14213D] dark:text-white flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-sky-500" />
                    <span>Deadlines & Exam Countdown Tracker</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Stay ahead with verified dates for application close, hall ticket releases, and examination schedules.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href="https://t.me/india102210"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-[#229ED9] hover:bg-[#1E88E5] text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Sync with Telegram Channel</span>
                  </a>
                </div>
              </div>

              {/* Deadline Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center font-black text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-red-900 dark:text-red-200">Closing Within 7 Days</h4>
                    <p className="text-[11px] text-red-600 dark:text-red-400">Immediate action required</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black text-sm">
                    7
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-blue-900 dark:text-blue-200">Upcoming This Month</h4>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400">Application windows active</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200">Hall Tickets Expected</h4>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Admit cards releasing soon</p>
                  </div>
                </div>
              </div>

              {/* Deadline Cards List */}
              <div className="space-y-3">
                {[
                  {
                    id: 1,
                    title: "UPSC Civil Services (Preliminary) Examination 2026",
                    org: "Union Public Service Commission",
                    date: "March 05, 2026",
                    daysLeft: 10,
                    type: "Application Closing",
                    link: "https://upsc.gov.in"
                  },
                  {
                    id: 2,
                    title: "RRB Technician Grade I & III Recruitment",
                    org: "Railway Recruitment Boards",
                    date: "March 12, 2026",
                    daysLeft: 17,
                    type: "Application Closing",
                    link: "https://indianrailways.gov.in"
                  },
                  {
                    id: 3,
                    title: "TNPSC Group 2 & 2A Combined Civil Services",
                    org: "Tamil Nadu Public Service Commission",
                    date: "March 20, 2026",
                    daysLeft: 25,
                    type: "Hall Ticket Release",
                    link: "https://tnpsc.gov.in"
                  },
                  {
                    id: 4,
                    title: "CBSE Class 10 & 12 Board Examination Practical Project Upload",
                    org: "Central Board of Secondary Education",
                    date: "March 15, 2026",
                    daysLeft: 20,
                    type: "Submission Deadline",
                    link: "https://cbse.gov.in"
                  }
                ].map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-blue-400 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-50 dark:bg-sky-950 text-sky-600">
                          {item.type}
                        </span>
                        <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.daysLeft} days remaining</span>
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.org} • Target Date: <strong>{item.date}</strong></p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <a
                        href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(item.title)}&dates=20260305T090000Z/20260305T180000Z&details=${encodeURIComponent(item.org)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 flex items-center space-x-1"
                      >
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>Google Calendar</span>
                      </a>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1 shadow"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: APPLICATIONS */}
          {activeTab === "applications" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#14213D] dark:text-white flex items-center space-x-2">
                    <FileCheck2 className="w-5 h-5 text-purple-600" />
                    <span>My Examination & Recruitment Applications</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Track the real-time status of your registered examinations, roll numbers, and official hall tickets.
                  </p>
                </div>
                <Link
                  href="/jobs"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Apply for New Exam</span>
                </Link>
              </div>

              {registeredExams.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Applications Tracking</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When you apply through ExamHub India or save application registration details, they appear here with hall ticket alerts.
                  </p>
                  <div className="space-y-3 max-w-md mx-auto text-left pt-2">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-slate-800 dark:text-white">Sample: SSC CGL 2026 Examination</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Confirmed</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Reg No: <strong>SSC-2026-98124</strong> • Roll: <strong>Pending Allotment</strong></p>
                      <p className="text-[11px] text-blue-600 font-semibold">Tier 1 Exam: Scheduled June 2026</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {registeredExams.map((reg: any) => (
                    <div
                      key={reg.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {reg.status || "Registered"}
                          </span>
                          <span className="text-[11px] text-slate-400">Applied on {new Date(reg.created_at).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{reg.exam_title || "Official Examination"}</h4>
                        <p className="text-xs text-slate-500">Roll/Reg: <strong>{reg.registration_number || "REG-991204"}</strong></p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => alert("Hall ticket will be available 7 days prior to examination date.")}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow"
                        >
                          Download Hall Ticket
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: LEARNING PROGRESS */}
          {activeTab === "learning" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#14213D] dark:text-white flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <span>School & College Academic Learning Progress</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Track watched video lessons, formulas revised, question papers solved, and chapter practice quiz scores.
                  </p>
                </div>
                <Link
                  href="/school"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow flex items-center space-x-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Browse School Curriculums</span>
                </Link>
              </div>

              {/* Learning Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Study Hours</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">42.5 hrs</span>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12% this week</span>
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Chapters Completed</span>
                  <span className="text-2xl font-black text-blue-600 mt-1 block">14 / 28</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">50% Syllabus covered</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Videos Watched</span>
                  <span className="text-2xl font-black text-indigo-600 mt-1 block">36</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">Across CBSE & State</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quiz Accuracy</span>
                  <span className="text-2xl font-black text-emerald-500 mt-1 block">86%</span>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Mastery level</span>
                </div>
              </div>

              {/* Active Subject Chapters */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Continue Where You Left Off</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      id: "cbse-10-science-electricity",
                      board: "CBSE Class 10",
                      subject: "Science",
                      chapter: "Chapter 12: Electricity",
                      progress: 75,
                      lastTopic: "Ohm's Law & Resistors in Series"
                    },
                    {
                      id: "cbse-12-physics-current-electricity",
                      board: "CBSE Class 12",
                      subject: "Physics",
                      chapter: "Chapter 3: Current Electricity",
                      progress: 60,
                      lastTopic: "Kirchhoff's Rules & Wheatstone Bridge"
                    },
                    {
                      id: "tn-10-science-laws-of-motion",
                      board: "Tamil Nadu Class 10",
                      subject: "Science",
                      chapter: "Unit 1: Laws of Motion",
                      progress: 90,
                      lastTopic: "Newton's Second & Third Laws of Motion"
                    }
                  ].map((ch) => (
                    <div
                      key={ch.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-emerald-400 transition-all"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                          {ch.board} • {ch.subject}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">{ch.chapter}</h4>
                        <p className="text-[11px] text-slate-500 mt-1">Topic: {ch.lastTopic}</p>
                        <div className="mt-4">
                          <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                            <span>Chapter Progress</span>
                            <span>{ch.progress}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${ch.progress}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <Link
                          href={`/school/chapter/${ch.id}`}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center space-x-1.5"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Resume Learning Chapter</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#0A192F] to-[#1E3A8A] text-white flex items-center justify-center font-black text-2xl shadow-lg border border-blue-400/20">
                  {currentUser?.full_name?.charAt(0)?.toUpperCase() || "S"}
                </div>
                <div className="text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      {currentUser?.full_name || "ExamHub Student"}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 border border-blue-200 dark:border-blue-900 flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-blue-500" />
                      <span>Verified Student Account</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{currentUser?.email || "student@examhub.in"}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Role: Student • Member since 2026</p>
                </div>
                <button
                  onClick={() => alert("Profile update request submitted successfully.")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow"
                >
                  Save Profile Info
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-[#101E3D] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-[#14213D] dark:text-white flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Academic & Contact Details</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Full Legal Name</label>
                      <input
                        defaultValue={currentUser?.full_name || "Ajay Dev"}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Registered Email</label>
                      <input
                        defaultValue={currentUser?.email || "ajay@examhub.in"}
                        disabled
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold opacity-70"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Highest Qualification</label>
                      <select
                        defaultValue="B.E. / B.Tech"
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                      >
                        <option>Class 10 (Secondary)</option>
                        <option>Class 12 (Higher Secondary)</option>
                        <option>Diploma</option>
                        <option>B.E. / B.Tech</option>
                        <option>B.Sc / B.Com / B.A</option>
                        <option>M.E. / M.Tech / M.Sc / MCA</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">State / Union Territory</label>
                      <input
                        defaultValue="Tamil Nadu"
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-[#101E3D] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-[#14213D] dark:text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Target Careers & Exams</span>
                  </h3>
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">
                      Select your target verticals to receive customized Telegram notifications and personalized recommendations.
                    </p>
                    <div className="space-y-2 pt-1">
                      {[
                        { title: "Central Government Jobs (UPSC, SSC, RRB)", checked: true },
                        { title: "State PSC & Police (TNPSC, Karnataka, etc.)", checked: true },
                        { title: "IT & Software Roles (Full Stack, Cloud, AI)", checked: true },
                        { title: "College & University Semester Exams", checked: true },
                        { title: "School Boards (Class 10 & 12)", checked: false }
                      ].map((item, idx) => (
                        <label
                          key={idx}
                          className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            defaultChecked={item.checked}
                            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-lg font-black text-[#14213D] dark:text-white flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-slate-500" />
                  <span>Platform Preferences & Notifications</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Configure alert frequencies, themes, and official Telegram AI Guardian notification channels.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-[#101E3D] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-[#14213D] dark:text-white">Alert Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Telegram Channel Instant Updates</h4>
                        <p className="text-[11px] text-slate-500">Receive verified job alerts via @india102210</p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Application Deadline Alerts</h4>
                        <p className="text-[11px] text-slate-500">Get reminders 3 days and 24 hours before deadlines</p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Admit Card Releases</h4>
                        <p className="text-[11px] text-slate-500">Instant notification when hall tickets are released</p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-[#101E3D] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-[#14213D] dark:text-white">Display & Account Security</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Official Data Privacy</h4>
                        <p className="text-[11px] text-slate-500">End-to-end encrypted document vault</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Export My Student Data</h4>
                        <p className="text-[11px] text-slate-500">Download all bookmarked papers, history and notes in JSON</p>
                      </div>
                      <button
                        onClick={() => alert("Student profile data exported successfully.")}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold rounded-lg"
                      >
                        Export
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
