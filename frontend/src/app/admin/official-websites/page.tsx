"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Globe, ArrowLeft, Search, CheckCircle, AlertTriangle, 
  ExternalLink, RefreshCw, ShieldCheck, Filter, Plus, Edit3
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminOfficialWebsitesPage() {
  const [websites, setWebsites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadWebsites();
  }, [catFilter, statusFilter]);

  async function loadWebsites() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (catFilter !== "ALL") params.append("category_type", catFilter);
      params.append("limit", "100");

      const res = await fetchApi(`/api/directory/websites?${params.toString()}`);
      if (res && res.websites) {
        setWebsites(res.websites);
      }
    } catch (err) {
      console.error("Failed to load websites:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = websites.filter((w) => {
    const term = search.toLowerCase();
    const name = (w.name || "").toLowerCase();
    const code = (w.code || "").toLowerCase();
    const domain = (w.domain || "").toLowerCase();
    return name.includes(term) || code.includes(term) || domain.includes(term);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/dashboard"
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Official Government Websites Directory</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Verification status, authoritative domain registry, and periodic connectivity probing across all states & UTs.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/official-websites"
              target="_blank"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <span>View Public Directory</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={loadWebsites}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by organization, commission, or domain..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="CENTRAL_RECRUITMENT">Central Recruitment (UPSC, SSC, RRB)</option>
              <option value="STATE_PSC">State PSCs</option>
              <option value="NATIONAL_ENTRANCE">National Entrance (NTA, NEET, JEE)</option>
              <option value="DEFENCE_FORCES">Defence Forces (Army, Navy, AFCAT)</option>
              <option value="EDUCATION_BOARD">Education Boards (CBSE, CISCE)</option>
              <option value="SCHOLARSHIP_PORTAL">Scholarships</option>
            </select>
          </div>
        </div>

        {/* Websites Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Authority / Portal Name</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Official Domain</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-400" />
                      Loading official directory...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                      No portals found matching filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-white text-sm">{w.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{w.code || "GOVT"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {w.category_type}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-300">
                        {w.domain || "gov.in"}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1 w-max">
                          <CheckCircle className="w-3 h-3" />
                          <span>{w.verification_status || "VERIFIED"}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <a
                          href={w.official_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-blue-400 hover:underline inline-flex items-center space-x-1"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
