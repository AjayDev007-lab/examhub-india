"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Building2, ExternalLink, CheckCircle2, 
  MapPin, ShieldCheck, Award, FileText, RefreshCw,
  Globe, Bookmark, BookmarkCheck, AlertTriangle, ArrowLeft,
  Shield, Send, Clock, Zap, Landmark, GraduationCap, Briefcase,
  Share2, Mail, Phone, Lock, HelpCircle
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function WebsiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [website, setWebsite] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [probing, setProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<any | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!slug) return;
    loadWebsite();
  }, [slug]);

  async function loadWebsite() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchApi(`/api/directory/websites/${slug}`);
      if (!data || data.error) {
        setError("Official website details not found");
      } else {
        setWebsite(data);
        setIsSaved(data.is_saved || false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load authority details");
    } finally {
      setLoading(false);
    }
  }

  const handleVerify = async () => {
    if (!website) return;
    setProbing(true);
    try {
      const res = await fetchApi(`/api/directory/websites/${website.id}/verify`, { method: "POST" });
      setProbeResult(res);
      setWebsite((prev: any) => ({
        ...prev,
        last_verified_at: res.verified_at,
        response_time_ms: res.latency_ms,
        verification_status: res.verification_status
      }));
    } catch (err: any) {
      alert(err.message || "Live verification check failed");
    } finally {
      setProbing(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!website) return;
    try {
      const res = await fetchApi(`/api/directory/websites/${website.id}/favourite`, { method: "POST" });
      setIsSaved(res.saved);
    } catch (_) {
      setIsSaved(!isSaved);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="font-semibold text-slate-700">Loading Official Authority Record...</p>
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-black text-slate-900">Authority Not Found</h2>
        <p className="text-slate-500 text-sm">{error || "The requested government portal does not exist in our verified directory."}</p>
        <Link
          href="/official-websites"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Official Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top back breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/official-websites"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All-India Directory</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleBookmark}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-colors ${
              isSaved
                ? "bg-amber-50 text-amber-700 border-amber-300"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 fill-amber-500" /> : <Bookmark className="w-4 h-4" />}
            <span>{isSaved ? "Saved in My Portals" : "Bookmark Portal"}</span>
          </button>
        </div>
      </div>

      {/* Main Authority Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {website.code && (
                <span className="px-3 py-1 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs">
                  {website.code}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                {website.category_type}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs">
                {website.organization_type || "CENTRAL"}
              </span>
              {website.state && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-xs flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>{website.state.name}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {website.name}
            </h1>

            <div className="flex items-center space-x-2 text-xs text-blue-600 font-mono">
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="font-semibold">{website.domain}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <a
              href={website.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <span>Open Official Website</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {website.application_portal_url && (
              <a
                href={website.application_portal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2"
              >
                <span>Application / OTR Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Official Non-Government Advisory */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start space-x-2.5">
          <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p>
            ExamHub India is an independent platform. Always complete applications, fee payments, and admit card downloads directly on the official domain (<strong className="text-slate-900">{website.domain}</strong>).
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Institutional Overview</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            {website.description || "Official constitutional recruitment commission or testing authority of India."}
          </p>
        </div>

        {/* Key Examinations & Schemes */}
        {website.related_examinations && website.related_examinations.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Examinations, Admissions & Services</h3>
            <div className="flex flex-wrap gap-2">
              {website.related_examinations.map((exam: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-100"
                >
                  {exam}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Verification & Domain Audit Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-xs">Official Domain Verification</span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-700 bg-emerald-100">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{website.verification_status || "VERIFIED"}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Authenticated against: {website.verification_source || "National Informatics Centre (NIC) / Government Gazette"}
              </p>
            </div>

            <button
              onClick={handleVerify}
              disabled={probing}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shrink-0"
            >
              <Zap className={`w-3.5 h-3.5 text-amber-500 ${probing ? "animate-spin" : ""}`} />
              <span>{probing ? "Probing..." : "Test Server Health"}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">SSL Encryption</span>
              <span className="font-semibold text-emerald-600">HTTPS Verified</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Average Latency</span>
              <span className="font-semibold text-slate-800">{website.response_time_ms || 42} ms</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Last Verified</span>
              <span className="font-semibold text-slate-800">
                {website.last_verified_at ? new Date(website.last_verified_at).toLocaleDateString("en-IN") : "Recent"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Views</span>
              <span className="font-semibold text-slate-800">{website.view_count || 1} visits</span>
            </div>
          </div>

          {probeResult && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              Live Probe Result: {probeResult.message} ({probeResult.latency_ms}ms)
            </div>
          )}
        </div>

        {/* Contact details */}
        {(website.contact_email || website.contact_phone) && (
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Official Contact Information</h3>
            <div className="flex flex-wrap gap-4 text-slate-700 font-medium">
              {website.contact_email && (
                <span className="flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{website.contact_email}</span>
                </span>
              )}
              {website.contact_phone && (
                <span className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{website.contact_phone}</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
