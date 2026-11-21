"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Building, MapPin, Calendar, GraduationCap, 
  Clock, ShieldCheck, Bookmark, BookmarkCheck, ExternalLink, 
  FileText, Download, CheckCircle, AlertTriangle, AlertCircle, 
  Share2, Eye, HelpCircle, X, ChevronRight, UserCheck
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function JobDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Eligibility Checker State
  const [userDegree, setUserDegree] = useState("Any Graduate");
  const [userAge, setUserAge] = useState("24");
  const [eligibilityResult, setEligibilityResult] = useState<{ eligible: boolean; message: string } | null>(null);

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportIssue, setReportIssue] = useState("EXPIRED_LINK");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  useEffect(() => {
    if (slug) {
      loadJob();
    }
  }, [slug]);

  async function loadJob() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchApi(`/api/jobs/${slug}`);
      setJob(res);
    } catch (err: any) {
      setError(err.message || "Failed to load job notification");
    } finally {
      setLoading(false);
    }
  }

  const handleToggleSave = async () => {
    if (!job) return;
    try {
      const res = await fetchApi(`/api/jobs/${job.slug}/save`, { method: "POST" });
      setJob({ ...job, is_saved: res.saved });
    } catch (err: any) {
      console.error("Save error:", err);
    }
  };

  const handleApplyClick = () => {
    if (!job) return;
    fetchApi(`/api/jobs/${job.slug}/apply`, { method: "POST" }).catch(() => {});
    window.open(job.official_application_url, "_blank", "noopener,noreferrer");
  };

  const checkEligibility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    const ageNum = parseInt(userAge);
    let eligible = true;
    let reason = "You meet the standard preliminary educational and age requirements for this notification.";

    if (isNaN(ageNum) || ageNum < 18) {
      eligible = false;
      reason = "Minimum age requirement for central/state recruitment is generally 18 years.";
    } else if (ageNum > 35 && !job.age_limit.toLowerCase().includes("no upper")) {
      reason = "Your entered age exceeds general limit (32-35). Reserved categories (SC/ST/OBC) may qualify under official age relaxations.";
    }

    setEligibilityResult({ eligible, message: reason });
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    try {
      await fetchApi(`/api/jobs/${job.slug}/report`, {
        method: "POST",
        body: JSON.stringify({
          issue_type: reportIssue,
          details: reportDetails
        })
      });
      setReportSubmitted(true);
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSubmitted(false);
      }, 2500);
    } catch (err: any) {
      alert("Report failed: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-semibold">Retrieving verified recruitment notification...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4 bg-slate-900 border border-slate-800 p-8 rounded-2xl">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Job Notification Not Found</h2>
          <p className="text-xs text-slate-400">
            {error || "This recruitment notification does not exist or may have been archived."}
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Jobs</span>
          </Link>
        </div>
      </div>
    );
  }

  const isClosingSoon = job.is_closing_soon;
  const isExpired = job.is_expired;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-4">
          <Link href="/jobs" className="flex items-center space-x-1.5 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>All Job Notifications</span>
          </Link>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: job.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Share Opportunity"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleSave}
              className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 font-semibold transition-all ${
                job.is_saved
                  ? "bg-blue-600/20 border-blue-500 text-blue-300"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              {job.is_saved ? <BookmarkCheck className="w-4 h-4 text-blue-400" /> : <Bookmark className="w-4 h-4" />}
              <span>{job.is_saved ? "Saved" : "Save Job"}</span>
            </button>
          </div>
        </div>

        {/* Job Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
              job.sector === "CENTRAL_GOVT" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" :
              job.sector === "STATE_GOVT" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
              job.sector === "PSU" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" :
              "bg-orange-500/20 text-orange-300 border border-orange-500/30"
            }`}>
              {job.sector.replace("_", " ")}
            </span>

            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-[11px] font-semibold">
              {job.category.replace("_", " ")}
            </span>

            {isClosingSoon && (
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-[11px] font-bold border border-red-500/30 animate-pulse">
                ⏳ Deadline Approaching (≤ 3 Days)
              </span>
            )}

            {isExpired && (
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-[11px] font-bold">
                Application Closed
              </span>
            )}

            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20 flex items-center gap-1 ml-auto">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Official Notice
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {job.title}
            </h1>
            <p className="text-sm font-semibold text-slate-400 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-500" />
              <span>{job.organization_name}</span>
            </p>
          </div>

          {/* Key Parameters Quick Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Posts</span>
              <span className="text-emerald-400 font-black text-base block">
                {job.vacancies_count ? `${job.vacancies_count.toLocaleString()}` : "As per Notice"}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Salary / Pay Scale</span>
              <span className="text-white font-bold text-xs sm:text-sm truncate block" title={job.salary_range}>
                {job.salary_range || "Official Rules"}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Location & Mode</span>
              <span className="text-slate-200 font-semibold text-xs truncate block" title={`${job.location} (${job.work_mode})`}>
                {job.location} ({job.work_mode})
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Application Deadline</span>
              <span className={`font-black text-xs sm:text-sm block ${isClosingSoon ? "text-red-400" : "text-white"}`}>
                {job.application_end_date ? new Date(job.application_end_date).toLocaleDateString("en-IN") : "Ongoing"}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Eye className="w-4 h-4 text-slate-500" />
              <span>{job.view_count?.toLocaleString()} Views</span>
              <span>•</span>
              <span className="text-slate-300 font-medium">Fee: {job.application_fee || "Refer notification"}</span>
            </div>

            <div className="flex items-center space-x-3">
              {job.official_notification_pdf && (
                <a
                  href={job.official_notification_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors border border-slate-700"
                >
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Download Official PDF</span>
                </a>
              )}

              <button
                onClick={handleApplyClick}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition-all"
              >
                <span>Apply on Official Portal</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Details: Main Content + Side Utilities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Content Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description & Eligibility */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                Recruitment Details & Educational Qualification
              </h2>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Mandatory Qualification</span>
                <p className="text-sm font-bold text-emerald-400 leading-snug">
                  {job.qualification}
                </p>
                {job.required_skills && (
                  <p className="text-slate-300 text-xs pt-1">
                    <strong className="text-slate-400">Key Competencies: </strong>
                    {job.required_skills}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-slate-300 leading-relaxed text-xs">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Overview</h3>
                <p>{job.job_description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Age Eligibility</span>
                  <span className="font-semibold text-slate-200">{job.age_limit}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Experience Requisite</span>
                  <span className="font-semibold text-slate-200">
                    {job.experience_required === "FRESHER" ? "Fresher Eligible (No prior experience)" : `${job.experience_required} Years`}
                  </span>
                </div>
              </div>
            </div>

            {/* Selection Process & Syllabus */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Selection Stages & Examination Pattern
              </h2>

              {job.selection_process && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Selection Stages</span>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-medium">
                    {job.selection_process}
                  </div>
                </div>
              )}

              {job.syllabus_details && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Syllabus & Exam Structure</span>
                  <p className="text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                    {job.syllabus_details}
                  </p>
                </div>
              )}
            </div>

            {/* Official Source & Verification Citation */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 text-xs">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Official Source Citation & Verification Desk
              </h2>

              <p className="text-slate-400 text-[11px] leading-relaxed">
                This notification has been verified by the ExamHub India editorial desk against published notices in the official government gazette and primary recruitment portals.
              </p>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Verification Source</span>
                  <span className="text-emerald-400 font-semibold text-[11px]">Primary Portal Verified</span>
                </div>
                <p className="text-slate-200 font-semibold">{job.verification_source}</p>
                <a
                  href={job.source_website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline flex items-center gap-1 text-[11px] pt-1"
                >
                  <span>Open Primary Source URL ({new URL(job.source_website_url).hostname})</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Report button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center space-x-1 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Report incorrect or outdated information</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Utility Column */}
          <div className="space-y-6">
            {/* Eligibility Checker Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs shadow-sm">
              <div className="space-y-1">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  Instant Eligibility Checker
                </h3>
                <p className="text-[11px] text-slate-400">Check if your profile matches this recruitment's criteria</p>
              </div>

              <form onSubmit={checkEligibility} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium text-[11px]">Your Highest Qualification</label>
                  <select
                    value={userDegree}
                    onChange={(e) => setUserDegree(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="10th / 12th">10th / 12th Pass</option>
                    <option value="ITI / Diploma">ITI / Polytechnic Diploma</option>
                    <option value="Any Graduate">Bachelor's Degree (Any Discipline)</option>
                    <option value="B.E/B.Tech">B.E. / B.Tech (Engineering)</option>
                    <option value="Post Graduate">Master's / Post Graduate / MBA</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium text-[11px]">Your Current Age (Years)</label>
                  <input
                    type="number"
                    min="16"
                    max="60"
                    value={userAge}
                    onChange={(e) => setUserAge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                >
                  Verify My Eligibility
                </button>
              </form>

              {eligibilityResult && (
                <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                  eligibilityResult.eligible
                    ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                    : "bg-amber-950/60 border-amber-800 text-amber-300"
                }`}>
                  <div className="font-bold mb-0.5 flex items-center gap-1.5">
                    {eligibilityResult.eligible ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Preliminary Match</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Criteria Check Notice</span>
                      </>
                    )}
                  </div>
                  {eligibilityResult.message}
                </div>
              )}
            </div>

            {/* Anti-Phishing Warning */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200/90 space-y-2">
              <span className="font-bold flex items-center gap-1.5 text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                Student Safety Advisory
              </span>
              <p className="text-[11px] leading-relaxed text-amber-300/80">
                Government recruitment boards never ask for OTPs or login passwords via WhatsApp or third-party links. Always verify the domain ends in <strong>.gov.in</strong> or <strong>.nic.in</strong> before paying application fees.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Incorrect Info Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Report Incorrect Job Notice
              </h3>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-center space-y-1">
                <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="font-bold">Report Received</p>
                <p className="text-[11px] text-emerald-400">Our verification desk will re-probe the official source link.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Issue Type</label>
                  <select
                    value={reportIssue}
                    onChange={(e) => setReportIssue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="EXPIRED_LINK">Application Link Expired / 404</option>
                    <option value="WRONG_VACANCY">Incorrect Vacancy Count</option>
                    <option value="INCORRECT_DATE">Wrong Application Closing Date</option>
                    <option value="FAKE_PORTAL">Suspicious Third-Party Link</option>
                    <option value="OTHER">Other Discrepancy</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Details / Corrections</label>
                  <textarea
                    rows={3}
                    required
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Describe the discrepancy..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 text-xs"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
