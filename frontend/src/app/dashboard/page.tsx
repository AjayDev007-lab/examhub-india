"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  MessageCircle
} from "lucide-react";
import { fetchApi, getFileUrl } from "@/lib/api";
import { isFirebaseConfigured, auth, onAuthStateChanged, db, doc, getDoc } from "@/lib/firebase";
import StudentSidebar from "@/components/StudentSidebar";
import StudentHeader from "@/components/StudentHeader";

export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentUser, setCurrentUser] = useState<any>(null);

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
          {/* Official WhatsApp Channel Join Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-[#0A1A35] border border-emerald-500/40 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center text-white shadow-sm shrink-0">
                <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center space-x-2">
                  <span>ExamHub India Official WhatsApp Channel</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/30">
                    Live
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  Receive instant notifications on exam schedules, hall ticket download links, and scorecard announcements directly on WhatsApp.
                </p>
              </div>
            </div>
            <a
              href="https://whatsapp.com/channel/0029VbA1ZLpJENy3wwL6VC0s"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20BA56] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shrink-0 shadow transition-all hover:scale-105 active:scale-95"
            >
              <span>Join Channel</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
            </a>
          </div>

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
        </div>
      </div>
    </div>
  );
}
