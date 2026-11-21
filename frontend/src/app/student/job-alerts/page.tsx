"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Briefcase, Sparkles, Plus, Bell, CheckCircle, 
  ExternalLink, Trash2, Settings, ArrowRight, Bookmark, X, Filter
} from "lucide-react";
import StudentNav from "@/components/StudentNav";
import { fetchApi } from "@/lib/api";

export default function StudentJobAlertsPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  // Create Subscription Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subKeyword, setSubKeyword] = useState("");
  const [subSector, setSubSector] = useState("ALL");
  const [subFrequency, setSubFrequency] = useState("INSTANT");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("examhub_user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || 1;

      const [recsRes, alertsRes] = await Promise.all([
        fetchApi(`/api/student/job-recommendations?user_id=${userId}&limit=12`),
        fetchApi(`/api/student/job-alerts?user_id=${userId}`)
      ]);

      if (recsRes && recsRes.recommendations) {
        setRecommendations(recsRes.recommendations);
      }
      if (alertsRes) {
        setAlerts(alertsRes.alerts || []);
        setSubscriptions(alertsRes.subscriptions || []);
      }
    } catch (err) {
      console.error("Failed to load job alerts:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSubscription(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const userStr = localStorage.getItem("examhub_user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || 1;

      const res = await fetchApi(`/api/student/job-alerts/subscribe?user_id=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: subKeyword.trim(),
          sector: subSector,
          frequency: subFrequency
        })
      });

      if (res && res.success) {
        setIsModalOpen(false);
        setSubKeyword("");
        setSuccessMsg("Job alert subscription created! You will receive notifications when matching vacancies appear.");
        setTimeout(() => setSuccessMsg(""), 4000);
        loadData();
      }
    } catch (err: any) {
      alert("Failed to subscribe: " + (err.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteSubscription(id: number) {
    if (!confirm("Are you sure you want to cancel this job alert?")) return;
    try {
      const userStr = localStorage.getItem("examhub_user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || 1;

      await fetchApi(`/api/student/job-alerts/subscriptions/${id}?user_id=${userId}`, {
        method: "DELETE"
      });
      setSubscriptions(subscriptions.filter((s) => s.id !== id));
      setSuccessMsg("Alert subscription removed.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      alert("Failed to cancel subscription: " + (err.message || "Unknown error"));
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <StudentNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Recommendation Engine</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Personalized Career & Job Alerts
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Vacancies matched against your academic degree, verified qualifications, skills, and sector preferences.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <Link
              href="/student/settings"
              className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Career Profile</span>
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Alert</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Active Job Alert Feeds Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Active Job Alert Feeds (100% Free) ({subscriptions.length})</h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center space-x-2"
              >
                <span className="font-bold text-slate-800">
                  {sub.keyword ? `"${sub.keyword}"` : "All Verified Openings"}
                </span>
                <span className="text-[10px] text-slate-400">({sub.sector || "ALL"} • {sub.frequency})</span>
                <button
                  onClick={() => handleDeleteSubscription(sub.id)}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                  title="Remove alert feed"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Top Matches Feed */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Recommended Opportunities For You
              </h2>
              <p className="text-xs text-slate-500">
                Sorted by alignment score with your degree, technical skills, and experience criteria.
              </p>
            </div>
            <Link
              href="/jobs"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>Explore All Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              Computing profile matching scores...
            </div>
          ) : recommendations.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900">No matching jobs yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Update your degree and skills in <Link href="/student/settings" className="text-blue-600 underline">Career Profile Settings</Link> to receive personalized recommendations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendations.map((job) => (
                <div
                  key={job.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {job.sector}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-100 text-purple-800 border border-purple-200 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        <span>{job.match_percentage}% MATCH</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900 tracking-tight line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">{job.organization_name}</p>
                    </div>

                    {/* Match Reasons */}
                    {job.match_reasons && job.match_reasons.length > 0 && (
                      <div className="p-2.5 bg-purple-50/60 border border-purple-100 rounded-xl text-[11px] text-purple-900 space-y-1">
                        {job.match_reasons.map((r: string, idx: number) => (
                          <div key={idx} className="flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
                            <span className="line-clamp-1">{r}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Vacancies:</span>
                        <span className="font-bold text-slate-900">{job.total_vacancies?.toLocaleString() || "Verified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pay Scale:</span>
                        <span className="font-bold text-slate-900">{job.pay_scale || "Govt Rules"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Last Date:</span>
                        <span className="font-bold text-slate-900">
                          {job.last_date_to_apply ? new Date(job.last_date_to_apply).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Open"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/jobs/${job.slug || job.id}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <span>Check Eligibility & Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {job.official_apply_url && (
                      <a
                        href={job.official_apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                        title="Official Application Portal"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Alert Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">Create Custom Job Alert</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keyword / Designation *</label>
                <input
                  type="text"
                  required
                  value={subKeyword}
                  onChange={(e) => setSubKeyword(e.target.value)}
                  placeholder="e.g. Software Engineer, Assistant Professor, Bank PO"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sector Preference</label>
                <select
                  value={subSector}
                  onChange={(e) => setSubSector(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                >
                  <option value="ALL">All Sectors (Govt & Private)</option>
                  <option value="CENTRAL_GOVT">Central Government</option>
                  <option value="STATE_GOVT">State Government</option>
                  <option value="BANKING">Banking & Finance</option>
                  <option value="RAILWAY">Railways</option>
                  <option value="DEFENCE">Defence Forces</option>
                  <option value="PRIVATE">Private Sector</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notification Frequency</label>
                <select
                  value={subFrequency}
                  onChange={(e) => setSubFrequency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                >
                  <option value="INSTANT">Instant (As soon as published)</option>
                  <option value="DAILY">Daily Digest</option>
                  <option value="WEEKLY">Weekly Summary</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Create Alert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
