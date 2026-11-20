"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  FileText, Search, Download, Calendar, Clock, MapPin, 
  CheckCircle2, AlertCircle, RefreshCw, ExternalLink, ShieldCheck, Printer
} from "lucide-react";
import { fetchApi, getFileUrl } from "@/lib/api";

export default function HallTicketsContent() {
  const searchParams = useSearchParams();
  const preselectedExamId = searchParams.get("exam_id");

  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>(preselectedExamId || "");
  const [appNumber, setAppNumber] = useState("");
  const [dob, setDob] = useState("");
  const [saveToDocs, setSaveToDocs] = useState(true);

  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchApi("/api/exams?limit=50")
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
      setErrorMsg(err.message || "Hall ticket not found or not yet released for this application.");
    } finally {
      setLoading(false);
    }
  };

  const selectedExam = exams.find((e) => e.id.toString() === selectedExamId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
          <FileText className="w-3.5 h-3.5" />
          <span>National Hall Ticket Engine</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Download Hall Tickets & Admit Cards
        </h1>
        <p className="text-sm text-slate-500">
          Retrieve newly released examination entry passes, verify allotted test centers, examination shifts, and download high-resolution PDF printouts.
        </p>
      </div>

      {/* Main Search Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto">
        <form onSubmit={handleDownloadTicket} className="space-y-5">
          {/* Select Exam */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
              Select Examination *
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => {
                setSelectedExamId(e.target.value);
                setTicketData(null);
                setErrorMsg(null);
              }}
              required
              className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-medium"
            >
              <option value="">-- Choose Examination (UPSC, SSC, RRB, NTA, Universities) --</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} ({exam.organization_code} • {exam.year})
                </option>
              ))}
            </select>
          </div>

          {/* Application Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Application / Registration Number *
              </label>
              <input
                type="text"
                value={appNumber}
                onChange={(e) => setAppNumber(e.target.value)}
                placeholder="e.g. UPSC998877 or 2603104521"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Date of Birth (Where Required)
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-medium"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={saveToDocs}
                onChange={(e) => setSaveToDocs(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Save a copy of this admit card in my Personal Document Vault</span>
            </label>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMsg}</p>
                <p className="mt-1 text-[11px] text-red-600">
                  Admit cards are generally released 7 to 14 days before the exam date.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-4xl mx-auto animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1 w-fit mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Official e-Admit Card Available</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black">{ticketData.examination_name}</h2>
              <p className="text-xs text-slate-300">{ticketData.organization_name}</p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <a
                href={getFileUrl(ticketData.pdf_download_url)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Admit Card PDF</span>
              </a>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Candidate & Exam Timing Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Candidate Name</span>
                <span className="font-bold text-slate-900 text-sm">{ticketData.candidate_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Roll Number</span>
                <span className="font-bold text-emerald-800 text-sm">{ticketData.roll_number}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Application No.</span>
                <span className="font-bold text-slate-900 text-sm">{ticketData.application_number}</span>
              </div>
              <div>
                <span className="text-slate-500 block flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Exam Date</span>
                </span>
                <span className="font-bold text-slate-900 text-sm">{ticketData.exam_date}</span>
              </div>
              <div>
                <span className="text-slate-500 block flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Exam Timing</span>
                </span>
                <span className="font-bold text-slate-900 text-sm">{ticketData.exam_time}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-red-600 font-semibold">Reporting & Gate Closure</span>
                <span className="font-bold text-red-700 text-sm">{ticketData.reporting_time}</span>
              </div>
            </div>

            {/* Test Center Allotment */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs space-y-1">
              <div className="flex items-center space-x-2 text-blue-900 font-bold">
                <MapPin className="w-4 h-4 text-blue-700" />
                <span>Allotted Examination Center (Code: {ticketData.exam_center_code})</span>
              </div>
              <p className="font-semibold text-slate-900 text-sm">{ticketData.exam_center_name}</p>
              <p className="text-slate-600">{ticketData.exam_center_address}</p>
            </div>

            {/* Important Instructions */}
            {ticketData.instructions && ticketData.instructions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Important Candidate Instructions
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-700">
                  {ticketData.instructions.map((inst: string, i: number) => (
                    <div key={i} className="flex items-start space-x-2">
                      <span className="text-emerald-700 font-bold">•</span>
                      <span>{inst}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Status / Vault */}
            {saveSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Admit card secured in your <strong>Personal Document Library</strong>.</span>
                </div>
                <Link href="/dashboard" className="font-bold text-emerald-900 underline hover:no-underline">
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
