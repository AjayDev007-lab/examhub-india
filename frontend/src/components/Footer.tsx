"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, ShieldCheck, Phone, ExternalLink, Instagram } from "lucide-react";
import { SITE_CONFIG } from "@/config/site";

export default function Footer() {
  const pathname = usePathname();
  if (pathname === "/auth/login" || pathname === "/student/login" || pathname?.startsWith("/auth/")) {
    return null;
  }

  return (
    <footer className="bg-[#0B1528] text-slate-400 border-t border-slate-800/80 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 pb-6 border-b border-slate-800/60">
          {/* Brand Col (2 cols on lg) */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Award className="w-4 h-4 text-amber-300" />
              </div>
              <span className="text-base font-black text-white tracking-tight">
                EXAMHUB<span className="text-blue-400"> INDIA</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              All Your Examination Documents and Results in One Place. Centralized access for Indian students covering Central, State, Entrance & University examinations.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>100% Free National Student Public Portal</span>
            </div>
          </div>

          {/* Core Services */}
          <div>
            <h4 className="text-white font-bold text-[11px] uppercase tracking-wider mb-2.5">Core Services</h4>
            <ul className="space-y-1.5">
              <li><Link href="/results" className="hover:text-blue-400 transition-colors">Check Exam Results</Link></li>
              <li><Link href="/hall-tickets" className="hover:text-blue-400 transition-colors">Admit Cards</Link></li>
              <li><Link href="/id-cards" className="hover:text-blue-400 transition-colors">Student ID Cards</Link></li>
              <li><Link href="/dashboard" className="hover:text-blue-400 transition-colors">Personal Vault</Link></li>
              <li><Link href="/jobs" className="hover:text-blue-400 transition-colors">Job Alerts</Link></li>
            </ul>
          </div>

          {/* Exam Coverage */}
          <div>
            <h4 className="text-white font-bold text-[11px] uppercase tracking-wider mb-2.5">Coverage</h4>
            <ul className="space-y-1.5">
              <li><Link href="/directory?cat=CENTRAL_GOVT" className="hover:text-blue-400">UPSC & SSC</Link></li>
              <li><Link href="/directory?cat=ENTRANCE_BOARD" className="hover:text-blue-400">NEET & JEE</Link></li>
              <li><Link href="/directory?cat=RECRUITMENT_BOARD" className="hover:text-blue-400">RRB & IBPS</Link></li>
              <li><Link href="/directory?cat=STATE_GOVT" className="hover:text-blue-400">State PSCs</Link></li>
              <li><Link href="/school" className="hover:text-blue-400">School Boards</Link></li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div>
            <h4 className="text-white font-bold text-[11px] uppercase tracking-wider mb-2.5">Legal & Policy</h4>
            <ul className="space-y-1.5">
              <li><Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy (DPDP)</Link></li>
              <li><Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/admin/login" className="hover:text-blue-400 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span>Admin Portal</span>
              </Link></li>
            </ul>
          </div>

          {/* Connect & Support */}
          <div>
            <h4 className="text-white font-bold text-[11px] uppercase tracking-wider mb-2.5">Connect</h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/contact" className="hover:text-white flex items-center space-x-1 font-medium text-slate-300">
                  <Phone className="w-3 h-3 text-blue-400" />
                  <span>Contact Us</span>
                </Link>
              </li>
              <li>
                <a
                  href={SITE_CONFIG.social.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 flex items-center space-x-1 text-slate-300 transition-colors"
                >
                  <Instagram className="w-3 h-3 text-pink-500" />
                  <span>{SITE_CONFIG.social.instagram.username}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Compact Bottom Bar */}
        <div className="pt-4 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} EXAMHUB INDIA. Centralized All-India Student Portal.</p>
          <div className="flex items-center space-x-4">
            <span>Server Time (IST): {new Date().toLocaleDateString("en-IN")}</span>
            <span className="text-slate-700">•</span>
            <span className="inline-flex items-center space-x-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Official Indexer Live</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
