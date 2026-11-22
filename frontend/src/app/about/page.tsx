import React from "react";
import Link from "next/link";
import { Award, ShieldCheck, Search, Users, ExternalLink, ArrowRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | ExamHub India",
  description: "Learn about ExamHub India, an independent educational information platform dedicated to helping Indian students discover examination results, hall tickets, and career opportunities.",
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
          <Award className="w-3.5 h-3.5" />
          <span>Independent Educational Platform</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          About ExamHub India
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          ExamHub India is a student-first portal designed to simplify access to examination results, admit cards, official notifications, and verified job opportunities across India.
        </p>
      </div>

      {/* Mission & Purpose */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
            <Search className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Our Mission</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            To provide Indian candidates with a single, clear, uncluttered gateway where they can quickly find verified links to their board, university, and recruitment examination announcements without misleading advertisements or confusion.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Our Independence</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            ExamHub India is an independent educational portal and is NOT affiliated with, sponsored by, or operated by any government department or examination body. All examination marks and scorecards are verified against public records and authentic authority websites.
          </p>
        </div>
      </div>

      {/* Authority Links Disclaimer */}
      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Official Sources</h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          We encourage all candidates to always consult the verified official websites of the conducting commissions:
        </p>
        <div className="flex flex-wrap gap-3 pt-2 text-xs">
          <a href="https://nta.ac.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1">
            <span>NTA Official Website</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a href="https://www.cbse.gov.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1">
            <span>CBSE Official Website</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a href="https://upsc.gov.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1">
            <span>UPSC Official Website</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a href="https://ssc.gov.in/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1">
            <span>SSC Official Website</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Back to Home CTA */}
      <div className="text-center pt-4">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
        >
          <span>Explore All Examination Portals</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
