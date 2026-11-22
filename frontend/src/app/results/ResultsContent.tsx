"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Award, Search, CheckCircle2, Download, Save, AlertCircle, 
  ExternalLink, FileText, ArrowRight, ShieldCheck, Printer, RefreshCw,
  GraduationCap, Building2, Landmark, Shield, BookOpen, Clock, ChevronDown, 
  ChevronUp, Lock, Check, Info, Calendar, Sparkles, X, ChevronRight,
  HelpCircle, ArrowLeft, Layers, MapPin, Zap
} from "lucide-react";
import { fetchApi, getFileUrl } from "@/lib/api";

// 6 Core Categories for "Modal 1 – Choose Your Examination"
interface ExamCategoryMeta {
  id: string;
  name: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgLight: string;
  borderLight: string;
}

const MODAL_CATEGORIES: ExamCategoryMeta[] = [
  {
    id: "SCHOOL",
    name: "School Board",
    shortDesc: "CBSE, ICSE/ISC, NIOS & State Secondary Boards (Class 10th & 12th)",
    icon: GraduationCap,
    accentColor: "text-blue-600",
    bgLight: "bg-blue-50/80 hover:bg-blue-100/60",
    borderLight: "border-blue-200"
  },
  {
    id: "GOVERNMENT",
    name: "Government Examination",
    shortDesc: "UPSC Civil Services, SSC CGL/CHSL, State PSCs & Departmental Cadres",
    icon: Landmark,
    accentColor: "text-indigo-600",
    bgLight: "bg-indigo-50/80 hover:bg-indigo-100/60",
    borderLight: "border-indigo-200"
  },
  {
    id: "RAILWAY",
    name: "Railway",
    shortDesc: "Railway Recruitment Boards (RRB NTPC, Group D, ALP, Technician)",
    icon: ShieldCheck,
    accentColor: "text-cyan-600",
    bgLight: "bg-cyan-50/80 hover:bg-cyan-100/60",
    borderLight: "border-cyan-200"
  },
  {
    id: "UNIVERSITY",
    name: "University",
    shortDesc: "Central, State & Autonomous Universities (Semester Marksheets & CGPA)",
    icon: BookOpen,
    accentColor: "text-purple-600",
    bgLight: "bg-purple-50/80 hover:bg-purple-100/60",
    borderLight: "border-purple-200"
  },
  {
    id: "ENTRANCE",
    name: "Entrance Examination",
    shortDesc: "National Testing Agency (NEET UG, JEE Main, CUET, GATE, CAT)",
    icon: Sparkles,
    accentColor: "text-amber-600",
    bgLight: "bg-amber-50/80 hover:bg-amber-100/60",
    borderLight: "border-amber-200"
  },
  {
    id: "BANKING",
    name: "Banking",
    shortDesc: "IBPS PO/Clerk, SBI, RBI Grade B & Public Sector Financial Bodies",
    icon: Building2,
    accentColor: "text-emerald-600",
    bgLight: "bg-emerald-50/80 hover:bg-emerald-100/60",
    borderLight: "border-emerald-200"
  }
];

// Helper to filter exams by modal category
function matchesModalCategory(exam: any, catId: string): boolean {
  const orgCode = (exam.organization_code || "").toUpperCase();
  const name = (exam.name || "").toUpperCase();
  const code = (exam.code || "").toUpperCase();
  const orgName = (exam.organization_name || "").toUpperCase();
  const type = (exam.exam_type || "").toUpperCase();

  switch (catId) {
    case "SCHOOL":
      return (
        name.includes("CLASS") ||
        name.includes("10TH") ||
        name.includes("12TH") ||
        name.includes("BOARD") ||
        orgCode === "CBSE" ||
        orgCode === "CISCE" ||
        orgCode === "NIOS" ||
        orgName.includes("SECONDARY")
      );
    case "GOVERNMENT":
      return (
        orgCode === "UPSC" ||
        orgCode === "SSC" ||
        orgCode.includes("PSC") ||
        name.includes("CIVIL SERVICES") ||
        name.includes("CGL") ||
        name.includes("CHSL") ||
        name.includes("STAFF SELECTION") ||
        orgName.includes("PUBLIC SERVICE")
      );
    case "RAILWAY":
      return (
        orgCode === "RRB" ||
        name.includes("RAILWAY") ||
        name.includes("NTPC") ||
        name.includes("GROUP D") ||
        name.includes("ALP")
      );
    case "UNIVERSITY":
      return (
        type === "UNIVERSITY" ||
        orgName.includes("UNIVERSITY") ||
        name.includes("SEMESTER") ||
        orgCode === "DU" ||
        orgCode === "VTU" ||
        orgCode === "ANNA"
      );
    case "ENTRANCE":
      return (
        code.includes("NEET") ||
        code.includes("JEE") ||
        code.includes("CUET") ||
        code.includes("GATE") ||
        code.includes("CAT") ||
        orgCode === "NTA" ||
        name.includes("ENTRANCE") ||
        name.includes("ADMISSION")
      );
    case "BANKING":
      return (
        orgCode === "IBPS" ||
        orgCode === "SBI" ||
        orgCode === "RBI" ||
        name.includes("BANKING") ||
        name.includes("PROBATIONARY") ||
        name.includes("CLERK")
      );
    default:
      return true;
  }
}

export default function ResultsContent() {
  const searchParams = useSearchParams();
  const preselectedExamId = searchParams.get("exam_id");

  // Application State
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>(preselectedExamId || "");
  const [rollNumber, setRollNumber] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [dob, setDob] = useState("");
  const [saveToDocs, setSaveToDocs] = useState(true);

  // Result retrieval status
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modal 1 State: Choose Your Examination
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [activeCategoryDrilldown, setActiveCategoryDrilldown] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    fetchApi("/api/exams?limit=100")
      .then((data) => {
        setExams(data || []);
        if (preselectedExamId) {
          setSelectedExamId(preselectedExamId);
        }
      })
      .catch((err) => console.error("Failed to fetch exams:", err));
  }, [preselectedExamId]);

  // Lock body scroll and handle ESC key when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      // Auto-focus search input
      setTimeout(() => searchInputRef.current?.focus(), 100);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsModalOpen(false);
          setActiveCategoryDrilldown(null);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isModalOpen]);

  const selectedExam = useMemo(() => {
    return exams.find((e) => e.id.toString() === selectedExamId);
  }, [exams, selectedExamId]);

  // Modal search results (global search across all exams)
  const modalSearchResults = useMemo(() => {
    if (!modalSearch.trim()) return [];
    const q = modalSearch.toLowerCase();
    return exams.filter((e) => {
      return (
        (e.name || "").toLowerCase().includes(q) ||
        (e.code || "").toLowerCase().includes(q) ||
        (e.organization_name || "").toLowerCase().includes(q) ||
        (e.organization_code || "").toLowerCase().includes(q)
      );
    });
  }, [exams, modalSearch]);

  // Category drilldown exams
  const categoryExams = useMemo(() => {
    if (!activeCategoryDrilldown) return [];
    return exams.filter((e) => matchesModalCategory(e, activeCategoryDrilldown));
  }, [exams, activeCategoryDrilldown]);

  // Handle selecting an examination from the modal
  const handleSelectExamFromModal = (examId: number) => {
    setSelectedExamId(examId.toString());
    setIsModalOpen(false);
    setActiveCategoryDrilldown(null);
    setModalSearch("");
    setResultData(null);
    setErrorMsg(null);
  };

  const handleCheckResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId) {
      setErrorMsg("Please choose an examination first using 'Find My Result'.");
      setIsModalOpen(true);
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
      setErrorMsg(err.message || "Result query could not be completed. Please verify your roll number or try the official portal link below.");
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
      q: "Where do I locate my Roll Number or Hall Ticket Number?",
      a: "Your roll number is printed prominently on your official admit card / hall ticket issued by the conducting examination board. It was also delivered to your registered mobile number and email upon application submission."
    },
    {
      q: "Why is my examination showing as 'Result Under Evaluation'?",
      a: "Boards publish evaluation databases in chronological cycles. If the conducting commission has not yet released the final merit list or marks file, verify the official publication date using the direct portal gateway link provided on this page."
    },
    {
      q: "Can I download and print my authentic scorecard?",
      a: "Yes. Once your result scorecard renders on this dashboard, click 'Download PDF Scorecard' or 'Print Document'. The file generated includes tamper-evident digital verification metadata."
    },
    {
      q: "How does the Personal Vault document storage work?",
      a: "When 'Save to Personal Vault' is enabled, your retrieved scorecard is encrypted and archived into your private candidate library for permanent, secure access on mobile and desktop."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ================================================================= */}
      {/* 1. CONCEPT 1: PREMIUM STUDENT DASHBOARD HEADER                    */}
      {/* ================================================================= */}
      <section className="bg-gradient-to-b from-[#0B1E3F] via-[#102D59] to-[#0D244D] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40 relative overflow-hidden">
        {/* Soft Ambient Radiance */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative max-w-6xl mx-auto space-y-5 text-center">
          
          {/* Dashboard Trust Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-200 text-xs font-semibold tracking-wide backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Concept 1: Premium Student Results Dashboard • All-India Gazette Gateway</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Check Your Examination Results & Marks
          </h1>
          
          <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl mx-auto leading-relaxed">
            Centralized portal covering Central Commissions, State Secondary Boards, Universities, Railways, and National Entrance Tests.
          </p>

          {/* Primary Action Button: Triggers Modal 1 */}
          <div className="pt-3">
            <button
              onClick={() => {
                setIsModalOpen(true);
                setActiveCategoryDrilldown(null);
                setModalSearch("");
              }}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Search className="w-4 h-4 text-cyan-200" />
              <span>Find My Result (Choose Examination)</span>
              <ArrowRight className="w-4 h-4 text-cyan-200" />
            </button>
          </div>

          {/* Real-Time Telemetry Counters */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-blue-200/80 font-medium">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Free & Verified Public Portals</span>
            </div>
            <span className="text-blue-400/40 hidden sm:inline">•</span>
            <div className="flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-cyan-300" />
              <span>36 States & Union Territories</span>
            </div>
            <span className="text-blue-400/40 hidden sm:inline">•</span>
            <div className="flex items-center space-x-1.5">
              <Lock className="w-4 h-4 text-amber-300" />
              <span>Personal Vault Encryption</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 2. MAIN DASHBOARD CONTENT AREA                                    */}
      {/* ================================================================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 -mt-6">

        {/* Selected Examination Summary Bar (with Quick Switch Action) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Selected Examination
              </span>
              <h2 className="text-base sm:text-lg font-black text-[#0B1E3F]">
                {selectedExam ? selectedExam.name : "No Examination Selected"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {selectedExam
                  ? `${selectedExam.organization_name} (${selectedExam.organization_code}) • Cycle: ${selectedExam.cycle} ${selectedExam.year}`
                  : "Click 'Find My Result' or use the quick tags below to choose your exam board."}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsModalOpen(true);
              setActiveCategoryDrilldown(null);
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs border border-slate-200/80 transition-all flex items-center space-x-1.5 shrink-0"
          >
            <span>{selectedExam ? "Change Exam" : "Select Exam"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Popular Examination Tags */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-bold text-[11px] mr-1">Trending Exams:</span>
          {exams.slice(0, 6).map((e) => (
            <button
              key={e.id}
              onClick={() => {
                setSelectedExamId(e.id.toString());
                setResultData(null);
                setErrorMsg(null);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                selectedExamId === e.id.toString()
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm font-bold"
                  : "bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {e.code || e.name}
            </button>
          ))}
        </div>

        {/* 2-COLUMN DASHBOARD: RESULT ENTRY FORM + BOARD GATEWAY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Result Checking Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0B1E3F] flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Enter Candidate Examination Credentials</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide your roll or hall ticket number as recorded on your official admit card.
              </p>
            </div>

            <form onSubmit={handleCheckResult} className="space-y-4">
              
              {/* Target Examination Field with Modal Trigger */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Target Examination *
                </label>
                <div
                  onClick={() => setIsModalOpen(true)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-slate-800 text-xs sm:text-sm font-semibold flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className={selectedExam ? "text-slate-900 font-bold" : "text-slate-400"}>
                    {selectedExam ? selectedExam.name : "Click to select examination (UPSC, NEET, CBSE, SSC, RRB...)"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Roll Number & Application Number */}
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
                    As printed on your admit card
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
                    Where required by board (DD/MM/YYYY)
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
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{errorMsg}</p>
                    <p className="mt-0.5 text-[11px] text-red-600">
                      You can also check directly via the Official Portal link on the right.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Connecting to Official Examination Registry...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Check Score & Retrieve Marksheet</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: Conducting Authority Gateway Card (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {selectedExam ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Examination Authority</span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-black text-slate-900 text-base leading-snug">
                    {selectedExam.organization_name}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <span className="font-mono font-bold text-slate-700">Code: {selectedExam.organization_code}</span>
                    <span>•</span>
                    <span>Cycle: {selectedExam.cycle} ({selectedExam.year})</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1.5 text-slate-600">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Official Gazette & Web Verification</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Results are retrieved directly from official national servers ending in <code>.gov.in</code>, <code>.nic.in</code>, or <code>.ac.in</code>.
                  </p>
                </div>

                {selectedExam.official_website && (
                  <div className="pt-1">
                    <a
                      href={selectedExam.official_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-between"
                    >
                      <span>Visit Authority Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Need help choosing your board?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Click the button below to browse School Boards, Central Exams, Universities, and Railways in the selector modal.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-500 transition-colors"
                >
                  Open Examination Selector
                </button>
              </div>
            )}

            {/* Helpline Notice */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs space-y-1 text-blue-900">
              <span className="font-bold flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                Student Candidate Notice
              </span>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                ExamHub India is a 100% free national indexer. If you encounter any server timeouts during peak publication hours, please retry after 5 minutes.
              </p>
            </div>
          </div>

        </div>

        {/* ================================================================= */}
        {/* 3. VERIFIED SCORECARD DISPLAY (RENDERED ON RESULT RETRIEVAL)      */}
        {/* ================================================================= */}
        {resultData && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn">
            {/* Scorecard Top Header */}
            <div className="bg-gradient-to-r from-[#0B1E3F] via-[#102D59] to-[#0D244D] text-white p-6 sm:p-7 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Scorecard Ready</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {resultData.candidate_name || "Candidate Scorecard"}
                </h2>
                <p className="text-xs text-blue-200">
                  {selectedExam?.name || "Official Examination Scorecard"}
                </p>
              </div>

              {/* Action Buttons: PDF Download & Print */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                {resultData.scorecard_pdf_url && (
                  <a
                    href={getFileUrl(resultData.scorecard_pdf_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-colors flex items-center space-x-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Scorecard</span>
                  </a>
                )}
              </div>
            </div>

            {/* Scorecard Body */}
            <div className="p-6 sm:p-7 space-y-6 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Roll Number</span>
                  <span className="font-bold text-slate-900 text-sm">{resultData.roll_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Total Score / Marks</span>
                  <span className="font-black text-blue-600 text-sm">{resultData.total_marks || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Percentage / Percentile</span>
                  <span className="font-black text-slate-900 text-sm">
                    {resultData.percentage ? `${resultData.percentage}%` : resultData.percentile || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Qualifying Status</span>
                  <span className="font-black text-emerald-600 text-sm">
                    {resultData.status || resultData.qualification_status || "QUALIFIED"}
                  </span>
                </div>
              </div>

              {/* Subject Breakdown if Available */}
              {resultData.subject_marks && resultData.subject_marks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                    Subject-wise Marks Breakdown
                  </h4>
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          <th className="p-3">Subject / Paper</th>
                          <th className="p-3">Max Marks</th>
                          <th className="p-3">Marks Obtained</th>
                          <th className="p-3">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {resultData.subject_marks.map((sub: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="p-3 font-semibold text-slate-900">{sub.subject_name}</td>
                            <td className="p-3 text-slate-500">{sub.max_marks || 100}</td>
                            <td className="p-3 font-bold text-blue-600">{sub.marks_obtained}</td>
                            <td className="p-3 font-semibold text-slate-700">{sub.grade || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Personal Vault Confirmation Banner */}
              {saveSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Scorecard successfully archived in your <strong>Personal Document Vault</strong>.</span>
                  </div>
                  <Link href="/dashboard" className="font-bold text-emerald-800 hover:underline">
                    View in Vault →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 4. FREQUENTLY ASKED QUESTIONS ACCORDION                          */}
        {/* ================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-500">Need help understanding your scorecard or finding your roll number?</p>
          </div>

          <div className="space-y-2 text-xs">
            {faqs.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full p-3.5 text-left font-bold text-slate-800 hover:text-blue-600 flex items-center justify-between transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3.5 text-slate-600 leading-relaxed border-t border-slate-100 pt-2 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ================================================================= */}
      {/* 5. MODAL 1 — CHOOSE YOUR EXAMINATION (PREMIUM CENTERED MODAL)     */}
      {/* ================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
          {/* Backdrop with click-to-close */}
          <div
            onClick={() => {
              setIsModalOpen(false);
              setActiveCategoryDrilldown(null);
            }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Container */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 flex flex-col max-h-[85vh] animate-scaleUp"
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-blue-50/30">
              <div className="flex items-center space-x-2.5">
                {activeCategoryDrilldown && (
                  <button
                    onClick={() => setActiveCategoryDrilldown(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors mr-1"
                    title="Back to Categories"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Search className="w-4 h-4 text-cyan-200" />
                </div>
                <div>
                  <h3 id="modal-title" className="text-base sm:text-lg font-black text-[#0B1E3F]">
                    {activeCategoryDrilldown
                      ? `${MODAL_CATEGORIES.find(c => c.id === activeCategoryDrilldown)?.name} Examinations`
                      : "Find Your Examination"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {activeCategoryDrilldown
                      ? "Select your target board or examination below"
                      : "Search by keyword or select an examination category"}
                  </p>
                </div>
              </div>

              {/* Close Button ('X') */}
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setActiveCategoryDrilldown(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instant Search Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-blue-600" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={modalSearch}
                  onChange={(e) => {
                    setModalSearch(e.target.value);
                    if (e.target.value.trim()) {
                      setActiveCategoryDrilldown(null);
                    }
                  }}
                  placeholder="Type examination name, code, or board (e.g. NEET, CBSE, UPSC, RRB)..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
                {modalSearch && (
                  <button
                    onClick={() => setModalSearch("")}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body / Scrollable Area */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
              
              {/* STATE 1: INSTANT SEARCH RESULTS ACTIVE */}
              {modalSearch.trim() ? (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Search Results ({modalSearchResults.length})
                  </div>
                  {modalSearchResults.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700 text-sm">No matching examinations found.</p>
                      <p className="text-xs text-slate-400 mt-1">Try searching with a broader keyword (e.g. "SSC", "Class 10").</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {modalSearchResults.map((exam) => (
                        <div
                          key={exam.id}
                          onClick={() => handleSelectExamFromModal(exam.id)}
                          className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-400 transition-all flex items-center justify-between cursor-pointer group"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-blue-600 text-xs">
                                {exam.organization_code}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Cycle: {exam.cycle} ({exam.year})
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                              {exam.name}
                            </h4>
                            <p className="text-[11px] text-slate-500">{exam.organization_name}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : activeCategoryDrilldown ? (
                
                /* STATE 2: CATEGORY DRILLDOWN EXAMINATIONS */
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Available Examinations ({categoryExams.length})
                    </span>
                    <button
                      onClick={() => setActiveCategoryDrilldown(null)}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Categories</span>
                    </button>
                  </div>

                  {categoryExams.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <p className="font-semibold text-slate-700">No examinations indexed yet in this category.</p>
                      <button
                        onClick={() => setActiveCategoryDrilldown(null)}
                        className="mt-2 text-xs text-blue-600 font-bold underline"
                      >
                        Return to categories
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {categoryExams.map((exam) => (
                        <div
                          key={exam.id}
                          onClick={() => handleSelectExamFromModal(exam.id)}
                          className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-400 transition-all flex items-center justify-between cursor-pointer group"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-blue-600 text-xs">
                                {exam.organization_code}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Cycle: {exam.cycle} ({exam.year})
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                              {exam.name}
                            </h4>
                            <p className="text-[11px] text-slate-500">{exam.organization_name}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (

                /* STATE 3: DEFAULT SIX CORE CATEGORIES */
                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Browse by Examination Category
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {MODAL_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const count = exams.filter(e => matchesModalCategory(e, cat.id)).length;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => setActiveCategoryDrilldown(cat.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer group flex items-start space-x-3.5 shadow-sm hover:shadow-md ${cat.bgLight} ${cat.borderLight}`}
                        >
                          <div className={`p-2.5 rounded-xl bg-white shadow-sm shrink-0 ${cat.accentColor} group-hover:scale-105 transition-transform`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-800 transition-colors">
                                {cat.name}
                              </h4>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                                {count}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              {cat.shortDesc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px]">Esc</kbd> to close</span>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setActiveCategoryDrilldown(null);
                }}
                className="font-bold text-slate-700 hover:text-slate-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
