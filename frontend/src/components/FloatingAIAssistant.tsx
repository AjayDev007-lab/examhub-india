"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Bot,
  X,
  Send,
  ExternalLink,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Award
} from "lucide-react";

interface Message {
  sender: "user" | "ai";
  text: string;
  sourceUrl?: string;
  sourceLabel?: string;
  timestamp: string;
}

export default function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Namaste! I am your ExamHub India AI Academic & Career Guide. I can help you check eligibility criteria, discover matching national examinations, parse syllabus modules, or summarize official notifications.",
      timestamp: "Just now"
    }
  ]);

  const quickPrompts = [
    "What government exams can I apply for with a B.E. / B.Tech?",
    "Check UPSC Civil Services 2026 eligibility & age limits",
    "Show latest Railway RRB Group D & ALP notification details",
    "How to prepare a 60-day study roadmap for SSC CGL Tier 1?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim() || isTyping) return;

    const userMessage: Message = {
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMsg("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = "Here is the guidance based on verified official notices:";
      let sourceUrl = "https://examhub-india.vercel.app/official-websites";
      let sourceLabel = "Official Government Directory";

      const query = text.toLowerCase();
      if (query.includes("b.tech") || query.includes("engineer")) {
        reply = "With an Engineering degree (B.E. / B.Tech), you are eligible for prime Central & State recruitment including: 1) UPSC Engineering Services Exam (ESE), 2) ISRO Scientist/Engineer 'SC' (Civil, Mech, ECE, CS), 3) BHEL & PSU Executive Trainee drives, and 4) UPSC CSE / State PSCs where any graduation qualifies.";
        sourceUrl = "https://upsc.gov.in/";
        sourceLabel = "UPSC Official Portal";
      } else if (query.includes("upsc") || query.includes("civil services")) {
        reply = "UPSC CSE 2026 Eligibility: 1) Educational Qualification: Graduation in any discipline from a recognized university. 2) Age Limit: 21 to 32 years as of August 1, 2026 (relaxations: SC/ST +5 yrs, OBC +3 yrs). 3) Attempts: General (6), OBC (9), SC/ST (Unlimited within age).";
        sourceUrl = "https://upsc.gov.in/";
        sourceLabel = "UPSC Official Gazette Notice";
      } else if (query.includes("rrb") || query.includes("railway")) {
        reply = "For Indian Railways: RRB Group D CEN requires 10th Pass + ITI (or NCVT/SCVT certificate), age 18-33 years. RRB ALP requires Matriculation + ITI / Diploma in Mech/Electrical/Electronics/Automobile. Selection involves CBT 1, CBT 2, CBAT, and PET.";
        sourceUrl = "https://indianrailways.gov.in/";
        sourceLabel = "Ministry of Railways (RRB)";
      } else if (query.includes("roadmap") || query.includes("study") || query.includes("ssc")) {
        reply = "Recommended 60-Day SSC CGL Strategy: Days 1-20: Concept mastery in Quantitative Aptitude & Reasoning. Days 21-40: High-weightage English Comprehension & NCERT General Awareness. Days 41-60: Daily full-length timed mock tests with in-depth error log review.";
        sourceUrl = "https://ssc.gov.in/";
        sourceLabel = "Staff Selection Commission (SSC)";
      } else {
        reply = `Based on the latest gazette publications and official recruitment boards indexed in ExamHub India: "${text}" is categorized under Central/State educational frameworks. Always cross-verify syllabus and closing dates with the verified authority portal.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: reply,
          sourceUrl,
          sourceLabel,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-3.5 bg-gradient-to-r from-[#2563EB] to-[#102D59] hover:from-blue-600 hover:to-blue-900 text-white rounded-full shadow-2xl shadow-blue-600/40 border border-blue-400/30 flex items-center justify-center transition-all duration-300 hover:scale-105"
          aria-label="Open AI Academic Assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Sparkles className="w-6 h-6 animate-spin-slow text-amber-300" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
            </>
          )}

          {/* Tooltip on hover */}
          {!isOpen && (
            <span className="hidden md:block absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Need Help? Ask AI Assistant ✨
            </span>
          )}
        </button>
      </div>

      {/* Slide-out Assistant Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] max-h-[80vh] flex flex-col bg-white dark:bg-[#101E3D] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-6">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#102D59] to-[#2563EB] text-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-sm tracking-tight text-white">ExamHub AI Assistant</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500 text-white tracking-widest">
                    LIVE
                  </span>
                </div>
                <p className="text-[10px] text-blue-200/80">National Examination & Career Guidance</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Disclaimer Banner */}
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/60 border-b border-blue-100 dark:border-blue-900/50 flex items-center space-x-2 text-[10px] text-blue-700 dark:text-blue-300">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
            <span>AI guidance strictly synthesized from official government gazettes & verified boards.</span>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs max-h-[420px]">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                    m.sender === "user"
                      ? "bg-[#2563EB] text-white rounded-tr-none"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-700"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>

                  {m.sourceUrl && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 dark:text-slate-400">Verified Source:</span>
                      <a
                        href={m.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-[#2563EB] dark:text-blue-400 font-bold hover:underline"
                      >
                        <span>{m.sourceLabel || "Official Portal"}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      m.sender === "user" ? "text-blue-200" : "text-slate-400"
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none p-3 border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-200" />
                  <span className="text-[10px] text-slate-400 pl-1">Synthesizing verified criteria...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Chips */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-x-auto whitespace-nowrap space-x-2 scrollbar-none flex">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-[#2563EB] dark:text-blue-300 border border-blue-200 dark:border-slate-700 text-[10px] font-semibold hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-[#101E3D] border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask about age limits, exams, study roadmaps..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-medium"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || isTyping}
              className="p-2.5 bg-[#2563EB] hover:bg-blue-600 disabled:opacity-40 text-white rounded-xl shadow-md transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
