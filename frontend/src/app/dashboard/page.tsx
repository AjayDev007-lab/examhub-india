"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, Award, FileText, CreditCard, FolderArchive, 
  Calendar, Bell, History, User, HelpCircle, Settings, Building2, 
  Download, Eye, Trash2, CheckCircle2, ShieldCheck, RefreshCw, AlertCircle, Plus, Send
} from "lucide-react";
import { fetchApi, getFileUrl } from "@/lib/api";

export default function StudentDashboardPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("RESULT_ISSUE");
  const [ticketMsg, setTicketMsg] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("examhub_user");
    if (!userStr) {
      window.location.href = "/auth/login";
      return;
    }
    try {
      setCurrentUser(JSON.parse(userStr));
    } catch (_) {}

    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [docs, notifs, tickets, exList, annList] = await Promise.all([
        fetchApi("/api/documents").catch(() => []),
        fetchApi("/api/notifications").catch(() => []),
        fetchApi("/api/support").catch(() => []),
        fetchApi("/api/exams?limit=12").catch(() => []),
        fetchApi("/api/announcements").catch(() => []),
      ]);
      setDocuments(docs || []);
      setNotifications(notifs || []);
      setSupportTickets(tickets || []);
      setExams(exList || []);
      setAnnouncements(annList || []);
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

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "results", label: "Check Results", icon: Award },
    { id: "gov_exams", label: "Government Exams", icon: Building2 },
    { id: "univ_exams", label: "University Exams", icon: Building2 },
    { id: "hall_tickets", label: "Hall Tickets", icon: FileText },
    { id: "id_cards", label: "Student ID Cards", icon: CreditCard },
    { id: "documents", label: "My Documents", icon: FolderArchive, count: documents.length },
    { id: "upcoming", label: "Upcoming Exams", icon: Calendar },
    { id: "notifications", label: "Result Notifications", icon: Bell, count: notifications.filter(n => !n.is_read).length },
    { id: "profile", label: "Profile", icon: User },
    { id: "support", label: "Support", icon: HelpCircle },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-primary-950 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div className="p-4 space-y-6">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              {currentUser?.full_name?.charAt(0) || "S"}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-white text-sm truncate">{currentUser?.full_name}</h3>
              <p className="text-[11px] text-emerald-400 font-medium">Verified Student</p>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-blue-600 text-white font-bold shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      isActive ? "bg-white text-blue-700" : "bg-blue-900 text-blue-200"
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DPDP Encrypted Vault</span>
          </div>
          <p>Personal isolation enabled.</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-6xl">
        {/* SECTION 1: OVERVIEW */}
        {activeSection === "overview" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Student Dashboard Overview</h2>
              <p className="text-xs text-slate-500">Welcome back, {currentUser?.full_name}. Here is your academic vault status.</p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold block">Total Saved Documents</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{documents.length}</span>
                <span className="text-[10px] text-emerald-700 font-medium">In private storage</span>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold block">Available Scorecards</span>
                <span className="text-2xl font-black text-blue-700 mt-1 block">
                  {documents.filter(d => d.document_type_code === "RESULT_SCORECARD").length}
                </span>
                <span className="text-[10px] text-blue-600 font-medium">Verified PDF statements</span>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold block">Admit Cards Held</span>
                <span className="text-2xl font-black text-emerald-700 mt-1 block">
                  {documents.filter(d => d.document_type_code === "HALL_TICKET").length}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">Active entry passes</span>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold block">Student ID Cards</span>
                <span className="text-2xl font-black text-purple-700 mt-1 block">
                  {documents.filter(d => d.document_type_code === "STUDENT_ID_CARD").length}
                </span>
                <span className="text-[10px] text-purple-600 font-medium">Verified credentials</span>
              </div>
            </div>

            {/* Recent Documents Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-sm">Recently Archived Documents</h3>
                <button onClick={() => setActiveSection("documents")} className="text-xs text-blue-600 font-semibold hover:underline">
                  View All Documents →
                </button>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <FolderArchive className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>Your vault is empty. Check a result or download a hall ticket to save it here automatically.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {documents.slice(0, 5).map((doc) => (
                    <div key={doc.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{doc.title}</h4>
                          <span className="text-[11px] text-slate-400">
                            {doc.document_type_name} • {(doc.file_size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {doc.preview_url && (
                          <a
                            href={getFileUrl(doc.preview_url)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                            title="Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <a
                          href={getFileUrl(doc.download_url)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-lg flex items-center space-x-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/results"
                className="p-5 bg-gradient-to-br from-blue-900 to-blue-800 text-white rounded-2xl shadow-sm hover:scale-[1.01] transition-transform space-y-2"
              >
                <Award className="w-6 h-6 text-amber-300" />
                <h4 className="font-bold text-base">Check Examination Result</h4>
                <p className="text-xs text-blue-200">Retrieve marksheet from UPSC, SSC, NEET or University</p>
              </Link>
              <Link
                href="/hall-tickets"
                className="p-5 bg-gradient-to-br from-emerald-900 to-emerald-800 text-white rounded-2xl shadow-sm hover:scale-[1.01] transition-transform space-y-2"
              >
                <FileText className="w-6 h-6 text-emerald-300" />
                <h4 className="font-bold text-base">Download Hall Ticket</h4>
                <p className="text-xs text-emerald-200">Print authorized e-admit card and verify center allotment</p>
              </Link>
              <Link
                href="/id-cards"
                className="p-5 bg-gradient-to-br from-purple-900 to-purple-800 text-white rounded-2xl shadow-sm hover:scale-[1.01] transition-transform space-y-2"
              >
                <CreditCard className="w-6 h-6 text-purple-300" />
                <h4 className="font-bold text-base">Retrieve Student ID Card</h4>
                <p className="text-xs text-purple-200">Sync digital credentials or upload physical card scan</p>
              </Link>
            </div>
          </div>
        )}

        {/* SECTION 7: MY DOCUMENTS (Personal Document Vault) */}
        {activeSection === "documents" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Personal Document Library</h2>
                <p className="text-xs text-slate-500">Private encrypted storage for all your educational records</p>
              </div>
              <Link
                href="/id-cards"
                className="px-3.5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New Scan</span>
              </Link>
            </div>

            {documents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
                <FolderArchive className="w-12 h-12 mx-auto text-slate-300" />
                <h3 className="font-bold text-slate-800 text-base">No Saved Documents Yet</h3>
                <p className="text-xs max-w-sm mx-auto">
                  When you check results, download hall tickets, or upload your ID cards, select "Save to Vault" to retain them here indefinitely.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 uppercase">
                          {doc.document_type_code.replace(/_/g, " ")}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(doc.created_at).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{doc.title}</h3>
                      <p className="text-[11px] text-slate-500">
                        File: {doc.original_filename} • {(doc.file_size / 1024).toFixed(1)} KB
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        {doc.preview_url && (
                          <a
                            href={getFileUrl(doc.preview_url)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </a>
                        )}
                        <a
                          href={getFileUrl(doc.download_url)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg flex items-center space-x-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>

                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Remove Document"
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

        {/* SECTION 9: NOTIFICATIONS */}
        {activeSection === "notifications" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Result Notifications & Bulletins</h2>
              <p className="text-xs text-slate-500">Direct notifications about newly declared results and release schedules</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>You have no unread notifications.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="py-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded">
                        {n.notification_type}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(n.created_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                    <p className="text-xs text-slate-600">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SECTION 11: SUPPORT TICKETS */}
        {activeSection === "support" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Student Technical Assistance</h2>
              <p className="text-xs text-slate-500">Submit an inquiry regarding scorecard retrieval, hall tickets, or portal access</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Open Support Ticket</h3>
                {ticketSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Ticket created successfully. Our team will review your inquiry.</span>
                  </div>
                )}
                <form onSubmit={handleCreateTicket} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject</label>
                    <input
                      type="text"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="e.g. Issue retrieving NEET 2026 scorecard"
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 text-slate-700"
                    >
                      <option value="RESULT_ISSUE">Result Retrieval Issue</option>
                      <option value="HALL_TICKET_ISSUE">Hall Ticket Download Issue</option>
                      <option value="ID_CARD_ISSUE">Student ID Card Issue</option>
                      <option value="PORTAL_DOWN">Institution Portal Unavailable</option>
                      <option value="OTHER">Other Assistance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Message</label>
                    <textarea
                      rows={4}
                      value={ticketMsg}
                      onChange={(e) => setTicketMsg(e.target.value)}
                      placeholder="Please include exam roll number, error message, and institution name..."
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Inquiry</span>
                  </button>
                </form>
              </div>

              {/* Existing tickets */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Your Ticket History</h3>
                {supportTickets.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No active support tickets.</p>
                ) : (
                  <div className="space-y-3">
                    {supportTickets.map((t) => (
                      <div key={t.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">#{t.id} - {t.subject}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.status === "RESOLVED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {t.status}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{t.message}</p>
                        {t.admin_response && (
                          <div className="mt-2 p-2 rounded bg-blue-50 text-blue-900 text-[11px] border border-blue-100">
                            <strong>Admin Response:</strong> {t.admin_response}
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

        {/* SECTION 10: PROFILE & SETTINGS */}
        {(activeSection === "profile" || activeSection === "settings") && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Account Profile & Data Retention</h2>
              <p className="text-xs text-slate-500">Manage your credentials, notification preferences, and privacy controls</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-xl space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block">Full Name</span>
                <span className="font-bold text-slate-900 text-sm">{currentUser?.full_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Registered Email</span>
                <span className="font-bold text-slate-900 text-sm">{currentUser?.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Registered Mobile</span>
                <span className="font-bold text-slate-900 text-sm">{currentUser?.mobile || "Not Linked"}</span>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <span className="text-slate-500 block">Data Privacy Standard</span>
                <p className="text-slate-700 mt-1">
                  Compliant with Digital Personal Data Protection (DPDP). Your documents are encrypted and never accessible to other students or unauthorized third parties.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Fallback for other directory shortcuts */}
        {["gov_exams", "univ_exams", "results", "hall_tickets", "id_cards", "upcoming"].includes(activeSection) && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Examinations & Schedules</h2>
                <p className="text-xs text-slate-500">Live indexed examination entries across India</p>
              </div>
              <Link href="/directory" className="text-xs text-blue-600 font-semibold hover:underline">
                Open Directory →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map((ex) => (
                <div key={ex.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded">
                      {ex.organization_code} • {ex.year}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{ex.name}</h4>
                    <p className="text-xs text-slate-500">{ex.organization_name}</p>
                  </div>
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 text-xs font-semibold">
                    <Link href={`/results?exam_id=${ex.id}`} className="text-blue-700 hover:underline">
                      Check Results
                    </Link>
                    <span>•</span>
                    <Link href={`/hall-tickets?exam_id=${ex.id}`} className="text-emerald-700 hover:underline">
                      Admit Card
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
