import React from "react";
import Link from "next/link";
import { Award, ShieldCheck, Mail, Phone, ExternalLink, HelpCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary-950 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Purpose */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Award className="w-5 h-5 text-amber-300" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                EXAMHUB<span className="text-blue-400"> INDIA</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              All Your Examination Documents and Results in One Place. Centralized access for Indian students covering Central & State Government examinations, national entrance tests, government and private universities.
            </p>
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] leading-relaxed text-slate-400">
              <span className="font-semibold text-slate-300">Official Notice:</span> Integrations are progressive and permitted. Unsupported examination bodies feature verified links and retrieval instructions.
            </div>
          </div>

          {/* Core Services */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Core Services</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/results" className="hover:text-blue-400 transition-colors">
                  Check Exam Results
                </Link>
              </li>
              <li>
                <Link href="/hall-tickets" className="hover:text-blue-400 transition-colors">
                  Download Hall Tickets / Admit Cards
                </Link>
              </li>
              <li>
                <Link href="/id-cards" className="hover:text-blue-400 transition-colors">
                  Student ID Card Downloads
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-blue-400 transition-colors">
                  Personal Document Library
                </Link>
              </li>
              <li>
                <Link href="/directory" className="hover:text-blue-400 transition-colors">
                  All India Exam Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Directory Coverage */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Coverage</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/directory?cat=CENTRAL_GOVT" className="hover:text-blue-400">Central Government (UPSC, SSC)</Link></li>
              <li><Link href="/directory?cat=ENTRANCE_BOARD" className="hover:text-blue-400">Entrance Tests (NEET, JEE, CUET)</Link></li>
              <li><Link href="/directory?cat=RECRUITMENT_BOARD" className="hover:text-blue-400">Recruitment Boards (RRB, IBPS)</Link></li>
              <li><Link href="/directory?cat=STATE_GOVT" className="hover:text-blue-400">State PSCs (TNPSC, UPPSC, MPSC)</Link></li>
              <li><Link href="/directory?cat=CENTRAL_UNIVERSITY" className="hover:text-blue-400">Universities (DU, MU, VTU, BITS)</Link></li>
            </ul>
          </div>

          {/* Legal & Portals */}
          <div>
            <h3 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Support & Admin</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/admin/login" className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </Link>
              </li>
              <li><Link href="/dashboard" className="hover:text-white">Help & Support Tickets</Link></li>
              <li><span className="text-slate-500">Privacy Policy (DPDP Act)</span></li>
              <li><span className="text-slate-500">Terms of Service</span></li>
              <li><span className="text-slate-500">Data Retention Standards</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} EXAMHUB INDIA. Progressive National Examination Access Framework.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span>Server Time (IST): {new Date().toLocaleDateString("en-IN")}</span>
            <span className="inline-flex items-center space-x-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>API Gateway Healthy</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
