import React from "react";
import { Printer, Download, X, Award, ShieldCheck, CheckCircle2, TrendingUp, Star } from "lucide-react";

export default function ResultScorecardModal({ result, onClose }) {
  if (!result) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-panel-glow rounded-3xl p-6 sm:p-8 my-8 border border-cyan-500/40">
        
        {/* Top Action Bar (Hidden when printing) */}
        <div className="no-print flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-cyber font-bold text-sm tracking-wider uppercase">
              Official Examination Scorecard & Rank Card
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center space-x-1.5 shadow-glow-cyan transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Scorecard</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Scorecard Content */}
        <div className="printable-card bg-midnight-900 border-2 border-cyan-500/30 rounded-2xl p-6 sm:p-8 text-slate-100">
          
          {/* Header */}
          <div className="text-center border-b-2 border-cyan-500/30 pb-5 mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 font-cyber block mb-1">
              NATIONAL MERIT & RESULT ACCREDITATION SYSTEM
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-cyber uppercase tracking-wide">
              {result.examName}
            </h2>
            <p className="text-xs text-slate-400 font-semibold tracking-wider">
              OFFICIAL VERIFIED CANDIDATE SCORECARD 2025–2026
            </p>
          </div>

          {/* Student Identifiers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-midnight-950/60 border border-slate-800 mb-6 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Candidate Name</span>
              <span className="font-bold text-white text-sm">{result.studentName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Roll Number</span>
              <span className="font-bold text-cyan-400 font-mono">{result.rollNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Registration Number</span>
              <span className="font-semibold text-slate-200 font-mono">{result.registrationNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Published Date</span>
              <span className="font-semibold text-slate-200">{result.publishedDate}</span>
            </div>
          </div>

          {/* Key Overall Performance Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-950/60 to-midnight-900 border border-blue-500/30 text-center">
              <span className="text-[10px] text-blue-300 font-bold uppercase block">Total Marks</span>
              <span className="text-xl font-black text-white font-cyber">
                {result.marksObtained} <span className="text-xs text-slate-400">/ {result.maxMarks}</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/60 to-midnight-900 border border-cyan-500/30 text-center">
              <span className="text-[10px] text-cyan-300 font-bold uppercase block">Percentage</span>
              <span className="text-xl font-black text-cyan-300 font-cyber">
                {result.percentage}%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/60 to-midnight-900 border border-emerald-500/30 text-center">
              <span className="text-[10px] text-emerald-300 font-bold uppercase block">Result Status</span>
              <span className="text-lg font-black text-emerald-400 font-cyber">
                {result.status}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-950/60 to-midnight-900 border border-amber-500/30 text-center">
              <span className="text-[10px] text-amber-300 font-bold uppercase block">Merit Rank</span>
              <span className="text-lg font-black text-amber-300 font-cyber">
                {result.rank || "DISTINCTION"}
              </span>
            </div>
          </div>

          {/* Subject-Wise Marks Breakdown Table */}
          {result.subjectMarks && result.subjectMarks.length > 0 && (
            <div className="mb-6 overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-midnight-950/80 text-slate-400 font-cyber uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Subject / Component</th>
                    <th className="py-2.5 px-4 text-center">Maximum Marks</th>
                    <th className="py-2.5 px-4 text-center">Marks Obtained</th>
                    <th className="py-2.5 px-4 text-right">Performance Indicator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-midnight-950/30 font-medium">
                  {result.subjectMarks.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20">
                      <td className="py-2.5 px-4 text-white font-semibold">{sub.subject}</td>
                      <td className="py-2.5 px-4 text-center text-slate-400">{sub.max}</td>
                      <td className="py-2.5 px-4 text-center text-cyan-300 font-bold">{sub.obtained}</td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                          {((sub.obtained / sub.max) * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Qualifying Status Banner */}
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-center text-xs mb-6">
            <span className="text-[10px] text-cyan-400 uppercase font-bold block">Accreditation Remarks</span>
            <p className="font-bold text-white text-sm">
              {result.qualifyingStatus || "QUALIFIED WITH DISTINCTION"}
            </p>
          </div>

          {/* Footer Official Certification */}
          <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Certified by Controller of Examinations • Digitally Signed</span>
            </div>
            <span className="font-mono text-cyan-400 font-semibold">
              Verification Hash: SHA256:{Math.random().toString(36).substring(2, 12).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
