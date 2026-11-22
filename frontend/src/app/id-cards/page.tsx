"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  CreditCard, Search, Upload, Download, CheckCircle2, 
  AlertCircle, ShieldCheck, RefreshCw, ExternalLink, FileText, ArrowRight, Check
} from "lucide-react";
import { fetchApi, getFileUrl } from "@/lib/api";

export default function IDCardsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [admissionYear, setAdmissionYear] = useState("2023");
  const [saveToDocs, setSaveToDocs] = useState(true);

  const [loading, setLoading] = useState(false);
  const [idCardData, setIdCardData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Manual Upload state
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    fetchApi("/api/organizations")
      .then((data) => setOrganizations(data || []))
      .catch((err) => console.error(err));
  }, []);

  const handleRetrieveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId) {
      setErrorMsg("Please select your university or college.");
      return;
    }
    if (!enrollmentNo.trim()) {
      setErrorMsg("Please enter your Student Enrollment Number.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setIdCardData(null);
    setSaveSuccess(false);

    try {
      const res = await fetchApi("/api/id-cards/check", {
        method: "POST",
        body: JSON.stringify({
          organization_id: parseInt(selectedOrgId),
          student_enrollment_no: enrollmentNo.trim(),
          admission_year: parseInt(admissionYear),
          save_to_documents: saveToDocs,
        }),
      });
      setIdCardData(res);
      if (res.document_id) {
        setSaveSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to retrieve student ID card. Your institution may require direct ERP credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccessMsg(null);

    try {
      const token = localStorage.getItem("examhub_token");
      if (!token) {
        throw new Error("Please log in to your student account first to upload documents to your personal vault.");
      }

      const formData = new FormData();
      formData.append("title", uploadTitle || "Institution Student ID Card");
      formData.append("organization_id", selectedOrgId || "1");
      formData.append("file", uploadFile);

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${API_BASE}/api/id-cards/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }

      setUploadSuccessMsg("Legitimate student ID card uploaded, encrypted, and saved to your personal library.");
      setUploadFile(null);
      setUploadTitle("");
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Please check the file and try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans">
      {/* Page Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-300/40">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Student Identity Gateway</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Student ID Card Retrieval & Storage
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Access verified digital student identity documentation via authorized institutional systems or safely store legitimate scans in your encrypted vault.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Method 1: Authorized Retrieval Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Method 1</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Retrieve from Institution Portal</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Direct integration with university registrar and ERP databases</p>
          </div>

          <form onSubmit={handleRetrieveCard} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-1.5">
                Select Institution / University *
              </label>
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium cursor-pointer"
              >
                <option value="">-- Choose University / College --</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-1.5">
                  Enrollment / Roll No. *
                </label>
                <input
                  type="text"
                  value={enrollmentNo}
                  onChange={(e) => setEnrollmentNo(e.target.value)}
                  placeholder="e.g. 22DUCS0084"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-1.5">
                  Admission Year
                </label>
                <input
                  type="number"
                  value={admissionYear}
                  onChange={(e) => setAdmissionYear(e.target.value)}
                  min="2018"
                  max="2026"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveToDocs}
                  onChange={(e) => setSaveToDocs(e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <span>Save ID card in my encrypted student document vault</span>
              </label>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start space-x-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-xs"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting to Institution Registry...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Retrieve Student Identity Card</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Method 2: Manual Legitimate Upload */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Method 2</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upload Legitimate Physical ID Scan</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Store and preview your institution-issued card securely</p>
          </div>

          <form onSubmit={handleManualUpload} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-1.5">
                Card Title / Institution Name
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g. IIT Delhi College ID Card"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-1.5">
                Select Scan (PDF, JPEG or PNG - Max 15MB) *
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                required
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/40 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100"
              />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border border-slate-200/60 dark:border-slate-700/60">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Integrity Notice:</span> ExamHub India enforces strict zero-tolerance for fraudulent identity documents. All cards stored are for authorized student verification.
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-800">
                {uploadError}
              </div>
            )}
            {uploadSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-1.5 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 text-xs border border-slate-700"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validating and Storing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload & Secure in Vault</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* RETRIEVED ID CARD PREVIEW */}
      {idCardData && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-w-2xl mx-auto animate-fadeIn">
          <div className="bg-gradient-to-r from-purple-950 to-slate-900 text-white p-6 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                Institutional Academic Record
              </span>
              <h3 className="text-lg font-bold">{idCardData.institution_name}</h3>
            </div>
            <a
              href={getFileUrl(idCardData.download_url)}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>
          </div>

          <div className="p-6 space-y-4">
            <div className="border border-purple-200 dark:border-purple-900/60 rounded-xl p-5 bg-gradient-to-br from-white dark:from-slate-800 to-purple-50/30 dark:to-purple-950/20 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase">Student Name</span>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{idCardData.student_name}</h4>
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">{idCardData.course_branch}</p>
                </div>
                <div className="w-16 h-20 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md flex items-center justify-center text-[10px] text-slate-500 font-bold">
                  PHOTO
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-purple-100 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 block">Enrollment No.</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{idCardData.enrollment_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Academic Validity</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{idCardData.valid_upto}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Blood Group</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{idCardData.blood_group}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Verification Source</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{idCardData.source}</span>
                </div>
              </div>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <span>Stored safely in your student document vault.</span>
                <Link href="/dashboard" className="font-bold underline">
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
