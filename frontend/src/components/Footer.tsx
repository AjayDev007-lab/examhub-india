"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, ExternalLink, ShieldAlert, Phone, Mail } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  if (pathname === "/auth/login" || pathname === "/student/login" || pathname?.startsWith("/auth/")) {
    return null;
  }

  const officialExternalLinks = [
    { name: "National Testing Agency (NTA)", url: "https://nta.ac.in/" },
    { name: "Central Board of Secondary Education (CBSE)", url: "https://www.cbse.gov.in/" },
    { name: "Union Public Service Commission (UPSC)", url: "https://upsc.gov.in/" },
    { name: "Staff Selection Commission (SSC)", url: "https://ssc.gov.in/" },
  ];

  return (
    <footer className="bg-[#0B1528] text-slate-400 border-t border-slate-800 text-xs mt-auto">
      {/* Disclaimer Banner */}
      <div className="bg-[#060D1A] py-3 px-4 border-b border-slate-800/80 text-center">
        <p className="max-w-4xl mx-auto text-[11px] text-slate-400 leading-relaxed">
          <span className="text-amber-400 font-bold">Important Disclaimer:</span> ExamHub India is an independent educational information platform and is not affiliated with any government authority. Not an official government website. Always verify examination schedules, notices, and criteria on the official exam body site.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-8 border-b border-slate-800/80">
          
          {/* Brand Info (2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-3">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Award className="w-4 h-4 text-amber-300" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                EXAMHUB<span className="text-blue-400"> INDIA</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              All your examination documents, results, admit cards, and job updates in one place. An independent information resource for students across India.
            </p>
            <div className="pt-2 text-[11px] text-slate-500">
              <p>Designed for fast access on Indian mobile networks.</p>
            </div>
          </div>

          {/* Core Services */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Core Portals</h4>
            <ul className="space-y-2">
              <li><Link href="/results" className="hover:text-white transition-colors">Results</Link></li>
              <li><Link href="/hall-tickets" className="hover:text-white transition-colors">Admit Cards</Link></li>
              <li><Link href="/jobs" className="hover:text-white transition-colors">Jobs</Link></li>
              <li><Link href="/dashboard?tab=vault" className="hover:text-white transition-colors">Documents</Link></li>
            </ul>
          </div>

          {/* Quick Links & Legal */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Information</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms and Conditions</Link></li>
            </ul>
          </div>

          {/* Official External Exam Authority Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Official Websites</h4>
            <ul className="space-y-2">
              {officialExternalLinks.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-300 flex items-center space-x-1.5 transition-colors group"
                  >
                    <span className="truncate">{item.name}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-300 shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Row */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} ExamHub India. All rights reserved.</p>
          <p className="text-slate-500 text-center sm:text-right">
            Independent Student Information Portal
          </p>
        </div>
      </div>
    </footer>
  );
}
