"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  FileText, Search, Download, Calendar, Clock, MapPin, 
  CheckCircle2, AlertCircle, RefreshCw, ExternalLink, ShieldCheck, Printer,
  Landmark, Building2, Sparkles, ArrowRight, Check
} from "lucide-react";
import { fetchApi, getFileUrl } from "@/lib/api";

export default function HallTicketsContent() {
  const searchParams = useSearchParams();
  const preselectedExamId = searchParams.get("exam_id");

  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>(preselectedExamId || "");
  const [examSearchFilter, setExamSearchFilter] = useState("");
  const [appNumber, setAppNumber] = useState("");
  const [dob, setDob] = useState("");
  const [saveToDocs, setSaveToDocs] = useState(true);

  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchApi("/api/exams?limit=60")
      .then((data) => {
        setExams(data || []);
        if (preselectedExamId) {
          setSelectedExamId(preselectedExamId);
        }
      })
      .catch((err) => console.error(err));
  }, [preselectedExamId]);

  const handleDownloadTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId) {
      setErrorMsg("Please select an examination first.");
      return;
    }
    if (!appNumber.trim()) {
      setErrorMsg("Please enter your Application or Registration Number.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setTicketData(null);
    setSaveSuccess(false);

    try {
      const res = await fetchApi("/api/hall-tickets/check", {
        method: "POST",
        body: JSON.stringify({
          examination_id: parseInt(selectedExamId),
          application_number: appNumber.trim(),
          date_of_birth: dob.trim() || undefined,
          save_to_documents: saveToDocs,
        }),
      });
      setTicketData(res);
      if (res.document_id) {
        setSaveSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Hall ticket not found or not yet released for this application number.");
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter((e) => {
    if (!examSearchFilter) return true;
    const q = examSearchFilter.toLowerCase();
    return (
      e.name?.toLowerCase().includes(q) ||
      e.organization_code?.toLowerCase().includes(q) ||
      e.organization_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      {/* Page Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-300/40">
          <FileText className="w-3.5 h-3.5" />
          <span>National Hall Ticket Engine</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Download Hall Tickets & e-Admit Cards
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Retrieve verified examination entry passes, verify allotted test center addresses, shift reporting times, and download high-resolution PDF printouts.
        </p>
      </div>

      {/* Main Search Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 max-w-3xl mx-auto space-y-5">
        <form onSubmit={handleDownloadTicket} className="space-y-5">
          {/* Select Exam with Quick Filter */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                Select Examination *
              </label>
              <input
                type="text"
                placeholder="Filter exam name..."
                value={examSearchFilter}
                onChange={(e) => setExamSearchFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <select
              value={selectedExamId}
              onChange={(e) => {
                setSelectedExamId(e.target.value);
                setTicketData(null);
                setErrorMsg(null);
              }}
              required
              className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="">-- Choose Examination (UPSC, SSC, RRB, NTA, Universities) --</option>
              {filteredExams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} ({exam.organization_code} • {exam.year})
                </option>
              ))}
            </select>
          </div>

          {/* Application Number & DOB */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-1.5">
                Application / Registration Number *
              </label>
              <input
                type="text"
                value={appNumber}
                onChange={(e) => setAppNumber(e.target.value)}
                placeholder="e.g. UPSC998877 or 2603104521"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-1.5">
                Date of Birth (Where Required)
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
              />
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={saveToDocs}
                onChange={(e) => setSaveToDocs(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Save a copy of this admit card securely in my Personal Document Vault</span>
            </label>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMsg}</p>
                <p className="mt-0.5 text-[11px] text-red-600 dark:text-red-400">
                  Admit cards are generally published 7 to 14 days before the exam date. Verify official gazettes if in doubt.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-xs"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Checking Portal Release Records...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Retrieve & Validate Hall Ticket</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* HALL TICKET PREVIEW CARD */}
      {ticketData && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-w-4xl mx-auto animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white p-6 sm:p-7 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 w-fit mb-2 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Official e-Admit Card Verified</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black">{ticketData.examination_name}</h2>
              <p className="text-xs text-slate-300">{ticketData.organization_name}</p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <a
                href={getFileUrl(ticketData.pdf_download_url)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Admit Card PDF</span>
              </a>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-7 space-y-6 text-xs">
            {/* Candidate & Exam Timing Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Candidate Name</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{ticketData.candidate_name}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Roll Number</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">{ticketData.roll_number}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Application No.</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{ticketData.application_number}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Exam Date</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{ticketData.exam_date}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Exam Timing</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{ticketData.exam_time}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-red-600 font-semibold">Reporting & Gate Closure</span>
                <span className="font-bold text-red-600 dark:text-red-400 text-sm">{ticketData.reporting_time}</span>
              </div>
            </div>

            {/* Test Center Allotment */}
            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-1">
              <div className="flex items-center space-x-2 text-blue-900 dark:text-blue-300 font-bold">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Allotted Examination Center (Code: {ticketData.exam_center_code})</span>
              </div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">{ticketData.exam_center_name}</p>
              <p className="text-slate-600 dark:text-slate-400">{ticketData.exam_center_address}</p>
            </div>

            {/* Important Instructions */}
            {ticketData.instructions && ticketData.instructions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Important Candidate Instructions
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 text-slate-700 dark:text-slate-300">
                  {ticketData.instructions.map((inst: string, i: number) => (
                    <div key={i} className="flex items-start space-x-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{inst}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Status / Vault */}
            {saveSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Admit card secured in your <strong>Personal Document Library</strong>.</span>
                </div>
                <Link href="/dashboard" className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
                  Open Vault →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
