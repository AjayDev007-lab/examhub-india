import React from "react";
import Link from "next/link";
import { ShieldCheck, FileText, Scale, ArrowLeft, CheckCircle2, Lock, Award, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Terms of Service | EXAMHUB INDIA",
  description: "Terms and conditions governing the use of ExamHub India, the centralized progressive national examination framework.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070F26] text-slate-800 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500 selection:text-black">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to ExamHub India Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-cyan-500/30 p-8 shadow-xl backdrop-blur-xl space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Terms of Service
              </h1>
              <p className="text-xs text-slate-500 dark:text-cyan-300/80 font-medium">
                Effective Date: November 2026 • Governing Law: Republic of India
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
            Welcome to ExamHub India. These Terms of Service (&quot;Terms&quot;) govern your access to and use of our national centralized examination discovery platform, personal document vault, admit card retrieval links, and educational advisory services.
          </p>
        </div>

        {/* Core Terms Cards */}
        <div className="space-y-6">
          {/* 1. Payment-Free Guarantee */}
          <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                1. 100% Payment-Free Public Student Access
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              ExamHub India is dedicated to accessible education. All core services—including examination calendar access, countdown timers, hall ticket download guides, result directories, and personal document vaults—are strictly <strong>100% free</strong>. We do not demand payments, subscriptions, or fees from candidates.
            </p>
          </div>

          {/* 2. Nature of Service & Official Examination Bodies */}
          <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <Award className="w-5 h-5 text-cyan-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                2. Information Accuracy & Examination Body Authority
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              ExamHub India aggregates and indexes publicly published gazettes, notices, and links from verified Central and State examination authorities (such as UPSC, SSC, NTA, RRB, State PSCs, and State School Boards). While we take comprehensive precautions to ensure rapid and accurate updates:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5 pl-2">
              <li>Official examination boards retain exclusive legal authority over syllabus, cutoff marks, eligibility criteria, and examination schedules.</li>
              <li>Candidates are strongly advised to cross-verify vital admission and hall ticket deadlines against the verified official links provided in our directory.</li>
            </ul>
          </div>

          {/* 3. Student Account Security & Vault Responsibility */}
          <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <Lock className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                3. Account Credentials & Security
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials. You agree to:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1 pl-2">
              <li>Use a strong, unique password not shared with other platforms.</li>
              <li>Notify ExamHub India immediately upon discovering any unauthorized access to your account.</li>
              <li>Not misuse automated scraping bots or security scanners against the platform infrastructure.</li>
            </ul>
          </div>

          {/* 4. Acceptable Use Policy */}
          <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                4. Acceptable Use & Prohibited Conduct
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Users shall not transmit false representations, impersonate government exam officials, inject malicious code, or engage in distributed denial-of-service attempts. Violations of acceptable use may result in immediate account termination and reporting to cyber law enforcement under the Information Technology Act, 2000.
            </p>
          </div>

          {/* 5. Limitation of Liability */}
          <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-purple-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                5. Limitation of Liability
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              ExamHub India shall not be held liable for delayed government publications, network outages of third-party examination portals, or discrepancies in hall ticket downloads conducted outside of our direct application services.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-800">
          <span>For legal questions regarding these terms, contact legal@examhubindia.in or visit our </span>
          <Link href="/privacy" className="text-blue-600 dark:text-cyan-400 hover:underline font-bold">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
}
