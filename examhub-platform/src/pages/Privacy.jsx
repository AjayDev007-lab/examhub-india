import React from "react";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export default function Privacy() {
  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-xs text-slate-300 leading-relaxed">
      
      <div className="border-b border-cyan-500/20 pb-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 font-cyber">
          Legal & Transparency
        </span>
        <h1 className="text-3xl font-black text-white font-cyber">
          Student Data Privacy Policy
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Last Updated: February 2026 • Compliant with Digital Personal Data Protection Act (DPDPA)
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
        <h3 className="text-base font-bold text-white font-cyber uppercase">1. Information Collection</h3>
        <p>
          ExamHub India collects minimal necessary identification data including candidate full legal name, student ID, mobile number, registered email, date of birth, and educational enrollment details solely for the verification and transmission of examination admit cards and computerized scorecards.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
        <h3 className="text-base font-bold text-white font-cyber uppercase">2. Role-Based Access Control & Firestore Rules</h3>
        <p>
          Candidate records, uploaded identity photographs, hall tickets, and examination scores are protected via strict server-side Firestore security rules. A student can only view their own personal records. Administrators access information strictly for authorized academic duties.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
        <h3 className="text-base font-bold text-white font-cyber uppercase">3. Non-Commercialization Guarantee</h3>
        <p>
          ExamHub India strictly adheres to a zero commercialization policy. Student phone numbers, email addresses, and marks records are never sold, rented, or shared with third-party advertisers or private lead generation firms.
        </p>
      </div>

    </div>
  );
}
