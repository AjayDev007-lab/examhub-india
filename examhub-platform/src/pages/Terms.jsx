import React from "react";
import { ShieldCheck, FileCheck, AlertTriangle } from "lucide-react";

export default function Terms() {
  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-xs text-slate-300 leading-relaxed">
      
      <div className="border-b border-cyan-500/20 pb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 font-cyber">
          Terms & Academic Conditions
        </span>
        <h1 className="text-3xl font-black text-white font-cyber">
          Terms of Examination Services
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Effective Date: Academic Session 2025–2026
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
        <h3 className="text-base font-bold text-white font-cyber uppercase">1. Examination Integrity</h3>
        <p>
          Candidates are strictly prohibited from generating synthetic, forged, or altered hall tickets. Any attempt to modify registration identifiers, candidate names, or test center assignments constitutes a punishable offense under the Public Examinations (Prevention of Unfair Means) Act.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
        <h3 className="text-base font-bold text-white font-cyber uppercase">2. Result Publication & Gazettes</h3>
        <p>
          All examination results published on ExamHub India reflect official declarations by respective boards (NTA, UPSC, SSC, CBSE, RRB). While computerized marks feeds are synchronized with 99.98% verified accuracy, the physical gazette issued by the Controller of Examinations remains final.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
        <h3 className="text-base font-bold text-white font-cyber uppercase">3. Account Responsibility</h3>
        <p>
          Students are responsible for maintaining the confidentiality of their authentication passwords and ensuring accurate personal information is maintained within their Student Profile.
        </p>
      </div>

    </div>
  );
}
