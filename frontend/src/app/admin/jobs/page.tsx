"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Briefcase, ArrowLeft, Plus, Search, Filter, ShieldCheck, 
  ExternalLink, CheckCircle, AlertTriangle, Clock, RefreshCw, 
  Edit3, Trash2, Eye, Building, FileText, ChevronRight, X, Info,
  Send, Copy, Check, MessageSquare, Sparkles, Share2
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminJobsManagementPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sectorFilter, setSectorFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Create Job Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Telegram Channel Broadcast State (@india102210)
  const [selectedJobForTelegram, setSelectedJobForTelegram] = useState<any | null>(null);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [telegramDispatching, setTelegramDispatching] = useState(false);
  const [quickBroadcastingId, setQuickBroadcastingId] = useState<number | null>(null);
  const [telegramNotice, setTelegramNotice] = useState("");
  const [copiedTelegram, setCopiedTelegram] = useState(false);
  const [telegramPreviewText, setTelegramPreviewText] = useState("");
  const [autoBroadcastOnCreate, setAutoBroadcastOnCreate] = useState(true);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formOrg, setFormOrg] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formSector, setFormSector] = useState("CENTRAL_GOVT");
  const [formCategory, setFormCategory] = useState("GOVERNMENT");
  const [formWorkMode, setFormWorkMode] = useState("ON_SITE");
  const [formVacancies, setFormVacancies] = useState("100");
  const [formLocation, setFormLocation] = useState("All India");
  const [formQualification, setFormQualification] = useState("GRADUATION");
  const [formQualDesc, setFormQualDesc] = useState("Any recognized Bachelor's Degree");
  const [formAgeLimit, setFormAgeLimit] = useState("21 - 32 years (Relaxations as per Govt Rules)");
  const [formPayScale, setFormPayScale] = useState("Pay Level 7 (₹44,900 - ₹1,42,400)");
  const [formFee, setFormFee] = useState("₹100 (SC/ST/Female: Exempted)");
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [formLastDate, setFormLastDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [formApplyUrl, setFormApplyUrl] = useState("https://upsconline.nic.in");
  const [formPdfUrl, setFormPdfUrl] = useState("https://upsc.gov.in/notices/exam-notice.pdf");
  const [formSourceName, setFormSourceName] = useState("Official Gazette / UPSC Portal");
  const [formSelectionStages, setFormSelectionStages] = useState("Preliminary Exam, Main Exam, Interview");
  const [formStatus, setFormStatus] = useState("PUBLISHED");

  useEffect(() => {
    loadJobs();
  }, [search, statusFilter, sectorFilter, categoryFilter]);

  async function loadJobs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (sectorFilter !== "ALL") params.append("sector", sectorFilter);
      if (categoryFilter !== "ALL") params.append("category", categoryFilter);
      params.append("limit", "100");

      const res = await fetchApi(`/api/jobs?${params.toString()}`);
      if (res && res.jobs) {
        setJobs(res.jobs);
      }
    } catch (err) {
      console.error("Failed to load jobs in admin:", err);
    } finally {
      setLoading(false);
    }
  }

  // Toggle Job Status
  async function handleToggleStatus(job: any, newStatus: string) {
    try {
      const res = await fetchApi(`/api/jobs/${job.slug || job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res) {
        const updated = res.job || res;
        setJobs(jobs.map((j) => (j.id === job.id ? { ...j, ...updated, status: newStatus } : j)));
        setSuccessMsg(`Status updated for ${job.title} to ${newStatus}`);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err: any) {
      alert("Failed to update status: " + (err.message || "Unknown error"));
    }
  }

  async function openTelegramModal(job: any) {
    setSelectedJobForTelegram(job);
    setIsTelegramModalOpen(true);
    setTelegramNotice("");
    setCopiedTelegram(false);

    try {
      const res = await fetchApi("/api/admin/telegram/channel-dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, action: "PREVIEW" })
      });
      if (res && res.previewText) {
        setTelegramPreviewText(res.previewText);
      }
    } catch (_) {}
  }

  function handleCopyTelegram(text: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedTelegram(true);
    setTimeout(() => setCopiedTelegram(false), 3000);
  }

  async function handleDispatchToTelegramChannel(job: any) {
    setTelegramDispatching(true);
    setTelegramNotice("");
    try {
      const res = await fetchApi("/api/admin/telegram/channel-dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, messageText: telegramPreviewText, action: "DISPATCH_CHANNEL" })
      });
      if (res && res.success) {
        setTelegramNotice(res.message || "Broadcast successfully posted to @india102210!");
        setJobs(jobs.map((j) => (j.id === job.id ? { 
          ...j, 
          telegram_channel_status: "POSTED_TO_CHANNEL",
          telegram_message_id: res.messageId,
          telegram_posted_at: res.postedAt,
          telegram_error: null
        } : j)));
      } else {
        const errorMsg = res?.message || "Failed to broadcast to Telegram channel.";
        setTelegramNotice("⚠️ " + errorMsg);
        setJobs(jobs.map((j) => (j.id === job.id ? { 
          ...j, 
          telegram_channel_status: "FAILED",
          telegram_error: errorMsg
        } : j)));
      }
    } catch (err: any) {
      setTelegramNotice("⚠️ Error: " + err.message);
    } finally {
      setTelegramDispatching(false);
    }
  }

  async function handleQuickBroadcast(job: any) {
    setQuickBroadcastingId(job.id);
    setSuccessMsg("");
    try {
      const res = await fetchApi("/api/admin/telegram/channel-dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, action: "DISPATCH_CHANNEL" })
      });
      if (res && res.success) {
        setJobs(jobs.map((j) => (j.id === job.id ? { 
          ...j, 
          telegram_channel_status: "POSTED_TO_CHANNEL",
          telegram_message_id: res.messageId,
          telegram_posted_at: res.postedAt,
          telegram_error: null 
        } : j)));
        setSuccessMsg(`✅ Successfully broadcast "${job.title}" to @india102210 (Msg #${res.messageId || 'OK'})!`);
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        const errorText = res?.message || "Failed to post to Telegram channel";
        setJobs(jobs.map((j) => (j.id === job.id ? { 
          ...j, 
          telegram_channel_status: "FAILED",
          telegram_error: errorText 
        } : j)));
        alert("⚠️ Telegram Broadcast Error: " + errorText);
      }
    } catch (err: any) {
      alert("⚠️ Error broadcasting to channel: " + err.message);
    } finally {
      setQuickBroadcastingId(null);
    }
  }

  function getTelegramBadge(job: any) {
    const status = job.telegram_channel_status || (job.status === "PUBLISHED" ? "READY_TO_POST" : "PENDING");
    switch (status) {
      case "POSTED_TO_CHANNEL":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <CheckCircle className="w-3 h-3 text-sky-400" />
            <span>Posted {job.telegram_message_id ? `#${job.telegram_message_id}` : ""}</span>
          </span>
        );
      case "FAILED":
        return (
          <span 
            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 cursor-help"
            title={job.telegram_error || "Telegram broadcast failed. Click retry to attempt again."}
          >
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span>Broadcast Failed</span>
          </span>
        );
      case "READY_TO_POST":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Send className="w-3 h-3 text-emerald-400" />
            <span>Ready to Post</span>
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Expired (Skipped)</span>
          </span>
        );
      case "PENDING":
      case "DRAFT_PENDING":
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Draft</span>
          </span>
        );
    }
  }

  // Submit Create Job
  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setModalError("");

    try {
      const stagesArray = formSelectionStages.split(",").map((s) => s.trim()).filter(Boolean);
      const payload = {
        title: formTitle.trim(),
        organization_name: formOrg.trim(),
        slug: formSlug.trim() || formTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        sector: formSector,
        category: formCategory,
        work_mode: formWorkMode,
        total_vacancies: parseInt(formVacancies) || 1,
        location: formLocation.trim(),
        qualification: formQualification,
        qualification_description: formQualDesc.trim(),
        age_limit: formAgeLimit.trim(),
        pay_scale: formPayScale.trim(),
        application_fee: formFee.trim(),
        application_start_date: formStartDate,
        last_date_to_apply: formLastDate,
        official_apply_url: formApplyUrl.trim(),
        official_notification_pdf_url: formPdfUrl.trim(),
        source_name: formSourceName.trim(),
        selection_stages: stagesArray,
        status: formStatus,
        broadcast_to_telegram: autoBroadcastOnCreate,
      };

      const res = await fetchApi("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res && (res.job || res.id)) {
        const createdJob = res.job || res;
        setJobs([createdJob, ...jobs]);
        setIsModalOpen(false);
        if (createdJob.telegram_channel_status === "POSTED_TO_CHANNEL") {
          setSuccessMsg(`Job published and broadcast to Telegram channel @india102210 (Msg #${createdJob.telegram_message_id || 'OK'})!`);
        } else {
          setSuccessMsg("Job notification created and published successfully!");
        }
        setTimeout(() => setSuccessMsg(""), 4000);
        // Reset form
        setFormTitle("");
        setFormOrg("");
        setFormSlug("");
      } else {
        throw new Error(res?.detail || res?.error || "Failed to create job");
      }
    } catch (err: any) {
      setModalError(err.message || "Failed to create job notification");
    } finally {
      setSubmitting(false);
    }
  }

  const publishedCount = jobs.filter((j) => j.status === "PUBLISHED").length;
  const draftCount = jobs.filter((j) => j.status === "DRAFT").length;
  const expiredCount = jobs.filter((j) => j.status === "EXPIRED").length;
  const totalVacancies = jobs.reduce((acc, j) => acc + (j.total_vacancies || j.vacancies_count || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/dashboard"
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
              title="Return to Main Admin Console"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black text-white tracking-tight">Job Notifications & Career Control</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  ENTERPRISE MODULE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage all Indian Central, State, Railway, Defence, Banking, and IT recruitment gazette postings.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/jobs"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Eye className="w-4 h-4 text-slate-400" />
              <span>View Public Portal</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Notification</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs font-semibold text-slate-400">Total Notifications</span>
            <div className="text-2xl font-black text-white mt-1">{jobs.length}</div>
            <span className="text-[11px] text-slate-500 font-medium">All active & archived</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs font-semibold text-emerald-400">Published & Live</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{publishedCount}</div>
            <span className="text-[11px] text-slate-500 font-medium">Available on student portal</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs font-semibold text-amber-400">Draft Status</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{draftCount}</div>
            <span className="text-[11px] text-slate-500 font-medium">Pending gazette verification</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs font-semibold text-blue-400">Total Vacancies Advertised</span>
            <div className="text-2xl font-black text-blue-400 mt-1">{totalVacancies.toLocaleString()}</div>
            <span className="text-[11px] text-slate-500 font-medium">Cumulated posts</span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by job title, organization name, or code..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="EXPIRED">Expired</option>
              </select>

              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="ALL">All Sectors</option>
                <option value="CENTRAL_GOVT">Central Govt</option>
                <option value="STATE_GOVT">State Govt</option>
                <option value="PSU">Public Sector (PSU)</option>
                <option value="BANKING">Banking</option>
                <option value="RAILWAY">Railway</option>
                <option value="DEFENCE">Defence</option>
                <option value="PRIVATE">Private</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="GOVERNMENT">Government</option>
                <option value="IT">IT & Tech</option>
                <option value="BANKING">Banking</option>
                <option value="RAILWAY">Railway</option>
                <option value="DEFENCE">Defence</option>
                <option value="TEACHING">Teaching</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="APPRENTICESHIP">Apprenticeship</option>
                <option value="WALK_IN">Walk-in</option>
              </select>

              <button
                onClick={loadJobs}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition-colors"
                title="Refresh List"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3">Recruitment Details</th>
                  <th className="px-5 py-3">Sector & Category</th>
                  <th className="px-5 py-3">Vacancies & Pay</th>
                  <th className="px-5 py-3">Deadline</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Telegram Channel</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
                      Loading verified job notifications...
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                      No recruitment notices found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => {
                    const lastDateObj = new Date(job.last_date_to_apply);
                    const isClosingSoon = (lastDateObj.getTime() - Date.now()) < 5 * 24 * 60 * 60 * 1000 && lastDateObj.getTime() > Date.now();
                    const isExpired = lastDateObj.getTime() < Date.now();

                    return (
                      <tr key={job.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-white text-sm line-clamp-1">{job.title}</div>
                          <div className="flex items-center space-x-2 text-slate-400 mt-0.5">
                            <span className="font-medium text-slate-300">{job.organization_name}</span>
                            <span>•</span>
                            <span className="text-slate-500">{job.location || "All India"}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            {job.official_notification_pdf_url && (
                              <a
                                href={job.official_notification_pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-blue-400 hover:underline flex items-center space-x-0.5"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Official PDF</span>
                              </a>
                            )}
                            {job.official_apply_url && (
                              <a
                                href={job.official_apply_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-emerald-400 hover:underline flex items-center space-x-0.5"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Official Portal</span>
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {job.sector}
                          </span>
                          <div className="text-slate-400 text-[11px] mt-1 font-medium">{job.category}</div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-bold text-white text-xs">
                            {(job.total_vacancies || job.vacancies_count)?.toLocaleString() || "N/A"} Posts
                          </div>
                          <div className="text-slate-400 text-[11px] mt-0.5 line-clamp-1">{job.pay_scale || job.salary_range || "Govt Rules"}</div>
                        </td>

                        <td className="px-5 py-4">
                          <div className={`font-semibold ${isExpired ? "text-red-400" : isClosingSoon ? "text-amber-400" : "text-slate-300"}`}>
                            {job.last_date_to_apply || job.application_end_date ? new Date(job.last_date_to_apply || job.application_end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Open"}
                          </div>
                          {isClosingSoon && (
                            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 mt-0.5">
                              Closing Soon
                            </span>
                          )}
                          {isExpired && (
                            <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-500/20 text-red-300 mt-0.5">
                              Expired
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            job.status === "PUBLISHED"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : job.status === "DRAFT"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-slate-800 text-slate-400"
                          }`}>
                            {job.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-1.5">
                            <div>{getTelegramBadge(job)}</div>
                            <div className="flex items-center space-x-1.5">
                              {job.status === "PUBLISHED" && job.telegram_channel_status !== "POSTED_TO_CHANNEL" && (
                                <button
                                  onClick={() => handleQuickBroadcast(job)}
                                  disabled={quickBroadcastingId === job.id}
                                  className="inline-flex items-center space-x-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[10px] font-bold rounded transition-colors shadow-sm"
                                  title="Publish directly to @india102210 now"
                                >
                                  {quickBroadcastingId === job.id ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Send className="w-3 h-3" />
                                  )}
                                  <span>{job.telegram_channel_status === "FAILED" ? "Retry" : "Broadcast"}</span>
                                </button>
                              )}
                              <button
                                onClick={() => openTelegramModal(job)}
                                className="inline-flex items-center space-x-1 px-2 py-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-700/60 hover:border-sky-500 text-sky-300 hover:text-sky-200 text-[10px] font-bold rounded transition-colors shadow-sm"
                                title="Open Telegram Channel Broadcast Hub"
                              >
                                <FileText className="w-3 h-3 text-sky-400" />
                                <span>Preview</span>
                              </button>
                            </div>
                            {job.telegram_error && job.telegram_channel_status === "FAILED" && (
                              <p className="text-[10px] text-red-400 line-clamp-1 max-w-[180px]" title={job.telegram_error}>
                                {job.telegram_error}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {job.status !== "PUBLISHED" ? (
                              <button
                                onClick={() => handleToggleStatus(job, "PUBLISHED")}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold transition-colors"
                                title="Publish Job"
                              >
                                Publish
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleStatus(job, "DRAFT")}
                                className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-bold transition-colors"
                                title="Unpublish / Set to Draft"
                              >
                                Draft
                              </button>
                            )}

                            <Link
                              href={`/jobs/${job.slug || job.id}`}
                              target="_blank"
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                              title="Preview Public Page"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Job Notification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative my-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-black text-white">Create Verified Job Notification</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateJob} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Civil Services Examination (CSE) 2025"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={formOrg}
                    onChange={(e) => setFormOrg(e.target.value)}
                    placeholder="e.g. Union Public Service Commission (UPSC)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sector *</label>
                  <select
                    value={formSector}
                    onChange={(e) => setFormSector(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                  >
                    <option value="CENTRAL_GOVT">Central Govt</option>
                    <option value="STATE_GOVT">State Govt</option>
                    <option value="PSU">PSU / Autonomous</option>
                    <option value="BANKING">Banking</option>
                    <option value="RAILWAY">Railway</option>
                    <option value="DEFENCE">Defence</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                  >
                    <option value="GOVERNMENT">Government</option>
                    <option value="IT">IT & Tech</option>
                    <option value="BANKING">Banking</option>
                    <option value="RAILWAY">Railway</option>
                    <option value="DEFENCE">Defence</option>
                    <option value="TEACHING">Teaching</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="APPRENTICESHIP">Apprenticeship</option>
                    <option value="WALK_IN">Walk-In</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Work Mode</label>
                  <select
                    value={formWorkMode}
                    onChange={(e) => setFormWorkMode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                  >
                    <option value="ON_SITE">On-Site</option>
                    <option value="REMOTE">Remote / WFH</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Vacancies *</label>
                  <input
                    type="number"
                    required
                    value={formVacancies}
                    onChange={(e) => setFormVacancies(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Qualification Level</label>
                  <select
                    value={formQualification}
                    onChange={(e) => setFormQualification(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                  >
                    <option value="10TH">10th Matriculation</option>
                    <option value="12TH">12th Higher Secondary</option>
                    <option value="DIPLOMA">Diploma</option>
                    <option value="GRADUATION">Graduate Degree</option>
                    <option value="POST_GRADUATION">Post Graduate</option>
                    <option value="PHD">PhD / Research</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="All India or Specific State"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pay Scale / Salary</label>
                  <input
                    type="text"
                    value={formPayScale}
                    onChange={(e) => setFormPayScale(e.target.value)}
                    placeholder="Pay Level 7 (₹44,900 - ₹1,42,400)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Age Limit</label>
                  <input
                    type="text"
                    value={formAgeLimit}
                    onChange={(e) => setFormAgeLimit(e.target.value)}
                    placeholder="21 - 32 years (Relaxations as per Rules)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Application Start Date</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Last Date to Apply *</label>
                  <input
                    type="date"
                    required
                    value={formLastDate}
                    onChange={(e) => setFormLastDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Official Application Portal URL *</label>
                <input
                  type="url"
                  required
                  value={formApplyUrl}
                  onChange={(e) => setFormApplyUrl(e.target.value)}
                  placeholder="https://official-board.gov.in/apply"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Official Gazette Notification PDF URL</label>
                <input
                  type="url"
                  value={formPdfUrl}
                  onChange={(e) => setFormPdfUrl(e.target.value)}
                  placeholder="https://official-board.gov.in/notification.pdf"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Selection Stages (comma-separated)</label>
                <input
                  type="text"
                  value={formSelectionStages}
                  onChange={(e) => setFormSelectionStages(e.target.value)}
                  placeholder="e.g. Preliminary Exam, Main Exam, Interview, Document Verification"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>

              {/* Automated Telegram Channel Trigger Option */}
              <div className="p-3 bg-slate-950/90 border border-sky-900/40 rounded-xl space-y-1">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoBroadcastOnCreate}
                    onChange={(e) => setAutoBroadcastOnCreate(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-0"
                  />
                  <span className="text-slate-200 font-bold text-xs flex items-center space-x-1.5">
                    <Send className="w-3.5 h-3.5 text-sky-400" />
                    <span>Auto-broadcast to Public Telegram Channel (@india102210) on Publish</span>
                  </span>
                </label>
                <p className="text-[11px] text-slate-400 pl-6">
                  Automatically formats a verified job post and publishes it directly to the ExamHub India Public Telegram Channel.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : "Create & Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Telegram Channel Broadcast Modal (@india102210) */}
      {isTelegramModalOpen && selectedJobForTelegram && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative my-8 space-y-4">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-lg shadow-sky-600/20">
                    <Send className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-black text-white">Telegram Public Channel Broadcast Hub</h2>
                </div>
                <p className="text-xs text-slate-400">
                  Target Channel: <a href="https://t.me/india102210" target="_blank" rel="noopener noreferrer" className="text-sky-400 font-bold hover:underline">@india102210</a>
                </p>
              </div>
              <button
                onClick={() => setIsTelegramModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 font-medium">Channel Status:</span>
                {getTelegramBadge(selectedJobForTelegram)}
              </div>
              <a
                href="https://t.me/india102210"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline flex items-center space-x-1 text-xs"
              >
                <span>Open Channel in Telegram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Notice / Feedback */}
            {telegramNotice && (
              <div className="p-3 bg-slate-950 border border-sky-500/40 text-sky-200 rounded-xl text-xs flex items-center space-x-2">
                <Info className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{telegramNotice}</span>
              </div>
            )}

            {/* Formatted Telegram Message Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Formatted Telegram Channel Broadcast Preview:</span>
                </label>
                <span className="text-[11px] text-slate-500">Includes official links & anti-fraud advisory</span>
              </div>

              <div className="relative bg-[#0e1621] border border-sky-900/40 rounded-2xl p-4 shadow-inner max-h-72 overflow-y-auto">
                <pre className="font-sans text-xs text-sky-100 whitespace-pre-wrap leading-relaxed select-all">
                  {telegramPreviewText || "Loading formatted Telegram broadcast..."}
                </pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleDispatchToTelegramChannel(selectedJobForTelegram)}
                disabled={telegramDispatching}
                className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-lg shadow-sky-600/30 flex items-center justify-center space-x-2 transition-all"
              >
                {telegramDispatching ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
                <span>{telegramDispatching ? "Publishing to Telegram..." : "Broadcast to @india102210"}</span>
              </button>

              <button
                onClick={() => handleCopyTelegram(telegramPreviewText)}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
              >
                {copiedTelegram ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copy Telegram Post</span>
                  </>
                )}
              </button>
            </div>

            {/* Permission Requirement Notice */}
            <div className="p-3 bg-slate-950/80 border border-sky-900/30 rounded-xl text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center space-x-1.5 text-sky-300 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Channel Administrator Permission Requirement</span>
              </div>
              <p>
                To broadcast directly to <strong>@india102210</strong>, please ensure <strong>@ExamHub_AI_Guardian_Bot</strong> is added as an Administrator in your channel with <strong>&quot;Post Messages&quot;</strong> permission enabled.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
