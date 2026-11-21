import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, Database, UserCheck, ArrowLeft, CheckCircle2, Award } from "lucide-react";

export const metadata = {
  title: "Privacy Policy (DPDP Act) | EXAMHUB INDIA",
  description: "Comprehensive privacy framework and data protection guidelines under the Digital Personal Data Protection (DPDP) Act 2023.",
};

export default function PrivacyPolicyPage() {
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-cyan-500 flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Privacy Policy (DPDP Act Compliance)
              </h1>
              <p className="text-xs text-slate-500 dark:text-cyan-300/80 font-medium">
                Framework: Digital Personal Data Protection Act, 2023 (Republic of India)
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
            ExamHub India is committed to strict data privacy, candidate confidentiality, and transparency. This policy describes how we collect, store, protect, and process student information.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {/* 1. Data Collection */}
          <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <Database className="w-5 h-5 text-cyan-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                1. Information We Collect
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              We collect minimal information necessary to deliver customized examination notifications and document management:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5 pl-2">
              <li><strong>Candidate Profile:</strong> Full name, verified email address, and optional contact number.</li>
              <li><strong>Academic Preferences:</strong> Selected examination boards (e.g. UPSC, NEET, JEE), state directories, and saved job countdowns.</li>
              <li><strong>Vault Documents:</strong> Candidate-uploaded admit cards and scorecards stored in an encrypted vault.</li>
            </ul>
          </div>

          {/* 2. Zero Monetization & Commercialization Guarantee */}
          <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                2. Zero Commercialization & Advertising Policy
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>Your personal data is never sold.</strong> Unlike third-party job boards and coaching aggregators, ExamHub India does not sell student phone numbers, email addresses, or exam lists to coaching institutes, telemarketers, or commercial ad networks.
            </p>
          </div>

          {/* 3. 256-Bit Security Safeguards */}
          <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <Lock className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                3. Encryption & Vault Security Safeguards
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              All stored credentials, passwords, and sessions are hashed using industry-standard modern cryptographic algorithms (Argon2 / PBKDF2). Data in transit is protected via TLS 1.3 encryption. Internal access to database vaults is restricted via strict role-based access control (RBAC).
            </p>
          </div>

          {/* 4. Rights under DPDP Act */}
          <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <UserCheck className="w-5 h-5 text-purple-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                4. Candidate Rights as Data Principals
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Under the Digital Personal Data Protection Act (DPDP Act, 2023), every registered candidate possesses:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1 pl-2">
              <li><strong>Right to Access:</strong> View and export all personal data and saved scorecards at any time.</li>
              <li><strong>Right to Correction:</strong> Update profile, mobile numbers, and examination preferences.</li>
              <li><strong>Right to Erasure:</strong> Delete your student profile and all associated vault records upon request.</li>
              <li><strong>Right of Grievance Redressal:</strong> Submit inquiries directly to our Data Protection Officer.</li>
            </ul>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-800">
          <span>For data protection requests or inquiries, email privacy@examhubindia.in or view our </span>
          <Link href="/terms" className="text-blue-600 dark:text-cyan-400 hover:underline font-bold">Terms of Service</Link>.
        </div>
      </div>
    </div>
  );
}
