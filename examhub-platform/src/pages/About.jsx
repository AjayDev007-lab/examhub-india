import React from "react";
import { ShieldCheck, Globe, Users, Award, BookOpen, CheckCircle2 } from "lucide-react";

export default function About({ onNavigate }) {
  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 flex items-center justify-center mx-auto shadow-glow-cyan">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-cyber">
          National Academic Infrastructure
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-cyber">
          About ExamHub India
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Empowering 24 million students across India with unified examination access, computer-verified hall tickets, and direct merit scorecard publication.
        </p>
      </div>

      {/* Grid Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl space-y-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-400 mx-auto mb-3">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Pan-India Integration</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Directly connected with central testing agencies (NTA, UPSC, SSC, RRB) and 28 state public service commissions.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Military-Grade Security</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every hall ticket and result scorecard carries encrypted barcodes and digital verification hashes preventing tampering.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-3">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Merit Transparency</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Zero-latency computerized result access with complete subject-wise marks breakdown and All India Rank tracking.
          </p>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="glass-panel-glow p-8 sm:p-10 rounded-3xl border border-cyan-500/30 space-y-4">
        <h2 className="text-2xl font-black text-white font-cyber">Our Sovereign Mission</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          ExamHub India was established to eliminate information fragmentation in India's competitive testing ecosystem. By uniting national entrance exams, university tests, recruitment gazettes, and academic credentials into one high-performance, cyber-secure node, we ensure every candidate receives timely notifications, verified admit cards, and instant access to their hard-earned results.
        </p>
        <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-300">
          <div className="flex items-center space-x-1.5 text-cyan-300">
            <CheckCircle2 className="w-4 h-4" />
            <span>ISO/IEC 27001 Certified System</span>
          </div>
          <div className="flex items-center space-x-1.5 text-emerald-300">
            <CheckCircle2 className="w-4 h-4" />
            <span>Compliant with Digital Personal Data Protection Act</span>
          </div>
        </div>
      </div>

    </div>
  );
}
