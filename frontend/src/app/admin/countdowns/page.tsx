"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Clock, ArrowLeft, Search, Plus, ExternalLink, ShieldCheck, 
  Trash2, Edit3, CheckCircle, AlertTriangle, RefreshCw, X, Calendar, Check
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminCountdownsPage() {
  const [countdowns, setCountdowns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Add Countdown Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newExamName, setNewExamName] = useState("");
  const [newAuthCode, setNewAuthCode] = useState("");
  const [newEventType, setNewEventType] = useState("EXAM_DATE");
  const [newTargetDate, setNewTargetDate] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newVerification, setNewVerification] = useState("CONFIRMED_OFFICIAL");
  const [newUrl, setNewUrl] = useState("");
  const [savingNew, setSavingNew] = useState(false);

  useEffect(() => {
    loadCountdowns();
  }, []);

  async function loadCountdowns() {
    setLoading(true);
    try {
      const res = await fetchApi("/api/admin/countdowns");
      setCountdowns(res.countdowns || []);
    } catch (err) {
      console.error("Failed to load countdowns:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNew(true);
    try {
      const res = await fetchApi("/api/admin/countdowns", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle,
          exam_name: newExamName,
          authority_code: newAuthCode.toUpperCase(),
          event_type: newEventType,
          target_date: new Date(newTargetDate).toISOString(),
          official_source: newSource,
          verification_status: newVerification,
          exam_slug: newExamName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          official_portal_url: newUrl,
        }),
      });

      if (res && res.countdown) {
        setCountdowns((prev) => [res.countdown, ...prev]);
      }
      setShowAddModal(false);
      setNewTitle("");
      setNewExamName("");
      setNewAuthCode("");
      setNewTargetDate("");
      setNewSource("");
      setNewUrl("");
    } catch (err: any) {
      alert(err.message || "Failed to create countdown");
    } finally {
      setSavingNew(false);
    }
  };

  const filtered = countdowns.filter((c) => {
    const term = search.toLowerCase();
    return (
      (c.title || "").toLowerCase().includes(term) ||
      (c.authority_code || "").toLowerCase().includes(term) ||
      (c.exam_name || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/dashboard"
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Countdown & Deadline Clocks
              </h1>
              <p className="text-xs text-slate-400">
                Manage live countdown clocks, verification tags, and gazette announcement dates.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-600/30 flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Countdown Event</span>
          </button>
        </div>

        {/* Filter and Table */}
        <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">
            Active Countdown Clocks: <strong className="text-white">{countdowns.length}</strong>
          </span>

          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countdowns..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 rounded-xl text-xs text-white border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-800">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-semibold">Loading countdown clocks...</p>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Event & Authority</th>
                  <th className="p-4">Event Type</th>
                  <th className="p-4">Target Date</th>
                  <th className="p-4">Verification Status</th>
                  <th className="p-4">Official Source</th>
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
                        <span className="font-bold text-white text-xs">{item.title}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{item.exam_name}</span>
                    </td>

                    <td className="p-4 text-slate-300">
                      {item.event_type}
                    </td>

                    <td className="p-4 font-mono font-bold text-amber-400">
                      {new Date(item.target_date).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-400">
                        {item.verification_status}
                      </span>
                    </td>

                    <td className="p-4 text-slate-400">
                      {item.official_source}
                    </td>

                    <td className="p-4 text-right">
                      <a
                        href={item.official_portal_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg inline-block transition-colors"
                        title="Open Portal"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD COUNTDOWN MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add New Countdown Clock</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Event Title:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. UPSC CSE Prelims 2026 Examination"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Examination Name:</label>
                  <input
                    type="text"
                    required
                    value={newExamName}
                    onChange={(e) => setNewExamName(e.target.value)}
                    placeholder="e.g. Civil Services Exam"
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
                  <label className="text-slate-400 block mb-1">Event Type:</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="EXAM_DATE">Exam Date</option>
                    <option value="APPLICATION_DEADLINE">Application Deadline</option>
                    <option value="RESULT_ANNOUNCEMENT">Result Announcement</option>
                    <option value="ADMIT_CARD_RELEASE">Admit Card Release</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Target Date & Time:</label>
                  <input
                    type="datetime-local"
                    required
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Official Source:</label>
                  <input
                    type="text"
                    required
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    placeholder="e.g. UPSC Annual Calendar 2026"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Verification Status:</label>
                  <select
                    value={newVerification}
                    onChange={(e) => setNewVerification(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="CONFIRMED_OFFICIAL">Confirmed Official</option>
                    <option value="TENTATIVE">Tentative Expected</option>
                    <option value="VERIFIED">Verified</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Official Commission URL:</label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://upsc.gov.in"
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
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold flex items-center space-x-1"
                >
                  {savingNew ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Countdown</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
