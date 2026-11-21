"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, ArrowLeft, Search, Plus, ExternalLink, ShieldCheck, 
  Trash2, Edit3, CheckCircle, AlertTriangle, Eye, RefreshCw, X,
  FileText, Check
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminExamDirectoryPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");
  
  // New Exam Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAuthority, setNewAuthority] = useState("");
  const [newAuthCode, setNewAuthCode] = useState("");
  const [newCategory, setNewCategory] = useState("CENTRAL_GOVERNMENT");
  const [newEndDate, setNewEndDate] = useState("");
  const [newExamDate, setNewExamDate] = useState("");
  const [newOfficialUrl, setNewOfficialUrl] = useState("");
  const [newVacancies, setNewVacancies] = useState("");
  const [savingNew, setSavingNew] = useState(false);

  useEffect(() => {
    loadExams();
  }, [catFilter]);

  async function loadExams() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (catFilter !== "ALL") params.append("category", catFilter);
      const res = await fetchApi(`/api/apply/exams?${params.toString()}`);
      setExams(res.exams || []);
    } catch (err) {
      console.error("Failed to load exams:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNew(true);
    try {
      const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const newExam = {
        id: Date.now(),
        slug,
        name: newName,
        conducting_authority: newAuthority,
        authority_code: newAuthCode.toUpperCase(),
        category: newCategory,
        category_label: newCategory.replace(/_/g, " "),
        state_name: "All India",
        eligibility: "Check official notification",
        qualification: "Graduate / Relevant Degree",
        age_limit: "18 to 35 years",
        age_relaxation: "As per government norms",
        application_fee: "₹100 (Exempted for reserved)",
        application_start_date: new Date().toISOString(),
        application_end_date: newEndDate ? new Date(newEndDate).toISOString() : new Date().toISOString(),
        exam_date: newExamDate ? new Date(newExamDate).toISOString() : new Date().toISOString(),
        exam_date_display: newExamDate || "To be notified",
        admit_card_date: "10 days before exam",
        result_date: "To be notified",
        result_status: "EXPECTED_UNOFFICIAL",
        required_documents: ["Photo", "Signature", "ID Proof", "Educational Certificates"],
        official_notification_pdf: newOfficialUrl,
        official_application_url: newOfficialUrl,
        source_website_url: newOfficialUrl,
        status: "APPLICATION_OPEN",
        vacancies: newVacancies || "Multiple",
        selection_process: ["Written Exam", "Document Verification"],
        syllabus_summary: "Comprehensive syllabus as per commission rules.",
        apply_clicks: 0,
        last_verified_at: new Date().toISOString()
      };

      setExams((prev) => [newExam, ...prev]);
      setShowAddModal(false);
      setNewName("");
      setNewAuthority("");
      setNewAuthCode("");
      setNewOfficialUrl("");
      setNewVacancies("");
      alert("New examination added to the directory.");
    } catch (err: any) {
      alert(err.message || "Failed to add exam");
    } finally {
      setSavingNew(false);
    }
  };

  const filtered = exams.filter((e) => {
    const term = search.toLowerCase();
    return (
      (e.name || "").toLowerCase().includes(term) ||
      (e.conducting_authority || "").toLowerCase().includes(term) ||
      (e.authority_code || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/dashboard"
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Exam Directory Management
              </h1>
              <p className="text-xs text-slate-400">
                Control active examinations, outgoing commission portal links, and application click metrics.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Examination</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-semibold">Category:</span>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Categories</option>
              <option value="CENTRAL_GOVERNMENT">Central Government</option>
              <option value="STATE_GOVERNMENT">State Government</option>
              <option value="RAILWAY">Railway</option>
              <option value="BANKING">Banking</option>
              <option value="DEFENCE">Defence</option>
              <option value="ENTRANCE">Entrance</option>
              <option value="MEDICAL">Medical</option>
              <option value="ENGINEERING">Engineering</option>
              <option value="TEACHING">Teaching</option>
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by exam name or code..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 rounded-xl text-xs text-white border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-800">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-semibold">Loading directory data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800 p-8">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-300">No examinations found in directory</p>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Authority & Exam</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Deadline</th>
                    <th className="p-4">Vacancies</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Outgoing Clicks</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-400 font-mono text-[10px] font-bold">
                            {item.authority_code}
                          </span>
                          <span className="font-bold text-white text-xs">{item.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">{item.conducting_authority}</span>
                      </td>

                      <td className="p-4 text-slate-300">
                        {item.category_label || item.category}
                      </td>

                      <td className="p-4 text-slate-300">
                        {new Date(item.application_end_date).toLocaleDateString()}
                      </td>

                      <td className="p-4 text-slate-300">
                        {item.vacancies}
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-400">
                          {item.status}
                        </span>
                      </td>

                      <td className="p-4 text-center font-mono font-bold text-blue-400">
                        {item.apply_clicks || 0}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            href={item.official_application_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                            title="Verify Official URL"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <Link
                            href={`/apply/exam/${item.slug}`}
                            className="p-1.5 bg-blue-900/40 hover:bg-blue-900 text-blue-300 rounded-lg transition-colors"
                            title="View Public Page"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ADD EXAM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add New Examination</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Examination Title:</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. UPSC Combined Geo-Scientist Examination 2026"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Conducting Authority:</label>
                  <input
                    type="text"
                    required
                    value={newAuthority}
                    onChange={(e) => setNewAuthority(e.target.value)}
                    placeholder="e.g. Union Public Service Commission"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Authority Code:</label>
                  <input
                    type="text"
                    required
                    value={newAuthCode}
                    onChange={(e) => setNewAuthCode(e.target.value)}
                    placeholder="e.g. UPSC"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Category:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="CENTRAL_GOVERNMENT">Central Government</option>
                    <option value="STATE_GOVERNMENT">State Government</option>
                    <option value="RAILWAY">Railway</option>
                    <option value="BANKING">Banking</option>
                    <option value="DEFENCE">Defence</option>
                    <option value="ENTRANCE">Entrance</option>
                    <option value="ENGINEERING">Engineering</option>
                    <option value="MEDICAL">Medical</option>
                    <option value="TEACHING">Teaching</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Vacancies:</label>
                  <input
                    type="text"
                    value={newVacancies}
                    onChange={(e) => setNewVacancies(e.target.value)}
                    placeholder="e.g. 56 Posts"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Application Last Date:</label>
                  <input
                    type="date"
                    required
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Exam Date (Display):</label>
                  <input
                    type="text"
                    value={newExamDate}
                    onChange={(e) => setNewExamDate(e.target.value)}
                    placeholder="e.g. September 2026"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Official Commission URL:</label>
                <input
                  type="url"
                  required
                  value={newOfficialUrl}
                  onChange={(e) => setNewOfficialUrl(e.target.value)}
                  placeholder="https://upsconline.nic.in"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNew}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center space-x-1"
                >
                  {savingNew ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Examination</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
