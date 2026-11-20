"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Building2, Search, Filter, ExternalLink, CheckCircle2, 
  MapPin, ShieldCheck, Award, FileText, CreditCard, RefreshCw
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function DirectoryContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("cat") || "";

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [searchKw, setSearchKw] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCat, setSelectedCat] = useState(initialCat);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const [orgs, sts, cats] = await Promise.all([
          fetchApi("/api/organizations"),
          fetchApi("/api/states"),
          fetchApi("/api/categories"),
        ]);
        setOrganizations(orgs || []);
        setStates(sts || []);
        setCategories(cats || []);
      } catch (err) {
        console.error("Directory error:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const filteredOrgs = organizations.filter((org) => {
    if (searchKw.trim()) {
      const q = searchKw.toLowerCase();
      const matchName = org.name.toLowerCase().includes(q);
      const matchCode = org.code.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }
    if (selectedState && org.state_id?.toString() !== selectedState) {
      return false;
    }
    if (selectedCat) {
      const catObj = categories.find((c) => c.code === selectedCat || c.id.toString() === selectedCat);
      if (catObj && org.category_id !== catObj.id) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase">
          <Building2 className="w-3.5 h-3.5" />
          <span>India-Wide Examination Registry</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Examination Directory
        </h1>
        <p className="text-sm text-slate-500">
          Directory of verified examination authorities, testing councils, state commissions, and universities across India.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchKw}
              onChange={(e) => setSearchKw(e.target.value)}
              placeholder="Search by institution name or code..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            >
              <option value="">All Institutional Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            >
              <option value="">All States & Union Territories</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Showing {filteredOrgs.length} institutions</span>
          {(searchKw || selectedState || selectedCat) && (
            <button
              onClick={() => {
                setSearchKw("");
                setSelectedState("");
                setSelectedCat("");
              }}
              className="text-blue-600 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-sm font-medium">Loading National Examination Registry...</p>
        </div>
      ) : filteredOrgs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700">No organizations match your filters</h3>
          <p className="text-xs text-slate-400 mt-1">Try clearing filters or search by a broader keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrgs.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-xs">
                    {org.code}
                  </span>
                  <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{org.verification_status}</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{org.name}</h3>
                  <a
                    href={org.official_website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-[11px] text-slate-400 hover:text-blue-600 mt-1"
                  >
                    <span>{org.official_website}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Integration & Service Transparency Badges */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {org.supports_results !== false && (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-100 flex items-center space-x-1">
                        <span>Results: {org.results_retrieval_mode === "OFFICIAL_API" ? "⚡ Direct API" : org.results_retrieval_mode === "MANUAL_UPLOAD" ? "📄 Upload" : "↗️ Official Redirect"}</span>
                      </span>
                    )}
                    {org.supports_hall_tickets !== false && (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100 flex items-center space-x-1">
                        <span>Admit: {org.hall_tickets_retrieval_mode === "OFFICIAL_API" ? "⚡ Direct API" : "↗️ Official Redirect"}</span>
                      </span>
                    )}
                    {org.supports_id_cards !== false && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-100 flex items-center space-x-1">
                        <span>ID: {org.id_cards_retrieval_mode === "INSTITUTION_INTEGRATION" ? "🏛️ ERP Sync" : "📁 Upload"}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                {org.result_portal_url ? (
                  <Link
                    href={`/results?org_id=${org.id}`}
                    className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Results</span>
                  </Link>
                ) : (
                  <span className="py-1.5 px-2 bg-slate-50 text-slate-400 rounded-lg cursor-not-allowed">
                    No Results
                  </span>
                )}

                {org.hall_ticket_portal_url ? (
                  <Link
                    href={`/hall-tickets?org_id=${org.id}`}
                    className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Admit Card</span>
                  </Link>
                ) : (
                  <span className="py-1.5 px-2 bg-slate-50 text-slate-400 rounded-lg cursor-not-allowed">
                    No Admit
                  </span>
                )}

                {org.id_card_portal_url ? (
                  <Link
                    href={`/id-cards?org_id=${org.id}`}
                    className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>ID Card</span>
                  </Link>
                ) : (
                  <span className="py-1.5 px-2 bg-slate-50 text-slate-400 rounded-lg cursor-not-allowed">
                    No ID Card
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
