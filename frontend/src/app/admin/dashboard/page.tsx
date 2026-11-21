"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, LayoutDashboard, Users, Building2, BookOpen, 
  Activity, Bell, HelpCircle, FileText, Settings, Plus, CheckCircle2, 
  AlertCircle, RefreshCw, LogOut, Search, ExternalLink, Save,
  Check, X, Lock, Key, Wifi, WifiOff, Clock, Trash2, Edit3, Eye,
  History, Globe, Server, CheckCircle, AlertTriangle, ChevronRight, Zap,
  Train, GraduationCap, Award, Bot, CreditCard, ShieldAlert, Sliders, DollarSign, Download, Briefcase, BarChart3, Database
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("institutions");
  const [adminUser, setAdminUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  
  // Data collections
  const [students, setStudents] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [examinations, setExaminations] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);

  // Additional Enterprise State Collections
  const [rrbList, setRrbList] = useState<any[]>([]);
  const [aiConfig, setAiConfig] = useState<any>(null);
  const [securityData, setSecurityData] = useState<any>(null);
  const [scholarshipsList, setScholarshipsList] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentFilterStatus, setStudentFilterStatus] = useState("ALL");

  // Official Directory & Broken Link States
  const [directoryWebsites, setDirectoryWebsites] = useState<any[]>([]);
  const [brokenReports, setBrokenReports] = useState<any[]>([]);
  const [dirSearch, setDirSearch] = useState("");
  const [dirCatFilter, setDirCatFilter] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState("");
  const [dirSubView, setDirSubView] = useState<"websites" | "reports">("websites");
  const [probingWebId, setProbingWebId] = useState<number | null>(null);
  const [webProbeMsg, setWebProbeMsg] = useState<{ id: number; msg: string } | null>(null);

  // Add Directory Website Modal State
  const [isAddWebModalOpen, setIsAddWebModalOpen] = useState(false);
  const [newWebName, setNewWebName] = useState("");
  const [newWebCode, setNewWebCode] = useState("");
  const [newWebCategory, setNewWebCategory] = useState("CENTRAL_RECRUITMENT");
  const [newWebStateId, setNewWebStateId] = useState("");
  const [newWebOfficialUrl, setNewWebOfficialUrl] = useState("");
  const [newWebAppUrl, setNewWebAppUrl] = useState("");
  const [newWebDomain, setNewWebDomain] = useState("");
  const [newWebDesc, setNewWebDesc] = useState("");
  const [newWebSource, setNewWebSource] = useState("National Portal of India / Official Gazette");
  const [newWebFeatured, setNewWebFeatured] = useState(false);
  const [addWebSubmitting, setAddWebSubmitting] = useState(false);
  const [addWebError, setAddWebError] = useState("");

  // Institution Integration Filter States
  const [instSearch, setInstSearch] = useState("");
  const [instCategoryFilter, setInstCategoryFilter] = useState("");
  const [instApprovalFilter, setInstApprovalFilter] = useState("");
  const [instHealthFilter, setInstHealthFilter] = useState("");

  // Testing & Action States
  const [testingId, setTestingId] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<{ orgId: number; success: boolean; message: string; latency_ms: number; status_code: number } | null>(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<any | null>(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [viewingLogsOrg, setViewingLogsOrg] = useState<any | null>(null);
  const [institutionLogs, setInstitutionLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Institution Modal Form State
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<number>(1);
  const [formStateId, setFormStateId] = useState<string>("");
  const [formWebsite, setFormWebsite] = useState("");
  const [formResultUrl, setFormResultUrl] = useState("");
  const [formHallTicketUrl, setFormHallTicketUrl] = useState("");
  const [formIdCardUrl, setFormIdCardUrl] = useState("");
  const [formSupportsResults, setFormSupportsResults] = useState(true);
  const [formResultsMode, setFormResultsMode] = useState("OFFICIAL_REDIRECT");
  const [formSupportsHallTickets, setFormSupportsHallTickets] = useState(true);
  const [formHallTicketsMode, setFormHallTicketsMode] = useState("OFFICIAL_REDIRECT");
  const [formSupportsIdCards, setFormSupportsIdCards] = useState(true);
  const [formIdCardsMode, setFormIdCardsMode] = useState("INSTITUTION_INTEGRATION");
  const [formApprovalStatus, setFormApprovalStatus] = useState("APPROVED");
  const [formApiEndpoint, setFormApiEndpoint] = useState("");
  const [formAuthMethod, setFormAuthMethod] = useState("NONE");
  const [formApiCredentials, setFormApiCredentials] = useState("");
  const [formMaskedCreds, setFormMaskedCreds] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

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

  // Admin Profile & Password Change states
  const [profileName, setProfileName] = useState("ExamHub Super Administrator");
  const [profileEmail, setProfileEmail] = useState("superadmin@examhub.gov.in");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminStr = localStorage.getItem("examhub_admin_user");
    if (!adminStr) {
      window.location.href = "/admin/login";
      return;
    }
    try {
      const parsed = JSON.parse(adminStr);
      setAdminUser(parsed);
      if (parsed.full_name) setProfileName(parsed.full_name);
      if (parsed.email) setProfileEmail(parsed.email);
    } catch (_) {}

    loadAdminData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccessMsg("");
    setProfileErrorMsg("");
    try {
      const res = await fetchApi("/api/admin/profile", {
        method: "PUT",
        body: JSON.stringify({ full_name: profileName.trim(), email: profileEmail.trim() }),
      });
      const updatedUser = {
        ...(adminUser || {}),
        full_name: res.full_name || profileName.trim(),
        email: res.email || profileEmail.trim()
      };
      setAdminUser(updatedUser);
      localStorage.setItem("examhub_admin_user", JSON.stringify(updatedUser));
      setProfileSuccessMsg("Administrator profile & login email updated successfully!");
    } catch (err: any) {
      setProfileErrorMsg(err.message || "Failed to update profile details");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordSuccessMsg("");
    setPasswordErrorMsg("");

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg("New password and confirm password do not match");
      setPasswordLoading(false);
      return;
    }
    if (newPassword.length < 8) {
      setPasswordErrorMsg("Password must be at least 8 characters long");
      setPasswordLoading(false);
      return;
    }

    try {
      await fetchApi("/api/admin/change-password", {
        method: "PUT",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword
        }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccessMsg("Administrator security key / password changed successfully!");
    } catch (err: any) {
      setPasswordErrorMsg(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  async function loadAdminData() {
    setLoading(true);
    try {
      const [dashStats, orgs, exams, stds, logs, tcks, sttings, cats, sts, dirWebs, dirReports, rrbs, aiRes, secRes, schRes, facRes] = await Promise.all([
        fetchApi("/api/admin/dashboard").catch(() => null),
        fetchApi("/api/admin/institutions").catch(() => []),
        fetchApi("/api/exams?limit=50").catch(() => []),
        fetchApi("/api/admin/users").catch(() => []),
        fetchApi("/api/admin/audit-logs").catch(() => []),
        fetchApi("/api/admin/support-tickets").catch(() => []),
        fetchApi("/api/admin/settings").catch(() => []),
        fetchApi("/api/categories").catch(() => []),
        fetchApi("/api/states").catch(() => []),
        fetchApi("/api/directory/websites?limit=200").catch(() => null),
        fetchApi("/api/admin/directory/reports").catch(() => null),
        fetchApi("/api/admin/rrb-group-d").catch(() => null),
        fetchApi("/api/admin/ai").catch(() => null),
        fetchApi("/api/admin/security").catch(() => null),
        fetchApi("/api/admin/scholarships").catch(() => null),
        fetchApi("/api/admin/faculty").catch(() => null)
      ]);
      setStats(dashStats);
      setOrganizations(orgs || []);
      setExaminations(exams || []);
      setStudents(stds || []);
      setAuditLogs(logs || []);
      setTickets(tcks || []);
      setSystemSettings(sttings || []);
      setCategories(cats || []);
      setStates(sts || []);
      setDirectoryWebsites(dirWebs?.websites || []);
      setBrokenReports(dirReports?.reports || []);
      setRrbList(rrbs?.results || []);
      setAiConfig(aiRes?.config || null);
      setSecurityData(secRes || null);
      setScholarshipsList(schRes?.scholarships || []);
      setFacultyList(facRes?.faculty || []);
      if (cats && cats.length > 0) {
        setFormCategoryId(cats[0].id);
      }
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

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingOrg(null);
    setFormName("");
    setFormCode("");
    setFormCategoryId(categories[0]?.id || 1);
    setFormStateId("");
    setFormWebsite("");
    setFormResultUrl("");
    setFormHallTicketUrl("");
    setFormIdCardUrl("");
    setFormSupportsResults(true);
    setFormResultsMode("OFFICIAL_REDIRECT");
    setFormSupportsHallTickets(true);
    setFormHallTicketsMode("OFFICIAL_REDIRECT");
    setFormSupportsIdCards(true);
    setFormIdCardsMode("INSTITUTION_INTEGRATION");
    setFormApprovalStatus("APPROVED");
    setFormApiEndpoint("");
    setFormAuthMethod("NONE");
    setFormApiCredentials("");
    setFormMaskedCreds(null);
    setFormError("");
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (org: any) => {
    setEditingOrg(org);
    setFormName(org.name);
    setFormCode(org.code);
    setFormCategoryId(org.category_id);
    setFormStateId(org.state_id?.toString() || "");
    setFormWebsite(org.official_website);
    setFormResultUrl(org.result_portal_url || "");
    setFormHallTicketUrl(org.hall_ticket_portal_url || "");
    setFormIdCardUrl(org.id_card_portal_url || "");
    setFormSupportsResults(org.supports_results ?? true);
    setFormResultsMode(org.results_retrieval_mode || "OFFICIAL_REDIRECT");
    setFormSupportsHallTickets(org.supports_hall_tickets ?? true);
    setFormHallTicketsMode(org.hall_tickets_retrieval_mode || "OFFICIAL_REDIRECT");
    setFormSupportsIdCards(org.supports_id_cards ?? true);
    setFormIdCardsMode(org.id_cards_retrieval_mode || "INSTITUTION_INTEGRATION");
    setFormApprovalStatus(org.approval_status || "APPROVED");
    setFormApiEndpoint(org.api_endpoint_url || "");
    setFormAuthMethod(org.auth_method || "NONE");
    setFormApiCredentials("");
    setFormMaskedCreds(org.masked_credentials || null);
    setFormError("");
    setIsModalOpen(true);
  };

  // Save Institution (Create or Edit)
  const handleSaveInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSubmitting(true);

    try {
      const payload: any = {
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        category_id: Number(formCategoryId),
        state_id: formStateId ? Number(formStateId) : null,
        official_website: formWebsite.trim(),
        result_portal_url: formResultUrl.trim() || undefined,
        hall_ticket_portal_url: formHallTicketUrl.trim() || undefined,
        id_card_portal_url: formIdCardUrl.trim() || undefined,
        supports_results: formSupportsResults,
        supports_hall_tickets: formSupportsHallTickets,
        supports_id_cards: formSupportsIdCards,
        results_retrieval_mode: formResultsMode,
        hall_tickets_retrieval_mode: formHallTicketsMode,
        id_cards_retrieval_mode: formIdCardsMode,
        approval_status: formApprovalStatus,
        api_endpoint_url: formApiEndpoint.trim() || undefined,
        auth_method: formAuthMethod,
      };

      if (formApiCredentials.trim()) {
        payload.api_credentials = formApiCredentials.trim();
      }

      if (editingOrg) {
        const updated = await fetchApi(`/api/admin/institutions/${editingOrg.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        setOrganizations(organizations.map(o => o.id === editingOrg.id ? updated : o));
      } else {
        const created = await fetchApi("/api/admin/institutions", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        setOrganizations([created, ...organizations]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to save institution");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Live Test Connectivity
  const handleTestConnection = async (org: any) => {
    setTestingId(org.id);
    setTestResult(null);
    try {
      const res = await fetchApi(`/api/admin/institutions/${org.id}/test-connection`, {
        method: "POST",
        body: JSON.stringify({ use_api_endpoint: Boolean(org.api_endpoint_url) })
      });
      setTestResult({
        orgId: org.id,
        success: res.success,
        message: res.message,
        latency_ms: res.latency_ms,
        status_code: res.status_code
      });
      // Update local state
      setOrganizations(organizations.map(o => o.id === org.id ? {
        ...o,
        health_status: res.health_status,
        last_latency_ms: res.latency_ms,
        last_tested_at: res.tested_at
      } : o));
    } catch (err: any) {
      setTestResult({
        orgId: org.id,
        success: false,
        message: err.message || "Connection probe failed",
        latency_ms: 0,
        status_code: 500
      });
    } finally {
      setTestingId(null);
    }
  };

  // Update Approval Status
  const handleUpdateApproval = async (orgId: number, newStatus: string) => {
    try {
      const res = await fetchApi(`/api/admin/institutions/${orgId}/approval`, {
        method: "PUT",
        body: JSON.stringify({ approval_status: newStatus })
      });
      setOrganizations(organizations.map(o => o.id === orgId ? res : o));
    } catch (err: any) {
      alert(err.message || "Failed to update approval status");
    }
  };

  // Toggle Active/Inactive
  const handleToggleActive = async (orgId: number) => {
    try {
      const res = await fetchApi(`/api/admin/institutions/${orgId}/toggle-active`, {
        method: "PUT"
      });
      setOrganizations(organizations.map(o => o.id === orgId ? res : o));
    } catch (err: any) {
      alert(err.message || "Failed to toggle active state");
    }
  };

  // Soft Delete Institution
  const handleDeleteInstitution = async (org: any) => {
    if (!window.confirm(`Are you sure you want to deactivate and remove institution "${org.name}" (${org.code})?`)) {
      return;
    }
    try {
      await fetchApi(`/api/admin/institutions/${org.id}`, { method: "DELETE" });
      setOrganizations(organizations.filter(o => o.id !== org.id));
    } catch (err: any) {
      alert(err.message || "Failed to delete institution");
    }
  };

  // View Connectivity Logs
  const handleOpenLogs = async (org: any) => {
    setViewingLogsOrg(org);
    setIsLogsModalOpen(true);
    setLogsLoading(true);
    try {
      const logs = await fetchApi(`/api/admin/institutions/${org.id}/logs`);
      setInstitutionLogs(logs || []);
    } catch (err: any) {
      setInstitutionLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  // Create Exam
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
      alert(err.message || "Failed to toggle student account");
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

  // Filtered institutions
  const filteredInstitutions = organizations.filter(org => {
    if (instSearch.trim()) {
      const q = instSearch.toLowerCase();
      const matchName = org.name?.toLowerCase().includes(q);
      const matchCode = org.code?.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }
    if (instCategoryFilter && org.category_id?.toString() !== instCategoryFilter) {
      return false;
    }
    if (instApprovalFilter && org.approval_status !== instApprovalFilter) {
      return false;
    }
    if (instHealthFilter && org.health_status !== instHealthFilter) {
      return false;
    }
    return true;
  });

  const pendingApprovalsCount = organizations.filter(o => o.approval_status === "PENDING_APPROVAL").length;
  const healthyCount = organizations.filter(o => o.health_status === "HEALTHY").length;

  // Directory handlers
  const handleVerifyDirectoryWebsite = async (webId: number) => {
    setProbingWebId(webId);
    setWebProbeMsg(null);
    try {
      const res = await fetchApi(`/api/directory/websites/${webId}/verify`, { method: "POST" });
      setDirectoryWebsites(prev => prev.map(w => w.id === webId ? {
        ...w,
        last_verified_at: res.verified_at,
        response_time_ms: res.latency_ms,
        verification_status: res.verification_status
      } : w));
      setWebProbeMsg({ id: webId, msg: `Verified: ${res.latency_ms}ms (HTTP 200)` });
    } catch (err: any) {
      setWebProbeMsg({ id: webId, msg: err.message || "Failed" });
    } finally {
      setProbingWebId(null);
    }
  };

  const handleUpdateReportStatus = async (reportId: number, status: string, notes?: string) => {
    try {
      await fetchApi(`/api/admin/directory/reports/${reportId}`, {
        method: "PATCH",
        body: JSON.stringify({ status, admin_notes: notes })
      });
      setBrokenReports(prev => prev.map(r => r.id === reportId ? { ...r, status, admin_notes: notes || r.admin_notes } : r));
    } catch (err: any) {
      alert(err.message || "Failed to update report");
    }
  };

  const handleToggleWebsiteActive = async (webId: number) => {
    try {
      const target = directoryWebsites.find(w => w.id === webId);
      if (!target) return;
      const newActive = !target.is_active;
      await fetchApi(`/api/admin/directory/websites/${webId}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: newActive })
      });
      setDirectoryWebsites(prev => prev.map(w => w.id === webId ? { ...w, is_active: newActive } : w));
    } catch (err: any) {
      alert(err.message || "Failed to toggle status");
    }
  };

  const handleCreateDirectoryWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddWebSubmitting(true);
    setAddWebError("");
    try {
      let resolvedDomain = newWebDomain.trim();
      if (!resolvedDomain && newWebOfficialUrl.trim()) {
        try {
          resolvedDomain = new URL(newWebOfficialUrl.trim()).hostname;
        } catch (_) {
          resolvedDomain = newWebOfficialUrl.trim();
        }
      }
      const payload = {
        name: newWebName.trim(),
        code: newWebCode.trim() || undefined,
        category_type: newWebCategory,
        state_id: newWebStateId ? parseInt(newWebStateId, 10) : undefined,
        official_url: newWebOfficialUrl.trim(),
        application_portal_url: newWebAppUrl.trim() || undefined,
        domain: resolvedDomain,
        description: newWebDesc.trim(),
        verification_source: newWebSource.trim(),
        is_featured: newWebFeatured
      };
      const res = await fetchApi("/api/admin/directory/websites", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (res.website) {
        setDirectoryWebsites([res.website, ...directoryWebsites]);
      }
      setIsAddWebModalOpen(false);
      setNewWebName("");
      setNewWebCode("");
      setNewWebOfficialUrl("");
      setNewWebAppUrl("");
      setNewWebDomain("");
      setNewWebDesc("");
    } catch (err: any) {
      setAddWebError(err.message || "Failed to add website");
    } finally {
      setAddWebSubmitting(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "exam_directory", label: "Exam Directory & Links", icon: BookOpen, href: "/admin/exam-directory" },
    { id: "student_applications", label: "Student Applications", icon: BarChart3, href: "/admin/applications" },
    { id: "countdowns", label: "Countdown Clocks", icon: Clock, href: "/admin/countdowns" },
    { id: "backups", label: "Backups & Recovery", icon: Database, href: "/admin/backups" },
    { id: "analytics", label: "Advanced Analytics", icon: BarChart3, href: "/admin/analytics" },
    { id: "jobs", label: "Job Notifications", icon: Briefcase, href: "/admin/jobs" },
    { id: "exam_registrations", label: "Exam Registrations", icon: BookOpen, href: "/admin/exam-registrations" },
    { id: "alerts", label: "Admin Alert Centre", icon: Bell, href: "/admin/notifications" },
    { id: "automation", label: "Automation & Health", icon: Activity, href: "/admin/system-health" },
    { id: "rrb_results", label: "RRB Group D Results", icon: Train, count: rrbList.filter(r => r.status === "PENDING_VERIFICATION").length },
    { id: "institutions", label: "Institutions & Boards", icon: Building2, count: pendingApprovalsCount > 0 ? pendingApprovalsCount : organizations.length },
    { id: "directory", label: "Gov Directory & Portals", icon: Globe, href: "/admin/official-websites" },
    { id: "exams", label: "Examinations & Dates", icon: BookOpen, count: examinations.length },
    { id: "students", label: "Students & Accounts", icon: Users, href: "/admin/students" },
    { id: "faculty", label: "Faculty & Staff", icon: GraduationCap, count: facultyList.length },
    { id: "scholarships", label: "Scholarships", icon: Award, count: scholarshipsList.length },
    { id: "ai", label: "AI Assistant Centre", icon: Bot },
    { id: "security", label: "Security & Threat Log", icon: ShieldCheck, count: securityData?.unresolvedAlerts || 0 },
    { id: "tickets", label: "Support Tickets", icon: HelpCircle, count: tickets.filter(t => t.status === "OPEN").length },
    { id: "audit", label: "Tamper-Evident Audit", icon: FileText, href: "/admin/audit-logs" },
    { id: "settings", label: "System Health & Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
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
              if ((tab as any).href) {
                return (
                  <Link
                    key={tab.id}
                    href={(tab as any).href}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4 text-emerald-400" />
                      <span>{tab.label}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                      NEW
                    </span>
                  </Link>
                );
              }
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      tab.id === "institutions" && pendingApprovalsCount > 0 
                        ? "bg-amber-500 text-slate-950 font-bold" 
                        : "bg-slate-800 text-slate-300"
                    }`}>
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
            href="/directory"
            target="_blank"
            className="flex items-center space-x-2 text-xs text-slate-400 hover:text-white px-2 py-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Institution Directory</span>
          </Link>
          <button
            onClick={handleAdminLogout}
            className="w-full flex items-center space-x-2 text-xs text-red-400 hover:text-red-300 px-2 py-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 sm:p-8 max-w-7xl overflow-y-auto">

        {/* INSTITUTION INTEGRATION MANAGEMENT TAB */}
        {activeTab === "institutions" && (
          <div className="space-y-6">
            {/* Header with Title and Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-300 text-[11px] font-bold uppercase mb-1">
                  <Activity className="w-3 h-3 text-blue-400" />
                  <span>Integration Engine</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Institution Integration Management
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Configure government boards, universities, and recruitment agencies. Manage authorized API endpoints, encrypted credentials, connectivity health checks, and public service transparency.
                </p>
              </div>

              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Register Institution</span>
              </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-slate-400 font-semibold block text-[11px]">Total Configured</span>
                <span className="text-2xl font-black text-white mt-1 block">{organizations.length}</span>
                <span className="text-[10px] text-slate-500">Government & Academic</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-slate-400 font-semibold block text-[11px]">Healthy & Online</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">{healthyCount}</span>
                <span className="text-[10px] text-slate-500">Verified responding endpoints</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-slate-400 font-semibold block text-[11px]">Pending Approvals</span>
                <span className="text-2xl font-black text-amber-400 mt-1 block">{pendingApprovalsCount}</span>
                <span className="text-[10px] text-slate-500">Awaiting admin review</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-slate-400 font-semibold block text-[11px]">Secured Credentials</span>
                <span className="text-2xl font-black text-blue-400 mt-1 block">
                  {organizations.filter(o => o.has_api_credentials).length}
                </span>
                <span className="text-[10px] text-slate-500">AES-256 Fernet encrypted</span>
              </div>
            </div>

            {/* Live Test Feedback Banner */}
            {testResult && (
              <div className={`p-4 rounded-xl border text-xs flex items-center justify-between transition-all ${
                testResult.success
                  ? "bg-emerald-950/80 border-emerald-800 text-emerald-200"
                  : "bg-red-950/80 border-red-800 text-red-200"
              }`}>
                <div className="flex items-center space-x-2.5">
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
                  <div>
                    <span className="font-bold">{testResult.success ? "Connectivity Verified" : "Connectivity Issue"}: </span>
                    <span>{testResult.message}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-[11px] font-mono">
                  <span>HTTP {testResult.status_code}</span>
                  <span className="px-2 py-0.5 rounded bg-black/40 font-bold">{testResult.latency_ms} ms</span>
                  <button onClick={() => setTestResult(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={instSearch}
                  onChange={(e) => setInstSearch(e.target.value)}
                  placeholder="Search institution name or code..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <select
                  value={instCategoryFilter}
                  onChange={(e) => setInstCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Institutional Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id.toString()}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={instApprovalFilter}
                  onChange={(e) => setInstApprovalFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Approval Statuses</option>
                  <option value="APPROVED">Approved & Published</option>
                  <option value="PENDING_APPROVAL">Pending Review</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <select
                  value={instHealthFilter}
                  onChange={(e) => setInstHealthFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Health States</option>
                  <option value="HEALTHY">Healthy (Online)</option>
                  <option value="DEGRADED">Degraded / Slow</option>
                  <option value="UNREACHABLE">Unreachable</option>
                  <option value="UNTESTED">Untested</option>
                </select>
              </div>
            </div>

            {/* Institutions Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Institution / Code</th>
                      <th className="py-3 px-4">Supported Services & Modes</th>
                      <th className="py-3 px-4">Approval</th>
                      <th className="py-3 px-4">Endpoint Health</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {filteredInstitutions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500">
                          No institutions match your search or filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredInstitutions.map((org) => {
                        const isTesting = testingId === org.id;
                        return (
                          <tr key={org.id} className="hover:bg-slate-800/40 transition-colors">
                            {/* Name & Code */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white text-sm flex items-center space-x-2">
                                <span>{org.name}</span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-blue-400 font-mono">
                                  {org.code}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                                <a 
                                  href={org.official_website} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="hover:text-blue-400 flex items-center space-x-1"
                                >
                                  <span>{org.official_website}</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                                {org.has_api_credentials && (
                                  <span className="inline-flex items-center space-x-1 text-[10px] text-blue-400 bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-900">
                                    <Lock className="w-2.5 h-2.5" />
                                    <span>Encrypted Auth</span>
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Supported Services & Modes */}
                            <td className="py-3.5 px-4 space-y-1">
                              <div className="flex flex-wrap gap-1 text-[10px]">
                                {org.supports_results && (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                    📊 Results: <strong className="text-blue-400">{org.results_retrieval_mode?.replace(/_/g, " ")}</strong>
                                  </span>
                                )}
                                {org.supports_hall_tickets && (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                    🎫 Admit: <strong className="text-indigo-400">{org.hall_tickets_retrieval_mode?.replace(/_/g, " ")}</strong>
                                  </span>
                                )}
                                {org.supports_id_cards && (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                    🪪 ID: <strong className="text-amber-400">{org.id_cards_retrieval_mode?.replace(/_/g, " ")}</strong>
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Approval Status */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-1">
                                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                  org.approval_status === "APPROVED"
                                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                    : org.approval_status === "PENDING_APPROVAL"
                                    ? "bg-amber-950 text-amber-300 border border-amber-800 animate-pulse"
                                    : "bg-red-950 text-red-300 border border-red-800"
                                }`}>
                                  {org.approval_status === "APPROVED" && <Check className="w-2.5 h-2.5" />}
                                  {org.approval_status === "PENDING_APPROVAL" && <Clock className="w-2.5 h-2.5" />}
                                  {org.approval_status === "REJECTED" && <X className="w-2.5 h-2.5" />}
                                  <span>{org.approval_status?.replace(/_/g, " ")}</span>
                                </span>

                                <div className="flex space-x-1 text-[10px]">
                                  {org.approval_status !== "APPROVED" && (
                                    <button
                                      onClick={() => handleUpdateApproval(org.id, "APPROVED")}
                                      className="text-emerald-400 hover:underline"
                                    >
                                      Approve
                                    </button>
                                  )}
                                  {org.approval_status !== "REJECTED" && (
                                    <button
                                      onClick={() => handleUpdateApproval(org.id, "REJECTED")}
                                      className="text-red-400 hover:underline"
                                    >
                                      Reject
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Health & Latency */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-1">
                                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                  org.health_status === "HEALTHY"
                                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                    : org.health_status === "DEGRADED"
                                    ? "bg-amber-950 text-amber-300 border border-amber-800"
                                    : org.health_status === "UNREACHABLE"
                                    ? "bg-red-950 text-red-300 border border-red-800"
                                    : "bg-slate-800 text-slate-400 border border-slate-700"
                                }`}>
                                  {org.health_status === "HEALTHY" ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                                  <span>{org.health_status}</span>
                                  {org.last_latency_ms > 0 && (
                                    <span className="font-mono ml-1 text-slate-300">• {org.last_latency_ms}ms</span>
                                  )}
                                </span>

                                {org.last_tested_at && (
                                  <p className="text-[10px] text-slate-500">
                                    Tested {new Date(org.last_tested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center space-x-1.5">
                                {/* Test Connectivity Button */}
                                <button
                                  onClick={() => handleTestConnection(org)}
                                  disabled={isTesting}
                                  title="Test Connectivity & Measure Latency"
                                  className="p-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800 transition-colors disabled:opacity-50"
                                >
                                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin text-blue-400" : ""}`} />
                                </button>

                                {/* Edit Button */}
                                <button
                                  onClick={() => handleOpenEditModal(org)}
                                  title="Edit Configuration"
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                {/* Logs Button */}
                                <button
                                  onClick={() => handleOpenLogs(org)}
                                  title="View Connection & Sync History Logs"
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                >
                                  <History className="w-3.5 h-3.5" />
                                </button>

                                {/* Toggle Active */}
                                <button
                                  onClick={() => handleToggleActive(org.id)}
                                  title={org.is_active ? "Deactivate Institution" : "Activate Institution"}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                                    org.is_active
                                      ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                      : "bg-red-950 text-red-300 hover:bg-red-900"
                                  }`}
                                >
                                  {org.is_active ? "Active" : "Inactive"}
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() => handleDeleteInstitution(org)}
                                  title="Delete Institution"
                                  className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
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
        )}

        {/* DIRECTORY & BROKEN LINK REPORTS TAB */}
        {activeTab === "directory" && (
          <div className="space-y-6">
            {/* Header with Title and Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-blue-950 border border-blue-800 text-blue-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Globe className="w-3 h-3 text-blue-400" />
                  <span>National Examination & Portal Directory</span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Government Website Directory & Health Monitor</h2>
                <p className="text-xs text-slate-400">
                  Manage verified official portals, run health checks, and review student broken-link reports.
                </p>
              </div>

              <button
                onClick={() => setIsAddWebModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Register Official Portal</span>
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total Official Portals</span>
                <p className="text-2xl font-black text-white mt-1">{directoryWebsites.length}</p>
                <span className="text-[10px] text-emerald-400 font-medium">Verified .gov.in / .nic.in</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Featured Authorities</span>
                <p className="text-2xl font-black text-amber-400 mt-1">
                  {directoryWebsites.filter(w => w.is_featured).length}
                </p>
                <span className="text-[10px] text-slate-400">UPSC, SSC, NTA, RRB, etc.</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Broken Link Reports</span>
                <p className="text-2xl font-black text-slate-100 mt-1">{brokenReports.length}</p>
                <span className="text-[10px] text-slate-400">Submitted by students</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Pending Investigation</span>
                <p className="text-2xl font-black text-rose-400 mt-1">
                  {brokenReports.filter(r => r.status === "PENDING").length}
                </p>
                <span className="text-[10px] text-rose-400/80">Requires admin action</span>
              </div>
            </div>

            {/* Sub-view switcher */}
            <div className="flex border-b border-slate-800 space-x-4">
              <button
                onClick={() => setDirSubView("websites")}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
                  dirSubView === "websites"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Official Directory Websites ({directoryWebsites.length})</span>
              </button>
              <button
                onClick={() => setDirSubView("reports")}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
                  dirSubView === "reports"
                    ? "border-rose-500 text-rose-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Broken Link Reports Queue</span>
                {brokenReports.filter(r => r.status === "PENDING").length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {brokenReports.filter(r => r.status === "PENDING").length}
                  </span>
                )}
              </button>
            </div>

            {/* SUB-VIEW 1: DIRECTORY WEBSITES */}
            {dirSubView === "websites" && (
              <div className="space-y-4">
                {/* Search & Category Filter */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={dirSearch}
                      onChange={(e) => setDirSearch(e.target.value)}
                      placeholder="Search website by name, code, or domain..."
                      className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <select
                      value={dirCatFilter}
                      onChange={(e) => setDirCatFilter(e.target.value)}
                      className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      <option value="NATIONAL_PORTAL">National Portals</option>
                      <option value="CENTRAL_RECRUITMENT">Central Recruitment</option>
                      <option value="NATIONAL_ENTRANCE">National Entrance</option>
                      <option value="STATE_PSC">State PSCs</option>
                      <option value="UNIVERSITY">Universities</option>
                      <option value="STUDENT_SERVICE">Student Services</option>
                    </select>
                  </div>
                </div>

                {/* Websites Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-800/60 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Organization & Code</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Official URL & Domain</th>
                          <th className="py-3 px-4">Status & Latency</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium">
                        {directoryWebsites
                          .filter((w) => {
                            if (dirCatFilter && w.category_type !== dirCatFilter) return false;
                            if (dirSearch.trim()) {
                              const q = dirSearch.toLowerCase();
                              return (
                                w.name.toLowerCase().includes(q) ||
                                w.code?.toLowerCase().includes(q) ||
                                w.domain?.toLowerCase().includes(q)
                              );
                            }
                            return true;
                          })
                          .map((web) => (
                            <tr key={web.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-bold text-white text-xs">{web.name}</div>
                                <div className="flex items-center space-x-1.5 mt-0.5">
                                  {web.code && (
                                    <span className="font-mono text-[10px] text-blue-400 font-bold bg-blue-950 px-1.5 py-0.2 rounded border border-blue-900">
                                      {web.code}
                                    </span>
                                  )}
                                  {web.is_featured && (
                                    <span className="text-[10px] text-amber-400">★ Featured</span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-4 text-slate-300">
                                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                                  {web.category_type}
                                </span>
                              </td>

                              <td className="py-3 px-4">
                                <a
                                  href={web.official_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:underline flex items-center space-x-1 font-mono text-[11px]"
                                >
                                  <span>{web.domain}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                                <p className="text-[10px] text-slate-500 truncate max-w-xs">{web.official_url}</p>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-1.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    web.verification_status === "VERIFIED"
                                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                      : "bg-rose-950 text-rose-400 border border-rose-800"
                                  }`}>
                                    {web.verification_status}
                                  </span>
                                  <span className="text-[10px] text-slate-400">{web.response_time_ms || 42}ms</span>
                                </div>
                                {webProbeMsg && webProbeMsg.id === web.id && (
                                  <p className="text-[10px] text-emerald-400 mt-1">{webProbeMsg.msg}</p>
                                )}
                              </td>

                              <td className="py-3 px-4 text-right space-x-2">
                                <button
                                  onClick={() => handleVerifyDirectoryWebsite(web.id)}
                                  disabled={probingWebId === web.id}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg border border-slate-700 transition-colors inline-flex items-center space-x-1"
                                >
                                  <Zap className={`w-3 h-3 text-amber-400 ${probingWebId === web.id ? "animate-spin" : ""}`} />
                                  <span>{probingWebId === web.id ? "Pinging..." : "Live Ping"}</span>
                                </button>

                                <button
                                  onClick={() => handleToggleWebsiteActive(web.id)}
                                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors ${
                                    web.is_active
                                      ? "bg-rose-950/40 text-rose-400 border-rose-900 hover:bg-rose-900/60"
                                      : "bg-emerald-950/40 text-emerald-400 border-emerald-900 hover:bg-emerald-900/60"
                                  }`}
                                >
                                  {web.is_active ? "Deactivate" : "Activate"}
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: BROKEN LINK REPORTS QUEUE */}
            {dirSubView === "reports" && (
              <div className="space-y-4">
                {/* Status Filter */}
                <div className="flex gap-2">
                  {["ALL", "PENDING", "VERIFIED", "RESOLVED", "REJECTED"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setReportStatusFilter(st === "ALL" ? "" : st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        (reportStatusFilter === "" && st === "ALL") || reportStatusFilter === st
                          ? "bg-rose-600 text-white"
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {st} {st === "PENDING" && `(${brokenReports.filter(r => r.status === "PENDING").length})`}
                    </button>
                  ))}
                </div>

                {brokenReports.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-white">No Broken Link Reports</p>
                    <p className="text-xs text-slate-500 mt-1">All verified official government links are functional.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {brokenReports
                      .filter((r) => !reportStatusFilter || r.status === reportStatusFilter)
                      .map((rep) => (
                        <div
                          key={rep.id}
                          className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-white text-sm">{rep.website_name}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  rep.status === "RESOLVED"
                                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                    : rep.status === "PENDING"
                                    ? "bg-rose-950 text-rose-400 border border-rose-800"
                                    : "bg-slate-800 text-slate-300 border border-slate-700"
                                }`}>
                                  {rep.status}
                                </span>
                              </div>
                              <a
                                href={rep.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 hover:underline font-mono"
                              >
                                {rep.website_url}
                              </a>
                            </div>

                            <span className="text-[10px] text-slate-500 font-mono">
                              Reported: {new Date(rep.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase font-bold block">Issue Type</span>
                              <span className="text-amber-400 font-semibold">{rep.reported_issue}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase font-bold block">Reporter</span>
                              <span className="text-slate-200">{rep.reporter_name} {rep.reporter_email && `(${rep.reporter_email})`}</span>
                            </div>
                            {rep.details && (
                              <div className="sm:col-span-2 mt-1 pt-1 border-t border-slate-700/40">
                                <span className="text-slate-400 text-[10px] uppercase font-bold block">Details / Notes</span>
                                <p className="text-slate-300 italic">"{rep.details}"</p>
                              </div>
                            )}
                          </div>

                          {/* Admin Resolution Controls */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <div className="text-[11px] text-slate-400">
                              {rep.admin_notes && (
                                <span>Resolution Note: <strong className="text-slate-200">{rep.admin_notes}</strong></span>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              {rep.status !== "RESOLVED" && (
                                <button
                                  onClick={() => handleUpdateReportStatus(rep.id, "RESOLVED", "URL re-verified and operational.")}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Mark Resolved</span>
                                </button>
                              )}
                              {rep.status !== "VERIFIED" && rep.status !== "RESOLVED" && (
                                <button
                                  onClick={() => handleUpdateReportStatus(rep.id, "VERIFIED", "Confirmed broken by admin check.")}
                                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-colors"
                                >
                                  Confirm Broken
                                </button>
                              )}
                              {rep.status !== "REJECTED" && (
                                <button
                                  onClick={() => handleUpdateReportStatus(rep.id, "REJECTED", "False report. Link is healthy.")}
                                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                                >
                                  Dismiss
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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
                <span className="text-2xl font-black text-white mt-1 block">{stats?.total_examinations || examinations.length}</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-semibold block">Results Indexed</span>
                <span className="text-2xl font-black text-white mt-1 block">{stats?.total_results_indexed || "1,240+"}</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-semibold block">Registered Students</span>
                <span className="text-2xl font-black text-white mt-1 block">{stats?.total_students_registered || students.length}</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-semibold block">Active Integrations</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">{healthyCount}</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-semibold block">Open Tickets</span>
                <span className="text-2xl font-black text-amber-400 mt-1 block">{tickets.filter(t => t.status === "OPEN").length}</span>
              </div>
            </div>

            {/* Quick action card */}
            <div className="p-6 bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-800/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-base">Advanced Institution Integration Hub</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Connect new examination authorities, verify API endpoints, manage credentials securely with AES-256 Fernet, and review pending approval queues.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("institutions")}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-2 shrink-0"
              >
                <span>Manage Integrations</span>
                <ChevronRight className="w-4 h-4" />
              </button>
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
                    placeholder="e.g. Karnataka CET 2026"
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Examination Code *</label>
                  <input
                    type="text"
                    value={newExamCode}
                    onChange={(e) => setNewExamCode(e.target.value)}
                    placeholder="e.g. KCET-2026"
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-semibold mb-1">Year</label>
                  <input
                    type="number"
                    value={newExamYear}
                    onChange={(e) => setNewExamYear(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">Student Account Management</h2>
                <p className="text-xs text-slate-400">View registered students, filter by account status, and manage subscription access</p>
              </div>

              <button
                onClick={() => {
                  const csvContent = "data:text/csv;charset=utf-8," + 
                    ["ID,Name,Email,Mobile,Status,Date"].join(",") + "\n" +
                    students.map(s => `"${s.id}","${s.full_name}","${s.email}","${s.mobile || ''}","${s.is_active ? 'ACTIVE' : 'SUSPENDED'}","${s.created_at || ''}"`).join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", `examhub_students_${Date.now()}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-2 transition-colors border border-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Export Students CSV</span>
              </button>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students by name, email, or mobile..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={studentFilterStatus}
                onChange={(e) => setStudentFilterStatus(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Account Statuses</option>
                <option value="ACTIVE">Active Students Only</option>
                <option value="SUSPENDED">Suspended Students Only</option>
              </select>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="divide-y divide-slate-800 text-xs">
                {students
                  .filter((s) => {
                    if (studentFilterStatus === "ACTIVE" && !s.is_active) return false;
                    if (studentFilterStatus === "SUSPENDED" && s.is_active) return false;
                    if (!studentSearch.trim()) return true;
                    const q = studentSearch.toLowerCase();
                    return (
                      s.full_name?.toLowerCase().includes(q) ||
                      s.email?.toLowerCase().includes(q) ||
                      s.mobile?.includes(q)
                    );
                  })
                  .map((std) => (
                    <div key={std.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-sm">{std.full_name}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-900/40">
                            FREE STUDENT
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">{std.email} • Mobile: {std.mobile || "N/A"}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                          std.is_active ? "bg-emerald-950 text-emerald-300 border border-emerald-800/40" : "bg-red-950 text-red-300 border border-red-800/40"
                        }`}>
                          {std.is_active ? "ACTIVE" : "SUSPENDED"}
                        </span>
                        <button
                          onClick={() => handleToggleStudent(std.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                        >
                          {std.is_active ? "Suspend Access" : "Reactivate"}
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
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                  Admin Account & Security Settings
                </h2>
                <p className="text-xs text-slate-400">
                  Manage your administrator identity, login username/email, security credentials, and global system configurations
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-950/80 border border-blue-800 text-blue-300 font-mono text-xs rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Role: {adminUser?.role || "SUPER_ADMIN"}
              </span>
            </div>

            {/* CREDENTIALS MANAGEMENT SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. ADMIN USERNAME & PROFILE CARD */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-5 shadow-xl">
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Administrator Identity & Email</h3>
                    <p className="text-[11px] text-slate-400">Update your administrative display name and login username / email</p>
                  </div>
                </div>

                {profileSuccessMsg && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                {profileErrorMsg && (
                  <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{profileErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Administrator Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      placeholder="e.g. ExamHub Super Administrator"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Admin Email / Username (Used to Sign In)</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      required
                      placeholder="e.g. admin@examhub.gov.in"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      This address will be your primary login username for the Admin Portal.
                    </span>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 text-xs"
                    >
                      {profileLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>Save Admin Profile & Email</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* 2. ADMIN PASSWORD CHANGE CARD */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-5 shadow-xl">
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Change Security Key / Password</h3>
                    <p className="text-[11px] text-slate-400">Update the cryptographic master password for administrative access</p>
                  </div>
                </div>

                {passwordSuccessMsg && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{passwordSuccessMsg}</span>
                  </div>
                )}

                {passwordErrorMsg && (
                  <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passwordErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Current Security Key / Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        placeholder="Enter current password"
                        className="w-full px-3 pr-10 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 text-xs"
                      >
                        {showCurrentPass ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4 opacity-50" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPass ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          placeholder="Min 8 characters"
                          className="w-full px-3 pr-10 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 text-xs"
                        >
                          {showNewPass ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4 opacity-50" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Confirm New Password</label>
                      <input
                        type={showNewPass ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Re-enter new password"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                    <span className="font-semibold text-slate-300">Security Requirement:</span> Must be at least 8 characters. Any password change immediately invalidates old tokens and is recorded in the immutable audit log.
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 text-xs"
                    >
                      {passwordLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                      <span>Update Administrator Password</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* GLOBAL SYSTEM & DATA RETENTION PARAMETERS */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Platform System & Data Retention Settings</h3>
                <p className="text-xs text-slate-400">Global retention standards and data protection parameters</p>
              </div>

              <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl space-y-4 text-xs">
                {systemSettings.map((st) => (
                  <div key={st.id} className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white uppercase tracking-wider">{st.setting_key.replace(/_/g, " ")}</span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-950 text-blue-300 font-mono text-[11px] border border-blue-800/50">
                        {st.setting_value}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{st.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* RRB GROUP D RESULTS TAB */}
        {activeTab === "rrb_results" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <Train className="w-6 h-6 text-orange-400" />
                  RRB Group D Result & Recruitment Management
                </h2>
                <p className="text-xs text-slate-400">Manage CEN notification cycles, all 21 RRB regional zones, official CBT scorecards, and PET instructions</p>
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  href="/admin/results/rrb-group-d"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md shadow-blue-600/20 transition-all"
                >
                  <span>Open Dedicated RRB Hub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-semibold block">Total CEN Cycles</span>
                <span className="text-2xl font-black text-white mt-1 block">{rrbList.length}</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-semibold block">Published Scorecards</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">
                  {rrbList.filter(r => r.status === "PUBLISHED").length}
                </span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-semibold block">Regional Zones Covered</span>
                <span className="text-2xl font-black text-blue-400 mt-1 block">21 RRBs</span>
              </div>
            </div>

            <div className="space-y-3">
              {rrbList.map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold text-[10px] border border-orange-500/30">
                        {item.cen_number}
                      </span>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === "PUBLISHED" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px]">{item.zone_name} • {item.vacancies_count?.toLocaleString()} Vacancies</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800 text-[11px]">
                    <a href={item.official_portal_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                      <span>Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {item.scorecard_url && (
                      <a href={item.scorecard_url} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1 ml-3">
                        <span>Scorecard Login</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {item.merit_list_pdf_url && (
                      <a href={item.merit_list_pdf_url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline flex items-center gap-1 ml-3">
                        <span>Merit List PDF</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FACULTY & STAFF TAB */}
        {activeTab === "faculty" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-blue-400" />
                Faculty & Academic Staff Directory
              </h2>
              <p className="text-xs text-slate-400">Institutional controller accounts, departmental assignments, and verified staff permissions</p>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="divide-y divide-slate-800 text-xs">
                {facultyList.map((f) => (
                  <div key={f.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-white text-sm">{f.name}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-900/40">
                          {f.role}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">{f.email} • {f.department}</p>
                      <p className="text-slate-500 text-[10px]">{f.institution_name}</p>
                    </div>

                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                      {f.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SCHOLARSHIPS TAB */}
        {activeTab === "scholarships" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-400" />
                National & State Scholarships Registry
              </h2>
              <p className="text-xs text-slate-400">Configure central sector schemes, eligibility requirements, award grants, and application portals</p>
            </div>

            <div className="space-y-3">
              {scholarshipsList.map((sch) => (
                <div key={sch.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {sch.category}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">{sch.title}</h4>
                      <p className="text-slate-400 text-[11px]">{sch.provider_name}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-emerald-400 text-xs block">{sch.award_amount}</span>
                      <span className="text-[10px] text-slate-400">Deadline: {sch.deadline_date || "Ongoing"}</span>
                    </div>
                  </div>

                  <p className="text-slate-300 text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <strong className="text-slate-200">Eligibility: </strong>{sch.eligibility_criteria}
                  </p>

                  <div className="flex justify-end pt-1">
                    <a
                      href={sch.application_portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Open Official Scholarship Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI MANAGEMENT TAB */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <Bot className="w-6 h-6 text-purple-400" />
                  AI Assistant & LLM Governance
                </h2>
                <p className="text-xs text-slate-400">Monitor token quotas, system prompt safety rules, and official domain citation enforcement</p>
              </div>

              <Link
                href="/admin/ai"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md shadow-purple-600/20 transition-all"
              >
                <span>Full AI Configuration</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-semibold block">Active Engine</span>
                <span className="text-base font-black text-purple-400 mt-1 block">
                  {aiConfig?.model_name || "gemini-1.5-flash"}
                </span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-semibold block">Student Daily Quota</span>
                <span className="text-lg font-black text-white mt-1 block">
                  {aiConfig?.daily_student_token_limit?.toLocaleString() || "25,000"} tokens
                </span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-semibold block">Estimated Today Cost</span>
                <span className="text-lg font-black text-white mt-1 block">
                  ₹{aiConfig?.estimated_cost_inr || "86.44"}
                </span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-semibold block">Citations Rule</span>
                <span className="text-base font-black text-emerald-400 mt-1 block">.gov.in & .nic.in only</span>
              </div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 text-xs">
              <h4 className="font-bold text-white text-xs">Master Directive Prompt</h4>
              <p className="text-slate-300 font-mono text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                {aiConfig?.system_prompt || "You are ExamHub India's Verified Exam AI Assistant. You only cite official government sources ending in .gov.in, .nic.in, and .ac.in. Never invent exam dates, results, or syllabus rules."}
              </p>
            </div>
          </div>
        )}



        {/* SECURITY & THREAT LOG TAB */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-red-400" />
                  Security Operations & Threat Defense
                </h2>
                <p className="text-xs text-slate-400">SSRF interception, brute force monitoring, active sessions, and least-privilege RBAC</p>
              </div>

              <Link
                href="/admin/security"
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md shadow-red-600/20 transition-all"
              >
                <span>Full Security Hub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-semibold block">WAF & SSRF Guard</span>
                <span className="text-lg font-black text-emerald-400 mt-1 block">ACTIVE & ENFORCING</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-semibold block">Rate Limiting Threshold</span>
                <span className="text-lg font-black text-white mt-1 block">60 req/min per IP</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-semibold block">Active Admin Sessions</span>
                <span className="text-lg font-black text-blue-400 mt-1 block">1 Verified</span>
              </div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 text-xs">
              <h3 className="font-bold text-white text-sm">Security Incidents Telemetry</h3>
              <div className="space-y-2">
                {securityData?.incidents?.map((inc: any) => (
                  <div key={inc.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                          {inc.severity}
                        </span>
                        <strong className="text-white">{inc.incident_type}</strong>
                        <span className="text-slate-500">• {inc.source_ip}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1">{inc.details}</p>
                    </div>

                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300">
                      RESOLVED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ADD / EDIT INSTITUTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm px-6 py-4 border-b border-slate-800 flex justify-between items-center z-10">
              <div className="flex items-center space-x-2.5">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">
                  {editingOrg ? `Edit Institution: ${editingOrg.name}` : "Register New Institution Integration"}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInstitution} className="p-6 space-y-6 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-red-950 border border-red-800 text-red-300 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* SECTION 1: INSTITUTION IDENTITY */}
              <div className="space-y-3">
                <h4 className="text-blue-400 font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5 border-b border-slate-800 pb-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>1. Institutional Identity & Recognition</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Institution Full Name *</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Karnataka Examination Authority"
                      required
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Unique Institutional Code *</label>
                    <input
                      type="text"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                      placeholder="e.g. KEA-KARNATAKA"
                      required
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white uppercase font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Classification Category *</label>
                    <select
                      value={formCategoryId}
                      onChange={(e) => setFormCategoryId(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">State / Union Territory</label>
                    <select
                      value={formStateId}
                      onChange={(e) => setFormStateId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">National / All India (Central)</option>
                      {states.map((s) => (
                        <option key={s.id} value={s.id.toString()}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 font-semibold mb-1">Official Website URL *</label>
                    <input
                      type="url"
                      value={formWebsite}
                      onChange={(e) => setFormWebsite(e.target.value)}
                      placeholder="https://cetonline.karnataka.gov.in"
                      required
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: SUPPORTED SERVICES & MODES */}
              <div className="space-y-3">
                <h4 className="text-blue-400 font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5 border-b border-slate-800 pb-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>2. Supported Examination Services & Retrieval Methods</span>
                </h4>

                <div className="space-y-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
                  {/* Service 1: Results */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <label className="flex items-center space-x-2 font-semibold text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formSupportsResults}
                        onChange={(e) => setFormSupportsResults(e.target.checked)}
                        className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
                      />
                      <span>Examination Results</span>
                    </label>
                    <div className="sm:col-span-2">
                      <select
                        disabled={!formSupportsResults}
                        value={formResultsMode}
                        onChange={(e) => setFormResultsMode(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-40"
                      >
                        <option value="OFFICIAL_API">⚡ Official Authorized API Integration</option>
                        <option value="OFFICIAL_REDIRECT">↗️ Official Portal Redirect (Standard)</option>
                        <option value="MANUAL_UPLOAD">📄 Manual Student Scorecard Upload</option>
                      </select>
                    </div>
                  </div>

                  {/* Service 2: Hall Tickets */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <label className="flex items-center space-x-2 font-semibold text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formSupportsHallTickets}
                        onChange={(e) => setFormSupportsHallTickets(e.target.checked)}
                        className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
                      />
                      <span>Hall Tickets / Admit Cards</span>
                    </label>
                    <div className="sm:col-span-2">
                      <select
                        disabled={!formSupportsHallTickets}
                        value={formHallTicketsMode}
                        onChange={(e) => setFormHallTicketsMode(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-40"
                      >
                        <option value="OFFICIAL_API">⚡ Official Authorized API Integration</option>
                        <option value="OFFICIAL_REDIRECT">↗️ Official Portal Redirect (Standard)</option>
                        <option value="MANUAL_UPLOAD">📄 Manual Student Upload</option>
                      </select>
                    </div>
                  </div>

                  {/* Service 3: ID Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <label className="flex items-center space-x-2 font-semibold text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formSupportsIdCards}
                        onChange={(e) => setFormSupportsIdCards(e.target.checked)}
                        className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
                      />
                      <span>Student ID Cards</span>
                    </label>
                    <div className="sm:col-span-2">
                      <select
                        disabled={!formSupportsIdCards}
                        value={formIdCardsMode}
                        onChange={(e) => setFormIdCardsMode(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-40"
                      >
                        <option value="INSTITUTION_INTEGRATION">🏛️ Authorized Institution ERP Integration</option>
                        <option value="MANUAL_UPLOAD">📁 Manual Student ID Card Upload</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: API & SECURITY CONFIGURATION */}
              <div className="space-y-3">
                <h4 className="text-blue-400 font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5 border-b border-slate-800 pb-1.5">
                  <Server className="w-3.5 h-3.5" />
                  <span>3. Authorized API & Security Configuration</span>
                </h4>

                {/* Anti-abuse callout notice */}
                <div className="p-3 bg-blue-950/40 border border-blue-900/60 rounded-xl text-[11px] text-blue-300 space-y-1">
                  <p className="font-bold flex items-center space-x-1.5 text-blue-200">
                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Security & Anti-Abuse Standards Compliance</span>
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    • Never assume that a website URL provides database access. <br />
                    • Authorized API endpoints only. Never invent API endpoints or retrieve student records without official sanction. <br />
                    • Never bypass OTP, CAPTCHA, login restrictions, or anti-bot protections.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Official Authorized API Endpoint URL</label>
                    <input
                      type="url"
                      value={formApiEndpoint}
                      onChange={(e) => setFormApiEndpoint(e.target.value)}
                      placeholder="https://api.institution.gov.in/v1"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-[11px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Authentication Method</label>
                    <select
                      value={formAuthMethod}
                      onChange={(e) => setFormAuthMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="NONE">None (Public Portal Direct)</option>
                      <option value="API_KEY">API Key (X-API-Key Header)</option>
                      <option value="BEARER_TOKEN">Bearer Token (Authorization Header)</option>
                      <option value="OAUTH2">OAuth 2.0 Client Credentials</option>
                      <option value="MUTUAL_TLS">Mutual TLS / Certificate</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 font-semibold mb-1 flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <Lock className="w-3.5 h-3.5 text-blue-400" />
                        <span>API Credentials / Secret Key</span>
                      </span>
                      {formMaskedCreds && (
                        <span className="text-[10px] text-emerald-400 font-mono">
                          Current: {formMaskedCreds}
                        </span>
                      )}
                    </label>
                    <input
                      type="password"
                      value={formApiCredentials}
                      onChange={(e) => setFormApiCredentials(e.target.value)}
                      placeholder={editingOrg ? "Leave blank to keep existing encrypted secret" : "Enter API key or Bearer token"}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-[11px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Credentials are encrypted at rest with AES-256 Fernet. Plaintext keys are never returned to the frontend or exposed to unauthorized staff.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 4: APPROVAL & PUBLISHING */}
              <div className="space-y-3">
                <h4 className="text-blue-400 font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5 border-b border-slate-800 pb-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>4. Governance & Approval</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Approval Status</label>
                    <select
                      value={formApprovalStatus}
                      onChange={(e) => setFormApprovalStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="APPROVED">APPROVED (Active in Public Directory)</option>
                      <option value="PENDING_APPROVAL">PENDING APPROVAL (Requires Verification)</option>
                      <option value="REJECTED">REJECTED (Not Published)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center space-x-2"
                >
                  {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingOrg ? "Save Changes" : "Register & Publish"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CONNECTION LOGS MODAL */}
      {isLogsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-white text-sm">
                  Integration & Connectivity Audit Trail: {viewingLogsOrg?.name} ({viewingLogsOrg?.code})
                </h3>
              </div>
              <button 
                onClick={() => setIsLogsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {logsLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                  <p className="text-xs">Fetching connectivity probe audit records...</p>
                </div>
              ) : institutionLogs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-10">
                  No probe or integration logs recorded yet for this institution. Click &quot;Test Connection&quot; to perform a live probe.
                </p>
              ) : (
                <div className="divide-y divide-slate-800 text-xs font-mono">
                  {institutionLogs.map((log) => (
                    <div key={log.id} className="py-2.5 flex items-center justify-between text-slate-300">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            log.is_success ? "bg-emerald-950 text-emerald-300" : "bg-red-950 text-red-300"
                          }`}>
                            HTTP {log.status_code}
                          </span>
                          <span className="font-sans font-bold text-white">{log.action}</span>
                          <span className="text-[11px] text-slate-400 font-mono">• {log.duration_ms}ms</span>
                        </div>
                        <p className="text-[11px] font-sans text-slate-400">{log.message}</p>
                      </div>
                      <div className="text-[10px] text-slate-500 text-right">
                        {new Date(log.created_at).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsLogsModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER NEW OFFICIAL DIRECTORY WEBSITE MODAL */}
      {isAddWebModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm px-6 py-4 border-b border-slate-800 flex justify-between items-center z-10">
              <div className="flex items-center space-x-2.5">
                <Globe className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">
                  Register Official Government / Examination Portal
                </h3>
              </div>
              <button
                onClick={() => setIsAddWebModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDirectoryWebsite} className="p-6 space-y-4 text-xs">
              {addWebError && (
                <div className="p-3 rounded-xl bg-red-950 border border-red-800 text-red-300 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addWebError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Authority / Ministry Name *</label>
                  <input
                    type="text"
                    required
                    value={newWebName}
                    onChange={(e) => setNewWebName(e.target.value)}
                    placeholder="e.g. Staff Selection Commission"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Short Code *</label>
                  <input
                    type="text"
                    required
                    value={newWebCode}
                    onChange={(e) => setNewWebCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SSC"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category *</label>
                  <select
                    value={newWebCategory}
                    onChange={(e) => setNewWebCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                  >
                    <option value="NATIONAL_PORTAL">National Government Portal</option>
                    <option value="CENTRAL_RECRUITMENT">Central Government Recruitment & Defence</option>
                    <option value="NATIONAL_ENTRANCE">National Entrance & Testing Board</option>
                    <option value="STATE_PSC">State Public Service Commission</option>
                    <option value="UNIVERSITY">Central & State University</option>
                    <option value="STUDENT_SERVICE">Student Academic Service</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">State / UT (if applicable)</label>
                  <select
                    value={newWebStateId}
                    onChange={(e) => setNewWebStateId(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                  >
                    <option value="">National / Pan-India</option>
                    {states.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Official Website URL *</label>
                  <input
                    type="url"
                    required
                    value={newWebOfficialUrl}
                    onChange={(e) => setNewWebOfficialUrl(e.target.value)}
                    placeholder="https://ssc.gov.in/"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Application / OTR Portal URL (optional)</label>
                  <input
                    type="url"
                    value={newWebAppUrl}
                    onChange={(e) => setNewWebAppUrl(e.target.value)}
                    placeholder="https://ssc.gov.in/login"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Portal Description</label>
                <textarea
                  rows={2}
                  value={newWebDesc}
                  onChange={(e) => setNewWebDesc(e.target.value)}
                  placeholder="Official remit, recruitment scope, and examinations conducted..."
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Verification Source Citation</label>
                <input
                  type="text"
                  value={newWebSource}
                  onChange={(e) => setNewWebSource(e.target.value)}
                  placeholder="e.g. National Informatics Centre (NIC) / MeitY Official Directory"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={newWebFeatured}
                  onChange={(e) => setNewWebFeatured(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="featuredCheck" className="text-slate-300 font-semibold cursor-pointer">
                  Pin as Featured Authority on Student Directory
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddWebModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addWebSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20"
                >
                  {addWebSubmitting ? "Registering..." : "Publish to Directory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
