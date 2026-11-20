"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Train, ShieldCheck, ArrowLeft, Plus, ExternalLink, CheckCircle, 
  AlertTriangle, Clock, Eye, FileText, Check, X, RefreshCw, Filter, Search
} from "lucide-react";
import { fetchApi } from "@/lib/api";

const RRB_ZONES = [
  { code: "ALL_ZONES", name: "All 21 Railway Zones (Centralized)" },
  { code: "RRB_AHMEDABAD", name: "RRB Ahmedabad (Western Railway)" },
  { code: "RRB_AJMER", name: "RRB Ajmer (North Western Railway)" },
  { code: "RRB_ALLAHABAD", name: "RRB Allahabad / Prayagraj (North Central Railway)" },
  { code: "RRB_BANGALORE", name: "RRB Bangalore (South Western Railway)" },
  { code: "RRB_BHOPAL", name: "RRB Bhopal (West Central Railway)" },
  { code: "RRB_BHUBANESWAR", name: "RRB Bhubaneswar (East Coast Railway)" },
  { code: "RRB_BILASPUR", name: "RRB Bilaspur (South East Central Railway)" },
  { code: "RRB_CHANDIGARH", name: "RRB Chandigarh (Northern Railway)" },
  { code: "RRB_CHENNAI", name: "RRB Chennai (Southern Railway)" },
  { code: "RRB_GORAKHPUR", name: "RRB Gorakhpur (North Eastern Railway)" },
  { code: "RRB_GUWAHATI", name: "RRB Guwahati (Northeast Frontier Railway)" },
  { code: "RRB_JAMMU", name: "RRB Jammu-Srinagar" },
  { code: "RRB_KOLKATA", name: "RRB Kolkata (Eastern Railway)" },
  { code: "RRB_MALDA", name: "RRB Malda (Eastern / NF Railway)" },
  { code: "RRB_MUMBAI", name: "RRB Mumbai (Central / Western Railway)" },
  { code: "RRB_MUZAFFARPUR", name: "RRB Muzaffarpur (East Central Railway)" },
  { code: "RRB_PATNA", name: "RRB Patna (East Central Railway)" },
  { code: "RRB_RANCHI", name: "RRB Ranchi (South Eastern Railway)" },
  { code: "RRB_SECUNDERABAD", name: "RRB Secunderabad (South Central Railway)" },
  { code: "RRB_SILIGURI", name: "RRB Siliguri (Northeast Frontier Railway)" },
  { code: "RRB_THIRUVANANTHAPURAM", name: "RRB Thiruvananthapuram (Southern Railway)" }
];

export default function RRBGroupDAdminPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCen, setFilterCen] = useState("ALL");
  const [filterZone, setFilterZone] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cenNumber, setCenNumber] = useState("CEN RRC-01/2026");
  const [title, setTitle] = useState("Level 1 Posts (Group D) - 7th CPC Matrix");
  const [zoneCode, setZoneCode] = useState("ALL_ZONES");
  const [vacancies, setVacancies] = useState("50000");
  const [officialUrl, setOfficialUrl] = useState("https://indianrailways.gov.in");
  const [scorecardUrl, setScorecardUrl] = useState("");
  const [meritPdf, setMeritPdf] = useState("");
  const [cutoffPdf, setCutoffPdf] = useState("");
  const [petUrl, setPetUrl] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Preview Modal
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  useEffect(() => {
    loadResults();
  }, [filterCen, filterZone, filterStatus]);

  async function loadResults() {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filterCen !== "ALL") query.append("cen", filterCen);
      if (filterZone !== "ALL") query.append("zone", filterZone);
      if (filterStatus !== "ALL") query.append("status", filterStatus);

      const res = await fetchApi(`/api/admin/rrb-group-d?${query.toString()}`);
      setResults(res.results || []);
    } catch (err: any) {
      console.error("Failed to load RRB results:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    const selectedZoneObj = RRB_ZONES.find(z => z.code === zoneCode);

    try {
      const payload = {
        cen_number: cenNumber.trim(),
        title: title.trim(),
        zone_code: zoneCode,
        zone_name: selectedZoneObj ? selectedZoneObj.name : "Indian Railways Zone",
        vacancies_count: Number(vacancies) || 0,
        official_portal_url: officialUrl.trim(),
        scorecard_url: scorecardUrl.trim() || undefined,
        merit_list_pdf_url: meritPdf.trim() || undefined,
        cutoff_marks_pdf_url: cutoffPdf.trim() || undefined,
        pet_instructions_url: petUrl.trim() || undefined,
        status: status,
        verification_source: "Railway Recruitment Control Board / Official RRB Portal"
      };

      const res = await fetchApi("/api/admin/rrb-group-d", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setResults([res, ...results]);
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create RRB recruitment record");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusTransition = async (id: number, nextStatus: string) => {
    try {
      const res = await fetchApi("/api/admin/rrb-group-d", {
        method: "PUT",
        body: JSON.stringify({ id, status: nextStatus })
      });
      setResults(results.map(r => r.id === id ? res : r));
    } catch (err: any) {
      alert("Status transition failed: " + err.message);
    }
  };

  const filteredList = results.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.cen_number.toLowerCase().includes(q) ||
      r.zone_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      {/* Header Breadcrumbs */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Link href="/admin/dashboard" className="hover:text-white flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Admin Dashboard</span>
              </Link>
              <span>/</span>
              <span className="text-blue-400 font-semibold">Results</span>
              <span>/</span>
              <span className="text-slate-200">RRB Group D Control</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30">
                <Train className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">RRB Group D Result & Recruitment Hub</h1>
                <p className="text-xs text-slate-400">Centralized governance for CEN cycles, 21 regional zones, scorecards, merit lists & PET</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadResults}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New CEN Recruitment Cycle</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search CEN, title or zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filterCen}
            onChange={(e) => setFilterCen(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All CEN Cycles</option>
            <option value="CEN RRC-01/2019">CEN RRC-01/2019</option>
            <option value="CEN RRC-02/2026">CEN RRC-02/2026</option>
          </select>

          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All 21 Regional Zones</option>
            {RRB_ZONES.map(z => (
              <option key={z.code} value={z.code}>{z.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Workflow Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="APPROVED">Approved</option>
            <option value="PUBLISHED">Published (Live)</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Roster Cards */}
        <div className="space-y-4">
          {filteredList.map((item) => {
            const isLive = item.status === "PUBLISHED";
            return (
              <div 
                key={item.id} 
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all space-y-4 shadow-sm"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-orange-500/20 text-orange-400 text-[10px] font-bold border border-orange-500/30">
                        {item.cen_number}
                      </span>
                      <h3 className="text-base font-bold text-white tracking-tight">{item.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === "PUBLISHED" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                        item.status === "APPROVED" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                        item.status === "PENDING_VERIFICATION" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                        "bg-slate-800 text-slate-400"
                      }`}>
                        {item.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center space-x-3">
                      <span className="text-slate-300 font-semibold">{item.zone_name}</span>
                      <span>•</span>
                      <span>Vacancies: <strong className="text-slate-200">{item.vacancies_count?.toLocaleString() || "N/A"}</strong></span>
                      <span>•</span>
                      <span>Views: <strong className="text-slate-200">{item.view_count || 0}</strong></span>
                    </div>
                  </div>

                  {/* Actions & Workflow Transition */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    {item.status === "DRAFT" && (
                      <button
                        onClick={() => handleStatusTransition(item.id, "PENDING_VERIFICATION")}
                        className="px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Submit for Verification</span>
                      </button>
                    )}

                    {item.status === "PENDING_VERIFICATION" && (
                      <button
                        onClick={() => handleStatusTransition(item.id, "APPROVED")}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Result</span>
                      </button>
                    )}

                    {item.status === "APPROVED" && (
                      <button
                        onClick={() => handleStatusTransition(item.id, "PUBLISHED")}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Publish to Live Portal</span>
                      </button>
                    )}

                    {item.status === "PUBLISHED" && (
                      <button
                        onClick={() => handleStatusTransition(item.id, "ARCHIVED")}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-medium transition-colors"
                      >
                        <span>Archive</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Direct Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <a
                    href={item.official_portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-300 flex items-center justify-between transition-colors"
                  >
                    <span className="truncate">Official RRB Portal</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 shrink-0 ml-1" />
                  </a>

                  {item.scorecard_url ? (
                    <a
                      href={item.scorecard_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 border border-blue-900/50 flex items-center justify-between transition-colors"
                    >
                      <span className="truncate font-semibold">CBT Scorecard Login</span>
                      <ExternalLink className="w-3 h-3 text-blue-400 shrink-0 ml-1" />
                    </a>
                  ) : (
                    <span className="p-2 rounded-xl bg-slate-950/30 text-slate-500">Scorecard: Not Released</span>
                  )}

                  {item.merit_list_pdf_url ? (
                    <a
                      href={item.merit_list_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-900/50 flex items-center justify-between transition-colors"
                    >
                      <span className="truncate font-semibold">Zone Merit List PDF</span>
                      <ExternalLink className="w-3 h-3 text-emerald-400 shrink-0 ml-1" />
                    </a>
                  ) : (
                    <span className="p-2 rounded-xl bg-slate-950/30 text-slate-500">Merit List: Pending</span>
                  )}

                  {item.cutoff_marks_pdf_url ? (
                    <a
                      href={item.cutoff_marks_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-900/50 flex items-center justify-between transition-colors"
                    >
                      <span className="truncate font-semibold">Cutoff Marks PDF</span>
                      <ExternalLink className="w-3 h-3 text-purple-400 shrink-0 ml-1" />
                    </a>
                  ) : (
                    <span className="p-2 rounded-xl bg-slate-950/30 text-slate-500">Cutoffs: Pending</span>
                  )}
                </div>

                {item.admin_notes && (
                  <p className="text-[11px] text-slate-400 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <strong className="text-slate-300 font-semibold">Admin Verification Note: </strong>
                    {item.admin_notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Train className="w-5 h-5 text-orange-400" />
                Register RRB Group D Recruitment / Result
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">CEN Notification Number *</label>
                  <input
                    type="text"
                    required
                    value={cenNumber}
                    onChange={(e) => setCenNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. CEN RRC-01/2019"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">RRB Regional Zone *</label>
                  <select
                    value={zoneCode}
                    onChange={(e) => setZoneCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {RRB_ZONES.map(z => (
                      <option key={z.code} value={z.code}>{z.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Recruitment Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Level 1 Posts (Track Maintainer, Pointsman)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Vacancies Count</label>
                  <input
                    type="number"
                    value={vacancies}
                    onChange={(e) => setVacancies(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING_VERIFICATION">Pending Verification</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Official RRB Portal URL *</label>
                <input
                  type="url"
                  required
                  value={officialUrl}
                  onChange={(e) => setOfficialUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://www.rrbchennai.gov.in"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Official Scorecard Digialm / Candidate Portal URL</label>
                <input
                  type="url"
                  value={scorecardUrl}
                  onChange={(e) => setScorecardUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://rrb.digialm.com/..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Merit List PDF URL</label>
                  <input
                    type="url"
                    value={meritPdf}
                    onChange={(e) => setMeritPdf(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="https://.../merit-list.pdf"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Cutoff Marks PDF URL</label>
                  <input
                    type="url"
                    value={cutoffPdf}
                    onChange={(e) => setCutoffPdf(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="https://.../cutoffs.pdf"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Physical Efficiency Test (PET) Schedule URL</label>
                <input
                  type="url"
                  value={petUrl}
                  onChange={(e) => setPetUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://.../pet-schedule.html"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                Live Student Portal Preview
              </h2>
              <button onClick={() => setPreviewItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">
                  {previewItem.cen_number}
                </span>
                <span className="text-slate-400">{previewItem.zone_name}</span>
              </div>
              <h3 className="text-base font-bold text-white">{previewItem.title}</h3>
              <p className="text-slate-400">Total Approved Posts: {previewItem.vacancies_count?.toLocaleString()}</p>
              
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <p className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Source: {previewItem.verification_source}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {previewItem.scorecard_url && (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-600/30 text-blue-300 font-semibold">
                      Candidate Scorecard Available
                    </span>
                  )}
                  {previewItem.merit_list_pdf_url && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600/30 text-emerald-300 font-semibold">
                      Official Merit PDF Attached
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
