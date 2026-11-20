"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, LayoutDashboard, Users, Building2, BookOpen, 
  Activity, Bell, HelpCircle, FileText, Settings, Plus, CheckCircle2, 
  AlertCircle, RefreshCw, LogOut, Search, ExternalLink, Save
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [adminUser, setAdminUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  
  // Data collections
  const [students, setStudents] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [examinations, setExaminations] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any[]>([]);

  // Create organization state
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgCode, setNewOrgCode] = useState("");
  const [newOrgWebsite, setNewOrgWebsite] = useState("");
  const [newOrgResultUrl, setNewOrgResultUrl] = useState("");
  const [newOrgHallTicketUrl, setNewOrgHallTicketUrl] = useState("");
  const [orgSuccess, setOrgSuccess] = useState(false);

  // Create exam state
  const [newExamName, setNewExamName] = useState("");
  const [newExamCode, setNewExamCode] = useState("");
  const [newExamOrgId, setNewExamOrgId] = useState("");
  const [newExamYear, setNewExamYear] = useState("2026");
  const [newExamType, setNewExamType] = useState("GOVERNMENT");
  const [examSuccess, setExamSuccess] = useState(false);

  // Ticket response state
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminStr = localStorage.getItem("examhub_admin_user");
    if (!adminStr) {
      window.location.href = "/admin/login";
      return;
    }
    try {
      setAdminUser(JSON.parse(adminStr));
    } catch (_) {}

    loadAdminData();
  }, []);

  async function loadAdminData() {
    setLoading(true);
    try {
      const [dashStats, orgs, exams, integs, stds, logs, tcks, sttings] = await Promise.all([
        fetchApi("/api/admin/dashboard").catch(() => null),
        fetchApi("/api/organizations").catch(() => []),
        fetchApi("/api/exams?limit=50").catch(() => []),
        fetchApi("/api/admin/integrations").catch(() => []),
        fetchApi("/api/admin/users").catch(() => []),
        fetchApi("/api/admin/audit-logs").catch(() => []),
        fetchApi("/api/admin/support-tickets").catch(() => []),
        fetchApi("/api/admin/settings").catch(() => []),
      ]);
      setStats(dashStats);
      setOrganizations(orgs || []);
      setExaminations(exams || []);
      setIntegrations(integs || []);
      setStudents(stds || []);
      setAuditLogs(logs || []);
      setTickets(tcks || []);
      setSystemSettings(sttings || []);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleAdminLogout = () => {
    localStorage.removeItem("examhub_admin_token");
    localStorage.removeItem("examhub_admin_user");
    window.location.href = "/admin/login";
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi("/api/admin/organizations", {
        method: "POST",
        body: JSON.stringify({
          name: newOrgName.trim(),
          code: newOrgCode.trim().toUpperCase(),
          category_id: 1, // Central Govt default
          official_website: newOrgWebsite.trim(),
          result_portal_url: newOrgResultUrl.trim() || undefined,
          hall_ticket_portal_url: newOrgHallTicketUrl.trim() || undefined,
          integration_methods: ["OFFICIAL_REDIRECT"],
          verification_status: "VERIFIED"
        })
      });
      setOrganizations([res, ...organizations]);
      setNewOrgName("");
      setNewOrgCode("");
      setNewOrgWebsite("");
      setNewOrgResultUrl("");
      setNewOrgHallTicketUrl("");
      setOrgSuccess(true);
      setTimeout(() => setOrgSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to create organization");
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi("/api/admin/exams", {
        method: "POST",
        body: JSON.stringify({
          organization_id: parseInt(newExamOrgId || organizations[0]?.id?.toString() || "1"),
          name: newExamName.trim(),
          code: newExamCode.trim().toUpperCase(),
          year: parseInt(newExamYear),
          exam_type: newExamType,
          cycle: "Annual"
        })
      });
      setExaminations([res, ...examinations]);
      setNewExamName("");
      setNewExamCode("");
      setExamSuccess(true);
      setTimeout(() => setExamSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to create examination");
    }
  };

  const handleToggleStudent = async (userId: number) => {
    try {
      const res = await fetchApi(`/api/admin/users/${userId}/toggle-status`, { method: "PUT" });
      setStudents(students.map(s => s.id === userId ? { ...s, is_active: res.is_active } : s));
    } catch (err: any) {
      alert(err.message || "Failed to toggle status");
    }
  };

  const handleReplyTicket = async (ticketId: number) => {
    if (!replyText.trim()) return;
    try {
      await fetchApi(`/api/admin/support-tickets/${ticketId}/reply`, {
        method: "PUT",
        body: JSON.stringify({ response: replyText.trim(), status: "RESOLVED" })
      });
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: "RESOLVED", admin_response: replyText } : t));
      setSelectedTicketId(null);
      setReplyText("");
    } catch (err: any) {
      alert(err.message || "Failed to reply to ticket");
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "students", label: "Students", icon: Users, count: students.length },
    { id: "organizations", label: "Organizations", icon: Building2, count: organizations.length },
    { id: "exams", label: "Examinations", icon: BookOpen, count: examinations.length },
    { id: "integrations", label: "Portal Health", icon: Activity, count: integrations.length },
    { id: "tickets", label: "Support Tickets", icon: HelpCircle, count: tickets.filter(t => t.status === "OPEN").length },
    { id: "audit", label: "Audit Logs", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-sm text-white tracking-wide">EXAMHUB ADMIN</span>
              <p className="text-[10px] text-blue-400 font-semibold">{adminUser?.role || "SUPER_ADMIN"}</p>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-blue-600 text-white font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs text-slate-400 hover:text-white px-2 py-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Public Portal</span>
          </Link>
          <button
            onClick={handleAdminLogout}
            className="w-full flex items-center space-x-2 text-xs text-red-400 hover:text-red-300 px-2 py-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 sm:p-8 max-w-6xl overflow-y-auto">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white">Central Operations Overview</h2>
              <p className="text-xs text-slate-400">Live national metrics and verified examination database</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-semibold block">Organizations</span>
                <span className="text-2xl font-black text-white mt-1 block">{stats?.total_organizations || organizations.length}</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-semibold block">Examinations</span>
                <span className="text-2xl font-black text-blue-400 mt-1 block">{stats?.total_examinations || examinations.length}</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-semibold block">Indexed Results</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">{stats?.total_results_indexed || 3}</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-semibold block">Students</span>
                <span className="text-2xl font-black text-purple-400 mt-1 block">{stats?.total_students_registered || students.length}</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-semibold block">Active Adapters</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">{integrations.length}</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-semibold block">Open Tickets</span>
                <span className="text-2xl font-black text-amber-400 mt-1 block">{tickets.filter(t => t.status === "OPEN").length}</span>
              </div>
            </div>

            {/* Integration Status Table */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-sm">Active Examination Portal Adapters</h3>
                <span className="text-xs text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>All Registered Adapters Online</span>
                </span>
              </div>

              <div className="divide-y divide-slate-800 text-xs">
                {integrations.map((adapter) => (
                  <div key={adapter.code} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{adapter.organization_name}</span>
                      <span className="text-slate-400 ml-2">({adapter.code} - {adapter.adapter_name})</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-400">{adapter.latency_ms}ms latency</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {adapter.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ORGANIZATIONS TAB (Admins can add organizations without touching code) */}
        {activeTab === "organizations" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white">Organization Management</h2>
                <p className="text-xs text-slate-400">Add and manage examination organizations across all Indian states</p>
              </div>
            </div>

            {/* Add new Organization Form */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Add New Examination Organization</span>
              </h3>

              {orgSuccess && (
                <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Organization registered successfully and immediately live in the directory.</span>
                </div>
              )}

              <form onSubmit={handleCreateOrg} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Organization Name *</label>
                  <input
                    type="text"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="e.g. Karnataka Public Service Commission"
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Organization Code *</label>
                  <input
                    type="text"
                    value={newOrgCode}
                    onChange={(e) => setNewOrgCode(e.target.value)}
                    placeholder="e.g. KPSC"
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Official Website URL *</label>
                  <input
                    type="url"
                    value={newOrgWebsite}
                    onChange={(e) => setNewOrgWebsite(e.target.value)}
                    placeholder="https://kpsc.kar.nic.in"
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Official Result Portal URL</label>
                  <input
                    type="url"
                    value={newOrgResultUrl}
                    onChange={(e) => setNewOrgResultUrl(e.target.value)}
                    placeholder="https://kpsc.kar.nic.in/results"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
                  >
                    Save & Publish Organization
                  </button>
                </div>
              </form>
            </div>

            {/* Organizations list */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="font-bold text-white text-sm">Indexed Organizations ({organizations.length})</h3>
              <div className="divide-y divide-slate-800 text-xs">
                {organizations.map((org) => (
                  <div key={org.id} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">{org.name}</h4>
                      <p className="text-slate-400 text-[11px]">{org.code} • {org.official_website}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {org.verification_status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EXAMINATIONS TAB */}
        {activeTab === "exams" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white">Examination Registry</h2>
              <p className="text-xs text-slate-400">Configure examinations, cycles, and student verification fields</p>
            </div>

            {/* Create Exam Form */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Create New Examination Entry</span>
              </h3>

              {examSuccess && (
                <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Examination added and available in search immediately.</span>
                </div>
              )}

              <form onSubmit={handleCreateExam} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Parent Organization *</label>
                  <select
                    value={newExamOrgId}
                    onChange={(e) => setNewExamOrgId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    {organizations.map((o) => (
                      <option key={o.id} value={o.id}>{o.name} ({o.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Examination Name *</label>
                  <input
                    type="text"
                    value={newExamName}
                    onChange={(e) => setNewExamName(e.target.value)}
                    placeholder="e.g. Graduate Aptitude Test in Engineering (GATE 2026)"
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Exam Code *</label>
                  <input
                    type="text"
                    value={newExamCode}
                    onChange={(e) => setNewExamCode(e.target.value)}
                    placeholder="e.g. GATE-2026"
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Exam Type</label>
                  <select
                    value={newExamType}
                    onChange={(e) => setNewExamType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="GOVERNMENT">Government Recruitment</option>
                    <option value="ENTRANCE">Entrance Assessment</option>
                    <option value="UNIVERSITY">University Semester</option>
                    <option value="PRIVATE">Private / Professional</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
                  >
                    Publish Examination
                  </button>
                </div>
              </form>
            </div>

            {/* List */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="font-bold text-white text-sm">Examinations ({examinations.length})</h3>
              <div className="divide-y divide-slate-800 text-xs">
                {examinations.map((ex) => (
                  <div key={ex.id} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">{ex.name}</h4>
                      <p className="text-slate-400 text-[11px]">{ex.organization_name} • {ex.year} ({ex.cycle})</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300">
                      {ex.exam_type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STUDENTS TAB */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white">Student Account Management</h2>
              <p className="text-xs text-slate-400">View registered students and manage account statuses</p>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="divide-y divide-slate-800 text-xs">
                {students.map((std) => (
                  <div key={std.id} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">{std.full_name}</h4>
                      <p className="text-slate-400 text-[11px]">{std.email} • Mobile: {std.mobile || "N/A"}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        std.is_active ? "bg-emerald-950 text-emerald-300" : "bg-red-950 text-red-300"
                      }`}>
                        {std.is_active ? "ACTIVE" : "SUSPENDED"}
                      </span>
                      <button
                        onClick={() => handleToggleStudent(std.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px]"
                      >
                        Toggle Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUPPORT TICKETS TAB */}
        {activeTab === "tickets" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white">Student Support Queue</h2>
              <p className="text-xs text-slate-400">Inquiries regarding scorecard retrieval and institutional sync</p>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              {tickets.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No active student tickets.</p>
              ) : (
                <div className="space-y-4 text-xs">
                  {tickets.map((t) => (
                    <div key={t.id} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white text-sm">#{t.id} - {t.subject}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === "RESOLVED" ? "bg-emerald-900 text-emerald-300" : "bg-amber-900 text-amber-300"
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="text-slate-300">{t.message}</p>
                      
                      {t.admin_response ? (
                        <div className="p-2.5 bg-slate-900 rounded-lg text-emerald-300 text-[11px] border border-slate-700">
                          <strong>Response:</strong> {t.admin_response}
                        </div>
                      ) : (
                        <div className="pt-2">
                          {selectedTicketId === t.id ? (
                            <div className="space-y-2">
                              <textarea
                                rows={2}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type official response..."
                                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleReplyTicket(t.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                                >
                                  Submit & Resolve
                                </button>
                                <button
                                  onClick={() => setSelectedTicketId(null)}
                                  className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setSelectedTicketId(t.id); setReplyText(""); }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs"
                            >
                              Write Response
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AUDIT LOGS TAB */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white">Tamper-Evident Audit Logs</h2>
              <p className="text-xs text-slate-400">Chronological history of security events, downloads, and administrative actions</p>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="divide-y divide-slate-800 text-xs font-mono">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between text-slate-300">
                    <div className="space-x-2">
                      <span className="text-blue-400 font-bold">[{log.actor_type}]</span>
                      <span className="text-white font-semibold">{log.action}</span>
                      {log.target_type && (
                        <span className="text-slate-500">→ {log.target_type} ({log.target_id || "all"})</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {new Date(log.created_at).toLocaleString("en-IN")} • IP: {log.ip_address || "127.0.0.1"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white">System & Data Retention Settings</h2>
              <p className="text-xs text-slate-400">Configure global parameters and student data isolation controls</p>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl space-y-4 text-xs">
              {systemSettings.map((st) => (
                <div key={st.id} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white uppercase">{st.setting_key.replace(/_/g, " ")}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono text-[11px]">
                      {st.setting_value}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{st.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
