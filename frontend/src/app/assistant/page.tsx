"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, Send, ShieldCheck, ExternalLink, Bot, User, 
  HelpCircle, RefreshCw, BookOpen, AlertCircle, ArrowRight,
  Landmark, Award, GraduationCap, Briefcase, CheckCircle2
} from "lucide-react";
import { fetchApi } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: { title: string; url: string; source: string }[];
  timestamp: string;
}

const SUGGESTIONS = [
  "UPSC Civil Services eligibility, stages and OTR process",
  "NEET UG medical qualification and counselling authorities",
  "JEE Main engineering subjects, sessions and JoSAA counselling",
  "National Scholarship Portal (NSP) application process",
  "Staff Selection Commission (SSC CGL / CHSL) eligibility criteria",
  "State Public Service Commissions recruitment procedures"
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I am the **ExamHub AI Exam Assistant**.\n\nI provide verified answers regarding Indian national and state examinations, recruitment commissions, eligibility criteria, and government portals using authentic government data sources (.gov.in, .nic.in, .ac.in).\n\nHow can I assist your examination preparation today?`,
      citations: [
        { title: "National Portal of India", url: "https://www.india.gov.in/", source: "Government of India" }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!userText) setInput("");
    setLoading(true);

    try {
      const res = await fetchApi("/api/assistant/chat", {
        method: "POST",
        body: JSON.stringify({ message: textToSend.trim() })
      });

      const assistantMsg: Message = {
        role: "assistant",
        content: res.answer || "I could not find verified official records for this query.",
        citations: res.citations || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I encountered an error communicating with the official knowledge server. Please verify your query directly on the [Official Websites Directory](/official-websites).`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Verified AI Examination Assistant</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          ExamHub AI Assistant
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Grounded in authentic Government of India gazettes, testing agencies, and official recruitment notifications. Zero fabricated dates or unverified rules.
        </p>
      </div>

      {/* Advisory Banner */}
      <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All responses provide direct citations to verified official .gov.in and .nic.in portals.</span>
        </div>
        <Link href="/official-websites" className="text-blue-600 font-bold hover:underline hidden sm:inline">
          Browse Directory →
        </Link>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[560px] overflow-hidden">
        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${
                m.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gradient-to-br from-slate-900 to-blue-900 text-amber-300"
                }`}
              >
                {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs space-y-2.5 ${
                  m.role === "user"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-50 border border-slate-200/80 text-slate-800"
                }`}
              >
                <div className="leading-relaxed whitespace-pre-line font-normal">
                  {m.content}
                </div>

                {/* Citations block for assistant */}
                {m.citations && m.citations.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Official Source Citations:
                    </span>
                    <div className="space-y-1">
                      {m.citations.map((c, cIdx) => (
                        <a
                          key={cIdx}
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/90 text-blue-600 hover:border-blue-400 font-medium transition-all group"
                        >
                          <div className="truncate mr-2">
                            <span className="font-semibold block truncate">{c.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono truncate">{c.url}</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-blue-600" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] font-mono text-right ${
                    m.role === "user" ? "text-blue-200" : "text-slate-400"
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3 text-xs text-slate-500">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Searching verified government authority databases...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestion pills */}
        <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex overflow-x-auto gap-1.5 scrollbar-none">
          {SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              disabled={loading}
              className="px-3 py-1 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[11px] rounded-lg whitespace-nowrap transition-all font-medium"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Chat input box */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about exam qualifications, selection stages, scholarships or official URLs..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-sm transition-all flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
