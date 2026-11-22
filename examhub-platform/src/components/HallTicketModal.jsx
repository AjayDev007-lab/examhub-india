import React from "react";
import { Printer, Download, X, ShieldCheck, CheckCircle2, AlertTriangle, QrCode } from "lucide-react";

export default function HallTicketModal({ hallTicket, onClose }) {
  if (!hallTicket) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-panel-glow rounded-3xl p-6 sm:p-8 my-8 border border-cyan-500/40">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-cyber font-bold text-sm tracking-wider uppercase">
              Official Examination Hall Ticket (Admit Card)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center space-x-1.5 shadow-glow-cyan transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Hall Ticket</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Admit Card Content */}
        <div className="printable-card bg-midnight-900 border-2 border-cyan-500/30 rounded-2xl p-6 sm:p-8 text-slate-100">
          
          {/* Card Header */}
          <div className="text-center border-b-2 border-cyan-500/30 pb-5 mb-6">
            <div className="inline-flex items-center space-x-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="text-xs font-black uppercase tracking-widest text-cyan-400 font-cyber">
                GOVERNMENT OF INDIA • NATIONAL EXAMINATION INFRASTRUCTURE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide font-cyber uppercase">
              {hallTicket.examName}
            </h2>
            <p className="text-xs text-slate-400 font-semibold tracking-wider">
              PROVISIONAL ADMIT CARD / HALL TICKET 2026
            </p>
          </div>

          {/* Student & Center Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            
            {/* Student Photo & QR */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-midnight-950/60 border border-slate-800">
              <img
                src={hallTicket.photoUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256"}
                alt="Candidate"
                className="w-28 h-32 object-cover rounded-lg border-2 border-cyan-400 shadow-md mb-2"
              />
              <span className="text-[10px] text-cyan-300 font-mono font-bold tracking-wider">
                {hallTicket.barcodeValue}
              </span>
            </div>

            {/* Candidate Details */}
            <div className="sm:col-span-2 space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-midnight-950/40 border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Candidate Name</span>
                  <span className="font-bold text-white text-sm">{hallTicket.studentName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Roll Number</span>
                  <span className="font-bold text-cyan-400 text-sm font-mono">{hallTicket.rollNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-midnight-950/40 border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Application / Reg No</span>
                  <span className="font-semibold text-slate-200 font-mono">{hallTicket.registrationNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Exam Code</span>
                  <span className="font-semibold text-slate-200 font-mono">{hallTicket.examCode}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-midnight-950/40 border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Examination Date</span>
                  <span className="font-bold text-white">{hallTicket.examDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Test Timing</span>
                  <span className="font-bold text-cyan-300">{hallTicket.examTime}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-midnight-950/40 border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Reporting Time</span>
                  <span className="font-bold text-amber-400">{hallTicket.reportingTime}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Gate Closing</span>
                  <span className="font-bold text-red-400">{hallTicket.gateClosingTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Test Centre Allocation */}
          <div className="p-3.5 rounded-xl bg-midnight-950/60 border border-slate-800 mb-6 text-xs">
            <span className="text-[10px] text-cyan-400 uppercase font-bold block mb-1">
              Allocated Examination Center
            </span>
            <p className="font-bold text-white text-sm">{hallTicket.centreName}</p>
            <p className="text-slate-300 mt-0.5">{hallTicket.centreAddress}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">Center Code: {hallTicket.centreCode}</p>
          </div>

          {/* Critical Candidate Instructions */}
          <div className="border-t border-slate-800 pt-4 text-xs">
            <h4 className="text-[11px] font-bold text-slate-200 uppercase mb-2 flex items-center space-x-1.5 font-cyber">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mandatory Test Instructions</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 leading-relaxed">
              {hallTicket.instructions?.map((inst, i) => (
                <li key={i}>{inst}</li>
              ))}
            </ul>
          </div>

          {/* Signatures & Verification Seal */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8 mt-6 border-t border-slate-800/80 text-center text-[10px] text-slate-400">
            <div className="p-2 border-t border-slate-700">
              Candidate's Signature
            </div>
            <div className="p-2 border-t border-slate-700">
              Invigilator's Signature
            </div>
            <div className="p-2 border-t border-cyan-500/40 text-cyan-300 font-bold col-span-2 sm:col-span-1">
              Controller of Examinations
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
