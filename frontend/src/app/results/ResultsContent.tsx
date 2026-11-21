"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Award, Search, CheckCircle2, Download, Save, AlertCircle, 
  ExternalLink, FileText, ArrowRight, ShieldCheck, Printer, RefreshCw,
  GraduationCap, Building2, Landmark, Shield, BookOpen, Clock, ChevronDown, 
  ChevronUp, Lock, Check, Info, Calendar, Sparkles
} from "lucide-react";
import { fetchApi, getFileUrl } from "@/lib/api";

// 12 Structured Examination Categories
const EXAM_CATEGORIES = [
  { id: "ALL", label: "All Examinations", icon: Award },
  { id: "UPSC", label: "UPSC", icon: Landmark },
  { id: "SSC", label: "SSC", icon: Building2 },
  { id: "RAILWAY", label: "Railway", icon: ShieldCheck },
  { id: "BANKING", label: "Banking", icon: Landmark },
  { id: "NEET", label: "NEET", icon: GraduationCap },
  { id: "JEE", label: "JEE", icon: Sparkles },
  { id: "STATE_PSC", label: "State PSC", icon: Building2 },
  { id: "UNIVERSITY", label: "University", icon: BookOpen },
  { id: "SCHOOL", label: "School Board", icon: GraduationCap },
  { id: "DEFENCE", label: "Defence", icon: Shield },
  { id: "POLICE", label: "Police", icon: Shield },
  { id: "OTHER", label: "Other Exams", icon: FileText },
];

// Helper to categorize exams
function matchExamCategory(exam: any, catId: string): boolean {
  if (catId === "ALL") return true;
  const orgCode = (exam.organization_code || "").toUpperCase();
  const name = (exam.name || "").toUpperCase();
  const code = (exam.code || "").toUpperCase();
  const orgName = (exam.organization_name || "").toUpperCase();
  const type = (exam.exam_type || "").toUpperCase();

  switch (catId) {
    case "UPSC":
      return orgCode === "UPSC" || name.includes("UPSC") || name.includes("CIVIL SERVICES");
    case "SSC":
      return orgCode === "SSC" || name.includes("STAFF SELECTION") || name.includes("CGL") || name.includes("CHSL");
    case "RAILWAY":
      return orgCode === "RRB" || name.includes("RAILWAY") || name.includes("NTPC") || name.includes("GROUP D");
    case "BANKING":
      return orgCode === "IBPS" || orgCode === "SBI" || name.includes("BANKING") || name.includes("PROBATIONARY") || name.includes("CLERK");
    case "NEET":
      return code.includes("NEET") || name.includes("NEET");
    case "JEE":
      return code.includes("JEE") || name.includes("JEE");
    case "STATE_PSC":
      return orgCode.includes("PSC") || orgName.includes("PUBLIC SERVICE COMMISSION") || name.includes("PSC");
    case "UNIVERSITY":
      return type === "UNIVERSITY" || orgName.includes("UNIVERSITY") || name.includes("SEMESTER");
    case "SCHOOL":
      return name.includes("CLASS") || name.includes("BOARD") || orgCode === "CBSE" || orgCode === "CISCE";
    case "DEFENCE":
      return name.includes("NDA") || name.includes("CDS") || name.includes("AFCAT") || name.includes("DEFENCE");
    case "POLICE":
      return name.includes("POLICE") || name.includes("CONSTABLE") || name.includes("SUB INSPECTOR");
    case "OTHER":
      return true;
    default:
      return true;
  }
}

export default function ResultsContent() {
  const searchParams = useSearchParams();
  const preselectedExamId = searchParams.get("exam_id");

  const [exams, setExams] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [examSearchQuery, setExamSearchQuery] = useState("");
  const [selectedExamId, setSelectedExamId] = useState<string>(preselectedExamId || "");
  const [rollNumber, setRollNumber] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [dob, setDob] = useState("");
  const [saveToDocs, setSaveToDocs] = useState(true);

  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchApi("/api/exams?limit=100")
      .then((data) => {
        setExams(data || []);
        if (preselectedExamId) {
          setSelectedExamId(preselectedExamId);
        }
      })
      .catch((err) => console.error(err));
  }, [preselectedExamId]);

  // Filter exams by selected category and search input
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesCat = matchExamCategory(exam, selectedCategory);
      if (!matchesCat) return false;
      if (!examSearchQuery.trim()) return true;
      const q = examSearchQuery.toLowerCase();
      return (
        (exam.name || "").toLowerCase().includes(q) ||
        (exam.code || "").toLowerCase().includes(q) ||
        (exam.organization_name || "").toLowerCase().includes(q) ||
        (exam.organization_code || "").toLowerCase().includes(q)
      );
    });
  }, [exams, selectedCategory, examSearchQuery]);

  const selectedExam = useMemo(() => {
    return exams.find((e) => e.id.toString() === selectedExamId);
  }, [exams, selectedExamId]);

  const handleCheckResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId) {
      setErrorMsg("Please select an examination to check results.");
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
      if (res.has_scorecard || res.document_id) {
        setSaveSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Result query could not be completed. Please verify your roll number.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const faqs = [
    {
      q: "Where can I find my roll number or hall ticket number?",
      a: "Your roll number is printed prominently on your official examination admit card / hall ticket. It is also included in your original application confirmation email or SMS."
    },
    {
      q: "Why is my result not available yet?",
      a: "Examination commissions publish results in planned phases. If the conducting commission has not officially uploaded the evaluation database, the result will display as 'Evaluation Underway'. Check the official result calendar link on this page."
    },
    {
      q: "What should I do if I entered the wrong roll number?",
      a: "Double-check your admit card and re-enter your details. If you suspect an issue with your credentials or registration ID, contact your conducting examination body directly."
    },
    {
      q: "How can I download my verified PDF scorecard?",
      a: "Once your result is retrieved successfully, click the 'Download PDF Scorecard' button at the top of your result card. The authenticated document will download directly to your device."
    },
    {
      q: "Is my personal information stored or shared with third parties?",
      a: "ExamHub India never sells, shares, or monetizes student data. Results are retrieved securely through official authorized gateways. Storing your scorecard in your Personal Vault is 100% optional."
    },
    {
      q: "How do I delete saved scorecards from my Personal Vault?",
      a: "Navigate to your Student Dashboard under 'Personal Vault'. You have full control under India's Digital Personal Data Protection (DPDP) Act to delete or export any saved record at any time."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F8FE] text-slate-800">
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-b from-[#102D59] via-[#0E274D] to-[#102D59] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-6xl mx-auto space-y-4 text-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span>Official National Scorecard & Marks Gateway</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white max-w-2xl mx-auto">
            Check Your Examination Results
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/90 max-w-xl mx-auto leading-relaxed">
            Find your examination results, marks, rank and score details through official result portals across all Indian states and institutions.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] text-blue-200/80 font-medium">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Free & Verified</span>
            </span>
            <span className="text-blue-400/40">•</span>
            <span className="flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-cyan-300" />
              <span>36 States & UTs Covered</span>
            </span>
            <span className="text-blue-400/40">•</span>
            <span className="flex items-center space-x-1.5">
              <Lock className="w-4 h-4 text-amber-300" />
              <span>Private & Secure Vault</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* 3. EXAMINATION CATEGORY SELECTION */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#102D59] flex items-center space-x-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span>1. Select Examination Category</span>
            </h2>
            <span className="text-[11px] text-slate-500">
              Showing {filteredExams.length} {filteredExams.length === 1 ? "Exam" : "Exams"}
            </span>
          </div>

          {/* Horizontal Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {EXAM_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    // If current selection doesn't match new category, reset selection
                    if (selectedExam && !matchExamCategory(selectedExam, cat.id)) {
                      setSelectedExamId("");
                    }
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 border shadow-sm ${
                    isActive
                      ? "bg-blue-600 border-blue-600 text-white shadow-blue-500/25 scale-[1.02]"
                      : "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50/50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-200" : "text-slate-400"}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. REDESIGNED RESULT CHECKING FORM & INFORMATION PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Check Result Form Card (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-[#102D59] flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>2. Enter Candidate Examination Details</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide your roll or hall ticket number as recorded on your official admit card.
              </p>
            </div>

            <form onSubmit={handleCheckResult} className="space-y-4">
              {/* Examination Search & Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Target Examination *
                </label>

                {/* Instant Search Filter */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={examSearchQuery}
                    onChange={(e) => setExamSearchQuery(e.target.value)}
                    placeholder="Search examination name, code, or board (e.g. NEET, UPSC, SSC)..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <select
                  value={selectedExamId}
                  onChange={(e) => {
                    setSelectedExamId(e.target.value);
                    setResultData(null);
                    setErrorMsg(null);
                  }}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                >
                  <option value="">-- Choose Examination ({filteredExams.length} Available) --</option>
                  {filteredExams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name} ({exam.organization_code} • {exam.year} {exam.cycle})
                    </option>
                  ))}
                </select>
              </div>

              {/* Roll Number & Registration Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Roll / Hall Ticket No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. 2604108821 or 0824190"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Exactly as printed on your admit card
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Application No.
                    </label>
                    <span className="text-[10px] text-slate-400 italic">Optional</span>
                  </div>
                  <input
                    type="text"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder="e.g. RID-2604108821"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Needed only if required by board
                  </span>
                </div>
              </div>

              {/* Date of Birth & Personal Vault Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    (DD/MM/YYYY) Where required by board
                  </span>
                </div>

                <div className="flex items-center pt-2">
                  <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={saveToDocs}
                      onChange={(e) => setSaveToDocs(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 leading-tight">
                      <strong className="text-slate-800 block">Save to Personal Vault</strong>
                      Securely retain verified marksheet in your candidate library.
                    </span>
                  </label>
                </div>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <div>
                    <p className="font-semibold">{errorMsg}</p>
                    <p className="text-[11px] text-red-600 mt-0.5">
                      Verify your roll number or use the official commission direct link on the right.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-xs sm:text-sm uppercase tracking-wider disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting to Authorized Portal...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Check Official Result</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: Examination Details Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {selectedExam ? (
              <div className="bg-white rounded-2xl border border-blue-200/90 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                    {selectedExam.organization_code} Verified Record
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Official Board Gateway</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#102D59]">
                    {selectedExam.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedExam.organization_name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Cycle</span>
                    <span className="font-semibold text-slate-800">{selectedExam.year} ({selectedExam.cycle || "Annual"})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Evaluation Status</span>
                    <span className="font-bold text-emerald-600">Result Available</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Exam Code</span>
                    <span className="font-semibold text-slate-800">{selectedExam.code}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Direct Access</span>
                    <span className="font-semibold text-blue-600">Available</span>
                  </div>
                </div>

                {selectedExam.description && (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {selectedExam.description}
                  </p>
                )}

                <div className="pt-2">
                  <a
                    href={selectedExam.source_website_url || selectedExam.official_source_url || "https://upsc.gov.in"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <span>Visit Conducting Authority Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
                  <Info className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">No Examination Selected</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Select an examination from the form or click any category above to view verified board details, guidelines, and result publication timelines.
                </p>
              </div>
            )}

            {/* 5. RESULT STATUS LEGEND EXPLANATION */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#102D59] flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Result Status Classification</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Result Available</span>
                </div>
                <div className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-amber-50 text-amber-800 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>Evaluation Underway</span>
                </div>
                <div className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-blue-50 text-blue-800 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span>Date Announced</span>
                </div>
                <div className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                  <span>Date Pending</span>
                </div>
                <div className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-purple-50 text-purple-800 font-medium">
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                  <span>Official Portal Only</span>
                </div>
                <div className="flex items-center space-x-1.5 p-1.5 rounded-lg bg-cyan-50 text-cyan-800 font-medium">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
                  <span>Verification Required</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. REDESIGNED RESULT DISPLAY EXPERIENCE (When Result Data Exists) */}
        {resultData && (
          <section className="bg-white rounded-2xl border border-blue-200 shadow-xl overflow-hidden animate-fadeIn">
            {/* Top Official Banner */}
            <div className="bg-gradient-to-r from-[#102D59] to-[#0E274D] text-white p-6 sm:p-7 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Officially Verified Result</span>
                  </span>
                  <span className="text-xs text-blue-200">
                    Published: {new Date(resultData.published_date || Date.now()).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {resultData.examination_name}
                </h2>
                <p className="text-xs text-blue-200/80">{resultData.organization_name}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5 backdrop-blur-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                <a
                  href={getFileUrl(`/api/results/${resultData.id}/download`)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Scorecard PDF</span>
                </a>
              </div>
            </div>

            {/* Candidate Summary Grid */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Candidate Name</span>
                  <span className="font-black text-slate-900 text-sm">{resultData.student_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Roll / Hall Ticket</span>
                  <span className="font-black text-slate-900 text-sm">{resultData.student_identifier_roll}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Qualifying Status</span>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                    {resultData.qualifying_status || "QUALIFIED"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">All India Rank / Merit</span>
                  <span className="font-black text-blue-700 text-sm">{resultData.rank || "N/A"}</span>
                </div>
              </div>

              {/* Total Marks & Percentage Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                  <span className="text-xs text-slate-600 font-semibold block">Total Marks Obtained</span>
                  <span className="text-2xl font-black text-[#102D59]">
                    {resultData.marks_obtained !== null ? resultData.marks_obtained : "N/A"}
                    <span className="text-xs text-slate-400 font-normal"> / {resultData.max_marks || "100"}</span>
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                  <span className="text-xs text-slate-600 font-semibold block">Percentage / Percentile</span>
                  <span className="text-2xl font-black text-blue-700">
                    {resultData.percentage ? `${Number(resultData.percentage).toFixed(2)}%` : "N/A"}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                  <span className="text-xs text-slate-600 font-semibold block">Grade / Evaluation Remark</span>
                  <span className="text-lg font-bold text-slate-800">
                    {resultData.grade || "Distinction / Qualified"}
                  </span>
                </div>
              </div>

              {/* Subject-Wise Marks Statement Table */}
              {resultData.subject_marks && Object.keys(resultData.subject_marks).length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="font-bold text-[#102D59] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Subject-Wise Marks Statement</span>
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="px-4 py-3 text-left">Subject / Component</th>
                          <th className="px-4 py-3 text-right">Marks / Score Obtained</th>
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

              {/* Save to Personal Vault Notification */}
              {saveSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Scorecard saved securely to your <strong>Personal Vault</strong>.</span>
                  </div>
                  <Link href="/dashboard" className="font-bold text-emerald-900 underline hover:no-underline">
                    View in Dashboard Vault →
                  </Link>
                </div>
              )}

              {/* Official Source Link */}
              {resultData.official_source_url && (
                <div className="text-center pt-2">
                  <a
                    href={resultData.official_source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Cross-verify with Conducting Board Official Gateway</span>
                  </a>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 7. HOW TO CHECK YOUR RESULT (4 Steps) */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-[#102D59] flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>How to Check Your Examination Result</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Follow these simple steps to retrieve your marks statement and scorecard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                01
              </div>
              <h4 className="text-xs font-bold text-slate-800">Select Examination</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Choose your category or search by exam name (UPSC, SSC, NEET, JEE, or University).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                02
              </div>
              <h4 className="text-xs font-bold text-slate-800">Enter Roll Details</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Input your official roll number or hall ticket number as recorded on your admit card.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                03
              </div>
              <h4 className="text-xs font-bold text-slate-800">Click Check Result</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Connect securely to the authorized board gateway to query verified marks.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                04
              </div>
              <h4 className="text-xs font-bold text-slate-800">View & Save Scorecard</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Download your official PDF marksheet or retain it in your private Personal Vault.
              </p>
            </div>
          </div>
        </section>

        {/* 8. PERSONAL VAULT PRIVACY COMMITMENT */}
        <section className="bg-gradient-to-r from-blue-900 to-[#102D59] text-white rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-cyan-300" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-200">
                  Personal Vault Privacy Guarantee
                </h3>
              </div>
              <p className="text-xs text-blue-100 leading-relaxed">
                Saving results to your Personal Vault is 100% voluntary. All records are protected under India&apos;s Digital Personal Data Protection (DPDP) Act 2023. You can inspect, export, or permanently erase your saved documents anytime from your dashboard.
              </p>
            </div>
            <Link
              href="/privacy"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 whitespace-nowrap"
            >
              Read DPDP Policy →
            </Link>
          </div>
        </section>

        {/* 9. FREQUENTLY ASKED QUESTIONS (Expandable Accordion) */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-[#102D59] flex items-center space-x-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Frequently Asked Questions</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant answers regarding examination scorecards, roll validation, and official sources.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="py-3">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors py-1"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="text-xs text-slate-600 leading-relaxed pt-2 pb-1 pr-4">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
