import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useExams } from "../context/ExamContext";
import ResultScorecardModal from "../components/ResultScorecardModal";
import { 
  Award, 
  Search, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp,
  FileText,
  Filter
} from "lucide-react";

export default function Results({ onNavigate }) {
  const { currentUser } = useAuth();
  const { results } = useExams();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);

  // Only display officially published results
  const publishedResults = results.filter(r => r.isPublished);

  // Filter by search query (Exam Name, Roll Number, Reg Number)
  const filteredResults = publishedResults.filter((r) => {
    return (
      r.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rollNumber.includes(searchTerm) ||
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.registrationNumber && r.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-cyan-500/20 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-cyber">
            Official Academic Accreditation & Merit Lists
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-cyber">
            Examination Results Portal
          </h1>
        </div>
        <p className="text-xs text-slate-400 max-w-md">
          Search and verify computerized result scorecards directly synchronized with national examination gazettes.
        </p>
      </div>

      {/* Search & Verification Input Bar */}
      <div className="glass-panel p-6 rounded-3xl space-y-3">
        <label className="text-xs font-bold uppercase text-slate-300 block">
          Candidate Result Verification Search
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter Roll Number (e.g. 2604108821), Registration Number, or Exam Name..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-input text-xs sm:text-sm font-medium"
          />
        </div>
        <p className="text-[11px] text-slate-400">
          Tip: Test with Roll Number <span className="text-cyan-400 font-mono font-bold">2604108821</span> or <span className="text-cyan-400 font-mono font-bold">2608103342</span> for instant scorecard retrieval.
        </p>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {filteredResults.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-3">
            <Award className="w-10 h-10 text-amber-400 mx-auto opacity-60" />
            <h3 className="text-base font-bold text-white">No Published Results Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No results match the query. Unpublished examinations remain confidential until released by the Controller of Examinations.
            </p>
          </div>
        ) : (
          filteredResults.map((res) => (
            <div
              key={res.id}
              className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-amber-400/40 transition-all hover:shadow-glow-card"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                    STATUS: {res.status}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    ROLL: {res.rollNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                    {res.grade || "DISTINCTION"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Published: {res.publishedDate}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white font-cyber tracking-wide">
                  {res.examName}
                </h3>

                <p className="text-xs text-slate-300">
                  Candidate: <span className="font-bold text-white">{res.studentName}</span> • Reg: <span className="font-mono">{res.registrationNumber}</span>
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                  <span className="text-slate-300">
                    Marks Obtained: <strong className="text-cyan-400 text-sm">{res.marksObtained}</strong> / {res.maxMarks}
                  </span>
                  <span className="text-slate-300">
                    Percentage: <strong className="text-cyan-400 text-sm">{res.percentage}%</strong>
                  </span>
                  {res.rank && (
                    <span className="text-amber-400 font-bold">
                      {res.rank} ({res.percentile})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                <button
                  onClick={() => setSelectedResult(res)}
                  className="flex-1 lg:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-black shadow-md flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Award className="w-4 h-4" />
                  <span>View Official Scorecard</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Scorecard Modal */}
      {selectedResult && (
        <ResultScorecardModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}

    </div>
  );
}
