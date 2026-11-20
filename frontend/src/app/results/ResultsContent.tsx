"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Award, Search, CheckCircle2, Download, Save, AlertCircle, 
  ExternalLink, FileText, ArrowRight, ShieldCheck, Printer, RefreshCw
} from "lucide-react";
import { fetchApi, getFileUrl } from "@/lib/api";

export default function ResultsContent() {
  const searchParams = useSearchParams();
  const preselectedExamId = searchParams.get("exam_id");

  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>(preselectedExamId || "");
  const [rollNumber, setRollNumber] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [dob, setDob] = useState("");
  const [saveToDocs, setSaveToDocs] = useState(true);

  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
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

  const handleCheckResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId) {
      setErrorMsg("Please select an examination first.");
      return;
    }
    if (!rollNumber.trim()) {
      setErrorMsg("Please enter your Roll Number or Hall Ticket Number.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResultData(null);
    setSaveSuccess(false);

    try {
      const res = await fetchApi("/api/results/check", {
        method: "POST",
        body: JSON.stringify({
          examination_id: parseInt(selectedExamId),
          roll_number: rollNumber.trim(),
          registration_number: regNumber.trim() || undefined,
          date_of_birth: dob.trim() || undefined,
          save_to_documents: saveToDocs,
        }),
      });
      setResultData(res);
      if (res.document_id) {
        setSaveSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to retrieve results. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  const selectedExam = exams.find((e) => e.id.toString() === selectedExamId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase">
          <Award className="w-3.5 h-3.5" />
          <span>National Result Checker</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Check Examination Results
        </h1>
        <p className="text-sm text-slate-500">
          Retrieve official verified scorecards, marks breakdown, grades, and ranks directly from authorized board integrations.
        </p>
      </div>

      {/* Main Search / Query Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto">
        <form onSubmit={handleCheckResult} className="space-y-5">
          {/* Select Exam */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
              Select Examination *
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => {
                setSelectedExamId(e.target.value);
                setResultData(null);
                setErrorMsg(null);
              }}
              required
              className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
            >
              <option value="">-- Choose Examination (UPSC, SSC, NEET, JEE, Universities) --</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} ({exam.organization_code} • {exam.year} {exam.cycle})
                </option>
              ))}
            </select>
          </div>

          {selectedExam && (
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between text-xs text-blue-900">
              <div>
                <span className="font-bold">Organization:</span> {selectedExam.organization_name}
              </div>
              <div className="font-semibold text-emerald-700 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Official Integration</span>
              </div>
            </div>
          )}

          {/* Roll Number & Registration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Roll / Hall Ticket Number *
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 2604108821 or 0824190"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                As printed on your admit card
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Registration / Application No. (Optional)
              </label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="Optional application number"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                Date of Birth (Where Required)
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
              />
            </div>

            <div className="pt-5">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveToDocs}
                  onChange={(e) => setSaveToDocs(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Automatically save scorecard in my Personal Vault</span>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMsg}</p>
                {selectedExam?.organization_name && (
                  <p className="mt-1 text-[11px] text-red-600">
                    If this result was just released, it may require a few moments to sync, or check the official site.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Connecting to Authorized Result Service...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Retrieve Official Result</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* RESULT DISPLAY CARD */}
      {resultData && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-4xl mx-auto animate-fadeIn">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-primary-950 to-primary-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Officially Verified Result</span>
                </span>
                <span className="text-xs text-slate-300">
                  Published: {new Date(resultData.published_date || Date.now()).toLocaleDateString("en-IN")}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">{resultData.examination_name}</h2>
              <p className="text-xs text-slate-300">{resultData.organization_name}</p>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={getFileUrl(`/api/results/${resultData.id}/download`)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Scorecard</span>
              </a>
            </div>
          </div>

          {/* Candidate Summary Grid */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Candidate Name</span>
                <span className="font-bold text-slate-900 text-sm">{resultData.student_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Roll Number</span>
                <span className="font-bold text-slate-900 text-sm">{resultData.student_identifier_roll}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Qualifying Status</span>
                <span className={`font-bold text-sm ${
                  resultData.qualifying_status in ["QUALIFIED", "PASS"] ? "text-emerald-700" : "text-amber-700"
                }`}>
                  {resultData.qualifying_status}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Rank / Merit</span>
                <span className="font-bold text-blue-700 text-sm">{resultData.rank || "N/A"}</span>
              </div>
            </div>

            {/* Total Marks & Percentage */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-center">
                <span className="text-xs text-slate-600 font-semibold block">Total Marks</span>
                <span className="text-2xl font-black text-primary-950">
                  {resultData.marks_obtained !== null ? resultData.marks_obtained : "N/A"}
                  <span className="text-xs text-slate-400 font-normal"> / {resultData.max_marks || "100"}</span>
                </span>
              </div>
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-center">
                <span className="text-xs text-slate-600 font-semibold block">Percentage / Percentile</span>
                <span className="text-2xl font-black text-blue-700">
                  {resultData.percentage ? `${resultData.percentage.toFixed(2)}%` : "N/A"}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-center">
                <span className="text-xs text-slate-600 font-semibold block">Grade / Remark</span>
                <span className="text-lg font-bold text-slate-800">
                  {resultData.grade || "Qualified"}
                </span>
              </div>
            </div>

            {/* Subject Marks Table */}
            {resultData.subject_marks && Object.keys(resultData.subject_marks).length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Subject-Wise Marks Statement
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold">
                      <tr>
                        <th className="px-4 py-2.5 text-left">Subject / Component</th>
                        <th className="px-4 py-2.5 text-right">Marks / Score Obtained</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {Object.entries(resultData.subject_marks).map(([subj, mark]: any, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                          <td className="px-4 py-2.5 font-medium text-slate-800">{subj}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-blue-700">{mark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Save Status / Document Vault Notification */}
            {saveSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Scorecard saved securely to your <strong>Personal Document Library</strong>.</span>
                </div>
                <Link href="/dashboard" className="font-bold text-emerald-900 underline hover:no-underline">
                  View in Vault →
                </Link>
              </div>
            )}

            {/* Official Source link */}
            {resultData.official_source_url && (
              <div className="text-center pt-2">
                <a
                  href={resultData.official_source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Verify at Institution Official Portal</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
