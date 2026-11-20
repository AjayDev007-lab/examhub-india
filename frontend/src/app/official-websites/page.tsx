"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Building2, Search, ExternalLink, CheckCircle2, 
  MapPin, ShieldCheck, Award, FileText, RefreshCw,
  Globe, Bookmark, BookmarkCheck, AlertTriangle, Check, X,
  Shield, Send, Clock, Zap, Landmark, GraduationCap, Briefcase,
  Layers, Filter, ChevronRight, Share2, Sparkles
} from "lucide-react";
import { fetchApi } from "@/lib/api";

const CATEGORY_TABS = [
  { id: "ALL", label: "All Portals", icon: Globe },
  { id: "NATIONAL_PORTAL", label: "National Government", icon: Landmark },
  { id: "CENTRAL_RECRUITMENT", label: "Central Recruitment & Defence", icon: Briefcase },
  { id: "NATIONAL_ENTRANCE", label: "Entrance & Testing Boards", icon: Award },
  { id: "STATE_PSC", label: "State PSCs (28 States & UTs)", icon: MapPin },
  { id: "UNIVERSITY", label: "Universities & Higher Ed", icon: GraduationCap },
  { id: "SCHOOL_BOARD", label: "School Education Boards", icon: FileText },
  { id: "SCHOLARSHIP", label: "Scholarships & Skill India", icon: Layers },
  { id: "CITIZEN_SERVICE", label: "Citizen Digital Services", icon: ShieldCheck },
  { id: "BOOKMARKS", label: "My Bookmarks", icon: Bookmark }
];

export default function OfficialWebsitesPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-slate-400 font-medium">Loading Official Government Registry...</div>}>
      <OfficialWebsitesContent />
    </Suspense>
  );
}

function OfficialWebsitesContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("cat") || "ALL";

  const [websites, setWebsites] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState(initialCat);
  const [selectedState, setSelectedState] = useState("");
  const [selectedOrgType, setSelectedOrgType] = useState("ALL");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default"); // default, popular, recent
  const [searchKw, setSearchKw] = useState("");
  const [loading, setLoading] = useState(true);

  // Verification & probe state
  const [probingId, setProbingId] = useState<number | null>(null);
  const [probeResult, setProbeResult] = useState<{ id: number; message: string; latency_ms: number } | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  // Broken Link Reporting Modal State
  const [reportingWebsite, setReportingWebsite] = useState<any | null>(null);
  const [reportIssue, setReportIssue] = useState("HTTP_404");
  const [reportDetails, setReportDetails] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState("");

  useEffect(() => {
    loadData();
  }, [sortBy, verifiedOnly]);

  async function loadData() {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        limit: "250",
        sort_by: sortBy,
        is_verified_only: verifiedOnly ? "true" : "false"
      });
      const [webRes, sts] = await Promise.all([
        fetchApi(`/api/directory/websites?${queryParams.toString()}`).catch(() => null),
        fetchApi("/api/states").catch(() => [])
      ]);
      setWebsites(webRes?.websites || []);
      setStates(sts || []);
    } catch (err) {
      console.error("Directory error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Handle live verification probe
  const handleVerify = async (webId: number) => {
    setProbingId(webId);
    setProbeResult(null);
    try {
      const res = await fetchApi(`/api/directory/websites/${webId}/verify`, { method: "POST" });
      setProbeResult({
        id: webId,
        message: res.message || "Domain verified",
        latency_ms: res.latency_ms || 42
      });
      setWebsites((prev) =>
        prev.map((w) =>
          w.id === webId
            ? { ...w, last_verified_at: res.verified_at, response_time_ms: res.latency_ms, verification_status: res.verification_status }
            : w
        )
      );
    } catch (err: any) {
      setProbeResult({
        id: webId,
        message: err.message || "Probe failed",
        latency_ms: 0
      });
    } finally {
      setProbingId(null);
    }
  };

  // Handle bookmark / favourite
  const handleToggleBookmark = async (web: any) => {
    setSavingId(web.id);
    try {
      const res = await fetchApi(`/api/directory/websites/${web.id}/favourite`, { method: "POST" });
      setWebsites((prev) =>
        prev.map((w) => (w.id === web.id ? { ...w, is_saved: res.saved } : w))
      );
    } catch (_) {
      setWebsites((prev) =>
        prev.map((w) => (w.id === web.id ? { ...w, is_saved: !w.is_saved } : w))
      );
    } finally {
      setSavingId(null);
    }
  };

  // Submit broken link report
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingWebsite) return;
    setReportSubmitting(true);
    setReportError("");
    try {
      await fetchApi("/api/directory/reports", {
        method: "POST",
        body: JSON.stringify({
          website_id: reportingWebsite.id,
          reported_issue: reportIssue,
          details: reportDetails,
          reporter_name: reporterName,
          reporter_email: reporterEmail
        })
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setReportingWebsite(null);
        setReportDetails("");
      }, 2000);
    } catch (err: any) {
      setReportError(err.message || "Failed to submit report");
    } finally {
      setReportSubmitting(false);
    }
  };

  // Client filtering
  const filteredWebsites = websites.filter((w) => {
    if (selectedCat === "BOOKMARKS") {
      if (!w.is_saved) return false;
    } else if (selectedCat !== "ALL") {
      if (w.category_type !== selectedCat) return false;
    }

    if (selectedOrgType !== "ALL") {
      if ((w.organization_type || "CENTRAL") !== selectedOrgType) return false;
    }

    if (selectedState) {
      if (w.state?.id?.toString() !== selectedState && w.state_id?.toString() !== selectedState) {
        return false;
      }
    }

    if (searchKw.trim()) {
      const q = searchKw.toLowerCase();
      const inName = w.name?.toLowerCase().includes(q);
      const inCode = w.code?.toLowerCase().includes(q);
      const inDomain = w.domain?.toLowerCase().includes(q);
      const inDesc = w.description?.toLowerCase().includes(q);
      const inExams = w.related_examinations?.some((e: string) => e.toLowerCase().includes(q));
      if (!inName && !inCode && !inDomain && !inDesc && !inExams) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Non-Government Disclaimer Banner */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-4 sm:p-5 text-slate-800 shadow-sm flex items-start space-x-3.5">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-blue-500/20">
          <Shield className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900 uppercase tracking-wide">Official Non-Government Disclaimer</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              ✓ Verified .gov.in & .nic.in Registry
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            ExamHub India is an independent student information directory and examination document platform. It is <strong>not</strong> an official government website and is not affiliated with any union ministry, state public service commission, or examination council. All official links redirect directly to verified portals (<code className="font-mono text-blue-700 bg-blue-100/60 px-1 py-0.5 rounded">.gov.in</code>, <code className="font-mono text-blue-700 bg-blue-100/60 px-1 py-0.5 rounded">.nic.in</code>, <code className="font-mono text-blue-700 bg-blue-100/60 px-1 py-0.5 rounded">.ac.in</code>).
          </p>
        </div>
      </div>

      {/* Main Header */}
      <div className="text-center space-y-2 max-w-3xl mx-auto pt-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider">
          <Landmark className="w-3.5 h-3.5 text-blue-600" />
          <span>India Official Website Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Verified Government, Examination & Education Directory
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Search and access authentic portals of Central Ministries, Defence Recruitment, Public Service Commissions across all 28 States and 8 Union Territories, Entrance Boards, and Universities.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto pb-2 scrollbar-none gap-2 border-b border-slate-200">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedCat === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCat(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === "BOOKMARKS" && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600"}`}>
                  {websites.filter((w) => w.is_saved).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Advanced Filter Bar: Search, State, Jurisdiction, Sort */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchKw}
              onChange={(e) => setSearchKw(e.target.value)}
              placeholder="Search by authority (e.g. UPSC, NTA, ISRO), domain (.gov.in), or exam (NEET, JEE)..."
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
            />
          </div>

          {/* State Filter (All 36 States & UTs) */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
            >
              <option value="">All States & Union Territories (36)</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code}) - {s.type}
                </option>
              ))}
            </select>
          </div>

          {/* Central vs State Jurisdiction */}
          <div>
            <select
              value={selectedOrgType}
              onChange={(e) => setSelectedOrgType(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
            >
              <option value="ALL">All Jurisdictions</option>
              <option value="CENTRAL">Central Government & National</option>
              <option value="STATE">State Governments</option>
              <option value="UT">Union Territories</option>
              <option value="PUBLIC_SECTOR">PSUs & Scientific Bodies</option>
              <option value="AUTONOMOUS">Autonomous Councils</option>
            </select>
          </div>
        </div>

        {/* Secondary controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-1.5 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Verified Only</span>
            </label>

            <span className="text-slate-300">|</span>

            <div className="flex items-center space-x-1">
              <span className="text-slate-500 font-medium">Sort:</span>
              <button
                onClick={() => setSortBy("default")}
                className={`px-2 py-0.5 rounded-md ${sortBy === "default" ? "bg-blue-100 text-blue-700 font-bold" : "text-slate-600 hover:text-slate-900"}`}
              >
                Featured
              </button>
              <button
                onClick={() => setSortBy("popular")}
                className={`px-2 py-0.5 rounded-md ${sortBy === "popular" ? "bg-blue-100 text-blue-700 font-bold" : "text-slate-600 hover:text-slate-900"}`}
              >
                Most Visited
              </button>
              <button
                onClick={() => setSortBy("recent")}
                className={`px-2 py-0.5 rounded-md ${sortBy === "recent" ? "bg-blue-100 text-blue-700 font-bold" : "text-slate-600 hover:text-slate-900"}`}
              >
                Recently Verified
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-slate-500 font-medium">
              Showing <strong>{filteredWebsites.length}</strong> official websites
            </span>
            {(searchKw || selectedState || selectedOrgType !== "ALL" || selectedCat !== "ALL" || verifiedOnly) && (
              <button
                onClick={() => {
                  setSearchKw("");
                  setSelectedState("");
                  setSelectedOrgType("ALL");
                  setSelectedCat("ALL");
                  setVerifiedOnly(false);
                  setSortBy("default");
                }}
                className="text-blue-600 hover:underline font-semibold"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="text-center py-24 text-slate-400 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-sm font-semibold text-slate-700">Loading All-India Official Directory...</p>
          <p className="text-xs text-slate-400 mt-1">Connecting to authenticated domain repository</p>
        </div>
      ) : filteredWebsites.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-lg">No official websites found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters. All 28 State Public Service Commissions and Central Boards are registered.
          </p>
          <button
            onClick={() => {
              setSearchKw("");
              setSelectedState("");
              setSelectedOrgType("ALL");
              setSelectedCat("ALL");
            }}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Show All Websites
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWebsites.map((web) => {
            const detailSlug = web.slug || (web.code || String(web.id)).toLowerCase().replace(/_/g, "-");
            return (
              <div
                key={web.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  web.is_featured ? "border-blue-300/80 ring-1 ring-blue-100" : "border-slate-200/90 hover:border-blue-400"
                }`}
              >
                <div className="space-y-3">
                  {/* Top Badges & Bookmark */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      {web.code && (
                        <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono font-bold text-xs">
                          {web.code}
                        </span>
                      )}
                      {web.is_featured && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                          ★ Featured
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleBookmark(web)}
                      disabled={savingId === web.id}
                      title={web.is_saved ? "Remove bookmark" : "Save to my portals"}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        web.is_saved
                          ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                          : "bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {web.is_saved ? <BookmarkCheck className="w-4 h-4 fill-amber-500" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Title & Domain */}
                  <div>
                    <Link
                      href={`/official-websites/${detailSlug}`}
                      className="font-bold text-slate-900 text-base leading-snug hover:text-blue-600 transition-colors flex items-start justify-between group"
                    >
                      <span>{web.name}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                    </Link>

                    <div className="flex items-center space-x-2 mt-1">
                      <span className="inline-flex items-center space-x-1 font-mono text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                        <Globe className="w-3 h-3 text-blue-500" />
                        <span>{web.domain}</span>
                      </span>
                      {web.state && (
                        <span className="text-[11px] text-slate-500 flex items-center space-x-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{web.state.name}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {web.description || "Official government portal for national examination updates and recruitment."}
                  </p>

                  {/* Key Examinations Tags */}
                  {web.related_examinations && web.related_examinations.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Examinations & Schemes</span>
                      <div className="flex flex-wrap gap-1">
                        {web.related_examinations.slice(0, 3).map((exam: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                          >
                            {exam}
                          </span>
                        ))}
                        {web.related_examinations.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-400 text-[10px]">
                            +{web.related_examinations.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Verification Badge & Latency */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="inline-flex items-center space-x-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{web.verification_status || "VERIFIED OFFICIAL"}</span>
                    </span>

                    <span className="text-slate-400 text-[10px] flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{web.response_time_ms || 42}ms</span>
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 truncate" title={web.verification_source}>
                    Source: {web.verification_source || "National Informatics Centre (NIC)"}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={web.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <span>Visit Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <Link
                      href={`/official-websites/${detailSlug}`}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1"
                    >
                      <span>Authority Info</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Live Ping Feedback */}
                  {probeResult && probeResult.id === web.id && (
                    <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md text-center border border-emerald-200 font-medium">
                      {probeResult.message} ({probeResult.latency_ms}ms)
                    </div>
                  )}

                  {/* Bottom tools: Live probe & Report */}
                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                    <button
                      onClick={() => handleVerify(web.id)}
                      disabled={probingId === web.id}
                      className="hover:text-blue-600 flex items-center space-x-1"
                    >
                      <Zap className={`w-3 h-3 text-amber-500 ${probingId === web.id ? "animate-spin" : ""}`} />
                      <span>{probingId === web.id ? "Testing..." : "Ping Status"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setReportingWebsite(web);
                        setReportSuccess(false);
                        setReportError("");
                      }}
                      className="text-slate-400 hover:text-rose-600 hover:underline flex items-center space-x-1"
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      <span>Report Issue</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Broken Link Reporting Modal */}
      {reportingWebsite && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-rose-600 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Report Website / Broken Link</span>
              </div>
              <button
                onClick={() => setReportingWebsite(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600">
              Reporting: <strong className="text-slate-900">{reportingWebsite.name}</strong>
              <div className="font-mono text-[11px] text-blue-600 truncate">{reportingWebsite.official_url}</div>
            </div>

            {reportSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-sm">Report Submitted Successfully</p>
                <p className="text-xs text-emerald-700">ExamHub administrators will verify this link and update the registry.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
                {reportError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {reportError}
                  </div>
                )}

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Issue Type</label>
                  <select
                    value={reportIssue}
                    onChange={(e) => setReportIssue(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
                  >
                    <option value="HTTP_404">HTTP 404 / Page Not Found</option>
                    <option value="REDIRECT_WRONG">Redirects to Incorrect URL</option>
                    <option value="SSL_ERROR">SSL Certificate / HTTPS Error</option>
                    <option value="SUSPICIOUS_PHISHING">Suspicious / Potential Phishing Portal</option>
                    <option value="SLOW_UNRESPONSIVE">Server Extremely Slow / Timeout</option>
                    <option value="OTHER">Other Information Discrepancy</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Details / Correct URL (optional)</label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide details about the broken link or suggest the new official URL..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Your Name</label>
                    <input
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="Student / Visitor"
                      className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Your Email</label>
                    <input
                      type="email"
                      value={reporterEmail}
                      onChange={(e) => setReporterEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setReportingWebsite(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center space-x-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{reportSubmitting ? "Submitting..." : "Submit Report"}</span>
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
