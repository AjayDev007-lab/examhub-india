import React from "react";
import { ShieldCheck, Mail, Phone, ExternalLink, Globe, Lock, Heart, MessageCircle } from "lucide-react";

export default function Footer({ onNavigate }) {
  return (
    <footer className="relative z-10 bg-midnight-950 border-t border-cyan-500/15 pt-14 pb-10 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Official WhatsApp Channel Join Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border border-emerald-500/40 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl mb-12">
          <div className="flex items-center space-x-3.5 text-center md:text-left">
            <div className="w-11 h-11 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,211,102,0.4)] shrink-0">
              <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-white tracking-wide flex items-center justify-center md:justify-start space-x-2">
                <span>Join ExamHub India Official WhatsApp Channel</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/40">
                  Official
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Never miss an update: Instant notifications for government exam dates, admit card downloads, and scorecard announcements directly on WhatsApp.
              </p>
            </div>
          </div>
          <a
            href="https://whatsapp.com/channel/0029VbA1ZLpJENy3wwL6VC0s"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BA56] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shrink-0 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <span>Follow Channel</span>
            <ExternalLink className="w-4 h-4 text-slate-950" />
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="font-cyber font-bold text-xl text-white tracking-wider">
                EXAMHUB <span className="text-cyan-400">INDIA</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's premier futuristic educational portal empowering over 2.4 crore students nationwide with verified hall tickets, instant examination results, and official recruitment gazette updates.
            </p>
            <div className="text-[11px] text-cyan-300 font-medium flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>National Academic Infrastructure Node</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200 mb-4 font-cyber">
              Student Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate("exams")} className="hover:text-cyan-300 transition-colors">
                  National Entrance Examinations
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("hall-tickets")} className="hover:text-cyan-300 transition-colors">
                  Download Verified Hall Tickets
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("results")} className="hover:text-cyan-300 transition-colors">
                  Examination Result Scorecards
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("notifications")} className="hover:text-cyan-300 transition-colors">
                  Official Gazette Notifications
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("register")} className="hover:text-cyan-300 transition-colors">
                  Student Registration 2026
                </button>
              </li>
            </ul>
          </div>

          {/* Administration & Transparency */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200 mb-4 font-cyber">
              Security & Policy
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate("about")} className="hover:text-cyan-300 transition-colors">
                  About ExamHub India
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("contact")} className="hover:text-cyan-300 transition-colors">
                  Grievance Redressal Mechanism
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("privacy")} className="hover:text-cyan-300 transition-colors">
                  Student Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("terms")} className="hover:text-cyan-300 transition-colors">
                  Terms of Examination Services
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("login")} className="hover:text-cyan-300 transition-colors flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-cyan-400" />
                  <span>Admin Console Login</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Student Support Helpline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200 mb-4 font-cyber">
              Official Helpline
            </h4>
            <div className="p-4 rounded-2xl glass-panel space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>1800-11-2026 (Toll Free)</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>support@examhub.in</span>
              </div>
              <p className="text-[10px] text-slate-400 pt-1">
                Active Hours: 09:00 AM – 06:00 PM IST (Mon to Sat)
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="border-t border-slate-800/80 pt-6 text-[11px] text-slate-400 space-y-3 text-center md:text-left md:flex md:items-center md:justify-between">
          <p className="max-w-3xl leading-relaxed">
            <span className="text-cyan-400 font-semibold">National Disclaimer:</span> ExamHub India aggregates official examination schedules, hall ticket issuance advisories, and computerized result scorecards directly from respective government boards (NTA, UPSC, SSC, RRB, State Councils). All logos and exam acronyms are properties of their respective authorities.
          </p>
          <p className="shrink-0 text-slate-400 pt-2 md:pt-0">
            © {new Date().getFullYear()} EXAMHUB INDIA. Developed with precision for Indian Scholars.
          </p>
        </div>
      </div>
    </footer>
  );
}
