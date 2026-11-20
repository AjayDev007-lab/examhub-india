"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, Award, FileText, CreditCard, ExternalLink, 
  Plus, CheckCircle2, AlertCircle, RefreshCw, LogOut, 
  Send, ShieldCheck, Zap, Globe, Key, Clock, Bell, UserCheck
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function InstitutionDashboardPage() {
  const [instUser, setInstUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview, exams, notices, integration, staff
  const [loading, setLoading] = useState(true);

  // Institution State
  const [institution, setInstitution] = useState<any>({
    id: 1,
    name: "Union Public Service Commission",
    code: "UPSC",
    official_website: "https://upsc.gov.in/",
    result_portal_url: "https://upsc.gov.in/examinations/active-examinations",
    hall_ticket_portal_url: "https://upsconline.nic.in/eadmitcard",
    approval_status: "APPROVED",
    auth_method: "API_KEY",
    integration_methods: ["OFFICIAL_REDIRECT", "OFFICIAL_API"]
  });

  // Notices State
  const [notices, setNotices] = useState<any[]>([
    {
      id: 1,
      title: "Civil Services (Preliminary) Examination 2026 Notification",
      category: "EXAMINATION_NOTIFICATION",
      published_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      official_link: "https://upsc.gov.in/examinations/civil-services-2026",
      status: "PUBLISHED"
    },
    {
      id: 2,
      title: "National Defence Academy & Naval Academy (I) Admit Card Released",
      category: "ADMIT_CARD_ALERT",
      published_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      official_link: "https://upsconline.nic.in/eadmitcard",
      status: "PUBLISHED"
    }
  ]);

  // Exam list
  const [exams, setExams] = useState<any[]>([
    { id: 101, name: "Civil Services Examination 2026", year: "2026", status: "SCHEDULED" },
    { id: 102, name: "NDA & NA Examination (I) 2026", year: "2026", status: "ACTIVE" },
    { id: 103, name: "Combined Defence Services (I) 2026", year: "2026", status: "SCHEDULED" }
  ]);

  // Integration Request State
  const [endpointUrl, setEndpointUrl] = useState("https://upsc.gov.in/api/v1/auth");
  const [authType, setAuthType] = useState("API_KEY");
  const [requestNotes, setRequestNotes] = useState("");
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // New Notice Modal State
  const [newNoticeTitle, setNewNoticeTitle] = useState("");
  const [newNoticeCategory, setNewNoticeCategory] = useState("EXAMINATION_NOTIFICATION");
  const [newNoticeLink, setNewNoticeLink] = useState("");
  const [noticeSubmitting, setNoticeSubmitting] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("examhub_institution_user");
    if (userStr) {
      try {
        setInstUser(JSON.parse(userStr));
      } catch (_) {}
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("examhub_institution_user");
    window.location.href = "/institution/login";
  };

  const handlePublishNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeLink) return;
    setNoticeSubmitting(true);
    setTimeout(() => {
      const newEntry = {
        id: notices.length + 1,
        title: newNoticeTitle,
        category: newNoticeCategory,
        published_at: new Date().toISOString(),
        official_link: newNoticeLink,
        status: "PUBLISHED"
      };
      setNotices([newEntry, ...notices]);
      setNewNoticeTitle("");
      setNewNoticeLink("");
      setNoticeSubmitting(false);
    }, 600);
  };

  const handleIntegrationRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSubmitted(true);
    setTimeout(() => setRequestSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white py-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black">{institution.name}</h1>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                  VERIFIED AUTHORITY
                </span>
              </div>
              <p className="text-xs text-slate-400">Authorized Institution Administration & Integration Portal</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              {instUser?.email || "admin@institution.gov.in"}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto space-x-2 border-b border-slate-200 pb-2 text-xs font-bold">
          {[
            { id: "overview", label: "Overview & Analytics", icon: Building2 },
            { id: "exams", label: "Examinations (3)", icon: Award },
            { id: "notices", label: "Official Announcements", icon: Bell },
            { id: "integration", label: "API & Data Integration", icon: Key },
            { id: "profile", label: "Institutional Profile", icon: Globe }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl flex items-center space-x-2 whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-500 font-semibold block uppercase">Scheduled Exams</span>
                <p className="text-3xl font-black text-slate-900 mt-1">3</p>
                <span className="text-[11px] text-blue-600 font-medium mt-1 inline-block">Active 2026 Cycle</span>
              </div>
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-500 font-semibold block uppercase">Student Inquiries</span>
                <p className="text-3xl font-black text-slate-900 mt-1">24,890</p>
                <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">+18% this month</span>
              </div>
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-500 font-semibold block uppercase">Official Link Clicks</span>
                <p className="text-3xl font-black text-slate-900 mt-1">112,400</p>
                <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">Direct verified redirects</span>
              </div>
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <span className="text-xs text-slate-500 font-semibold block uppercase">Integration Health</span>
                <p className="text-3xl font-black text-emerald-600 mt-1">99.8%</p>
                <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">Avg latency: 44ms</span>
              </div>
            </div>

            {/* Quick Profile Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Verified Institutional Endpoints</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-semibold mb-1">Official Website</span>
                  <a href={institution.official_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono font-medium truncate block">
                    {institution.official_website}
                  </a>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-semibold mb-1">Results Portal</span>
                  <a href={institution.result_portal_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono font-medium truncate block">
                    {institution.result_portal_url}
                  </a>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block font-semibold mb-1">Hall Tickets Portal</span>
                  <a href={institution.hall_ticket_portal_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono font-medium truncate block">
                    {institution.hall_ticket_portal_url}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EXAMINATIONS */}
        {activeTab === "exams" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Institutional Examination Roster</h3>
                <p className="text-xs text-slate-500">Official examinations registered under this institution</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {exams.map((exam) => (
                <div key={exam.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{exam.name}</span>
                    <span className="text-slate-400 font-mono">Cycle: {exam.year}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold">
                    {exam.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: NOTICES & ANNOUNCEMENTS */}
        {activeTab === "notices" && (
          <div className="space-y-6">
            {/* Publish Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Publish Verified Student Announcement</h3>
              <form onSubmit={handlePublishNotice} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Notice Title *</label>
                  <input
                    type="text"
                    required
                    value={newNoticeTitle}
                    onChange={(e) => setNewNoticeTitle(e.target.value)}
                    placeholder="e.g. Combined Medical Services 2026 Admit Card"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Category</label>
                  <select
                    value={newNoticeCategory}
                    onChange={(e) => setNewNoticeCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="EXAMINATION_NOTIFICATION">Examination Notification</option>
                    <option value="ADMIT_CARD_ALERT">Admit Card / Hall Ticket Alert</option>
                    <option value="RESULT_ANNOUNCEMENT">Result / Merit List Published</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Official Portal Link *</label>
                  <input
                    type="url"
                    required
                    value={newNoticeLink}
                    onChange={(e) => setNewNoticeLink(e.target.value)}
                    placeholder="https://upsc.gov.in/notices/..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                  />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={noticeSubmitting}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    {noticeSubmitting ? "Publishing..." : "Publish Announcement"}
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Notices */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Active Published Notices</h3>
              <div className="divide-y divide-slate-100">
                {notices.map((n) => (
                  <div key={n.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{n.title}</span>
                      <a href={n.official_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono text-[11px] truncate block">
                        {n.official_link}
                      </a>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                      {n.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INTEGRATION REQUESTS */}
        {activeTab === "integration" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 max-w-2xl">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Authorized API Integration Configuration</h3>
              <p className="text-xs text-slate-500">
                Request secure direct institutional API connectivity with ExamHub India. Encrypted using AES-256 with zero student-credential leakage.
              </p>
            </div>

            {requestSubmitted && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                Integration request submitted. ExamHub Infrastructure Engineers will review and provision endpoints.
              </div>
            )}

            <form onSubmit={handleIntegrationRequest} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">API Base Endpoint URL</label>
                <input
                  type="url"
                  required
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Authentication Method</label>
                <select
                  value={authType}
                  onChange={(e) => setAuthType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="API_KEY">Institutional API Key / Bearer</option>
                  <option value="OAUTH2">OAuth2 Client Credentials</option>
                  <option value="MUTUAL_TLS">Mutual TLS / Certificate Based</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Technical Implementation Notes</label>
                <textarea
                  rows={3}
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="Rate limits, IP whitelist ranges, or schema documentation..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors text-xs"
              >
                Submit Integration Request
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: PROFILE */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 max-w-xl text-xs">
            <h3 className="font-bold text-slate-900 text-base">Institutional Metadata</h3>
            <div className="space-y-3">
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Organization Legal Name</label>
                <input
                  type="text"
                  readOnly
                  value={institution.name}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-800 font-bold"
                />
              </div>
              <div>
                <label className="text-slate-500 font-semibold block mb-1">State / Central Remit</label>
                <input
                  type="text"
                  readOnly
                  value="Union Government of India (All-India)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-800"
                />
              </div>
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Official Domain</label>
                <input
                  type="text"
                  readOnly
                  value="upsc.gov.in"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono text-slate-800"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
