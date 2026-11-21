"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Mail, Phone, MapPin, Send, Instagram, ExternalLink, 
  ShieldCheck, MessageSquare, Clock, CheckCircle2, AlertCircle, Sparkles, ArrowRight
} from "lucide-react";
import { SITE_CONFIG } from "@/config/site";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("EXAMINATION_QUERY");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#102D59] via-[#0D2344] to-[#0A1A33] text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Official Student Helpdesk & Communications</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Get in Touch with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">ExamHub India</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Have questions regarding examination scorecards, admit cards, or job notifications? Reach out to our student support desk or follow our official social channels.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Official Channels & Instagram Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* FEATURED: Official Instagram Profile Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-105 transition-transform">
                  <Instagram className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                    Official Social Profile
                  </span>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {SITE_CONFIG.social.instagram.label}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Follow our official Instagram profile for real-time examination alerts, circular releases, application reminders, and student updates.
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 mb-5 space-y-1">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Username</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                  {SITE_CONFIG.social.instagram.username}
                </div>
              </div>

              <a
                href={SITE_CONFIG.social.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 group-hover:shadow-lg"
              >
                <Instagram className="w-4 h-4" />
                <span>Follow {SITE_CONFIG.social.instagram.username}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* General Contact Info */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Official Helpdesk
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start space-x-3 text-slate-600 dark:text-slate-300">
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Email Support</div>
                    <div>{SITE_CONFIG.social.email}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-slate-600 dark:text-slate-300">
                  <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Central Helpdesk</div>
                    <div>{SITE_CONFIG.social.helpdesk}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-slate-600 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">National Registry</div>
                    <div>{SITE_CONFIG.social.officeAddress}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-slate-600 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Operating Hours</div>
                    <div>Monday – Saturday: 09:30 AM – 06:00 PM IST</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Student Support Ticket System →</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Contact Query Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Send Us a Direct Message</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Our verification support team typically responds within 24 business hours.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Message Sent Successfully</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                    Thank you for reaching out. Your query has been logged with reference ID #{Math.floor(100000 + Math.random() * 900000)}. Our helpdesk will contact you via email shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Aarav Sharma"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@example.com"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Query Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                    >
                      <option value="EXAMINATION_QUERY">Examination Scorecard & Result Verification</option>
                      <option value="HALL_TICKET">Admit Card / Hall Ticket Retrieval</option>
                      <option value="JOB_ALERT">Job Notification & Vacancy Details</option>
                      <option value="INSTITUTION_INTEGRATION">University / College Integration</option>
                      <option value="TECHNICAL_SUPPORT">Account & Technical Support</option>
                      <option value="MEDIA_INQUIRY">Social Media & Public Communications</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1 dark:text-slate-300">
                      Message Details *
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      placeholder="Please include exam roll number, registration number or institution name if relevant..."
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-3 bg-[#102D59] hover:bg-blue-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? "Sending Query..." : "Submit Inquiry"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
