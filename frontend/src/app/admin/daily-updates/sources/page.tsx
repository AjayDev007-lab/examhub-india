"use client";

import React, { useState, useEffect } from "react";
import AdminDailyUpdatesNav from "@/components/AdminDailyUpdatesNav";
import { fetchApi } from "@/lib/api";
import { 
  ShieldCheck, ExternalLink, Plus, Filter, Search, 
  CheckCircle2, AlertTriangle, Globe, Building 
} from "lucide-react";

export default function AdminDailySourcesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSource, setNewSource] = useState({
    name: "",
    organization_code: "",
    organization_name: "",
    category: "GOVT_JOB",
    state_code: "ALL",
    official_website_url: "",
    notification_url: "",
    check_frequency: "DAILY"
  });

  useEffect(() => {
    loadSources();
  }, []);

  async function loadSources() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/admin/daily-updates/sources");
      setSources(res.sources || []);
    } catch (err) {
      console.error("Failed to load monitoring sources:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSource(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetchApi("/api/admin/daily-updates/sources", {
        method: "POST",
        body: JSON.stringify(newSource)
      });
      setShowAddModal(false);
      setNewSource({
        name: "",
        organization_code: "",
        organization_name: "",
        category: "GOVT_JOB",
        state_code: "ALL",
        official_website_url: "",
        notification_url: "",
        check_frequency: "DAILY"
      });
      await loadSources();
    } catch (err) {
      console.error("Failed to add source:", err);
    }
  }

  const filtered = sources.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.organization_name.toLowerCase().includes(term) ||
      s.organization_code.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <AdminDailyUpdatesNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Official Monitoring Sources Directory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified recruitment commissions, testing boards, and state public service portals.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search sources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#102D59]/40 border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] w-56"
              />
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register New Source</span>
            </button>
          </div>
        </div>

        {/* Sources Table */}
        <div className="bg-white dark:bg-[#102D59]/30 rounded-2xl border border-slate-200 dark:border-blue-900/40 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-blue-900/40">
                <tr>
                  <th className="py-3.5 px-4">Organization & Source Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">State</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 px-4">Frequency</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Official Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-blue-900/20">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">Loading verified sources...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">No matching sources found.</td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                        <div className="text-[11px] text-slate-400">{s.organization_name} ({s.organization_code})</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                          {s.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">{s.state_code}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1 w-fit">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{s.verification_status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-500">{s.check_frequency}</td>
                      <td className="py-3 px-4">
                        <span className="w-2 h-2 rounded-full inline-block bg-emerald-500 mr-1.5" />
                        <span className="text-xs font-semibold text-emerald-600">Active</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            href={s.official_website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Official Website"
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={s.notification_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                            title="Specific Notification URL"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Registering New Source */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-blue-900/40 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Register Official Information Source</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
              </div>

              <form onSubmit={handleAddSource} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Source Name</label>
                  <input
                    type="text"
                    required
                    value={newSource.name}
                    onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                    placeholder="e.g. Kerala Public Service Commission Recruitment"
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Org Code</label>
                    <input
                      type="text"
                      required
                      value={newSource.organization_code}
                      onChange={(e) => setNewSource({ ...newSource, organization_code: e.target.value })}
                      placeholder="e.g. KERALAPSC"
                      className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Category</label>
                    <select
                      value={newSource.category}
                      onChange={(e) => setNewSource({ ...newSource, category: e.target.value })}
                      className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="GOVT_JOB">Government Job</option>
                      <option value="PRIVATE_JOB">Private Job</option>
                      <option value="EXAM">Examination</option>
                      <option value="RESULT">Exam Result</option>
                      <option value="SCHOOL_RESULT">School Result</option>
                      <option value="ADMIT_CARD">Admit Card</option>
                      <option value="SCHOLARSHIP">Scholarship</option>
                      <option value="ADMISSION">Admission</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Official Website URL</label>
                  <input
                    type="url"
                    required
                    value={newSource.official_website_url}
                    onChange={(e) => setNewSource({ ...newSource, official_website_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Specific Notification / RSS URL</label>
                  <input
                    type="url"
                    required
                    value={newSource.notification_url}
                    onChange={(e) => setNewSource({ ...newSource, notification_url: e.target.value })}
                    placeholder="https://.../notices"
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20"
                  >
                    Save Source
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
