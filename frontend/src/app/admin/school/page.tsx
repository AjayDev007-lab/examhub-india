"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  GraduationCap, ArrowLeft, Search, Plus, ExternalLink, ShieldCheck, 
  Trash2, Edit3, CheckCircle, AlertTriangle, Eye, RefreshCw, BookOpen,
  Award, FileText, Layers, Bookmark, Download
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AdminSchoolManagementPage() {
  const [activeTab, setActiveTab] = useState<"BOARDS" | "RESULTS" | "BOOKS" | "SYLLABUS">("BOARDS");
  const [boards, setBoards] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [resBoards, resResults, resBooks] = await Promise.all([
        fetchApi("/api/school/boards"),
        fetchApi("/api/school/results"),
        fetchApi("/api/school/books")
      ]);
      setBoards(resBoards.boards || []);
      setResults(resResults.results || []);
      setBooks(resBooks.books || []);
    } catch (err) {
      console.error("Failed to load school management data:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/dashboard"
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                School Education Management Suite
              </h1>
              <p className="text-xs text-slate-400">
                Manage Class 10, 11 & 12 Boards, Result Announcements, Open-Access Textbooks, and Curriculums.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/school"
              target="_blank"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <span>View Public Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-semibold block">Education Boards</span>
            <span className="text-2xl font-black text-white mt-1 block">{boards.length}</span>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-[11px] text-blue-400 font-semibold block">Result Announcements</span>
            <span className="text-2xl font-black text-blue-400 mt-1 block">{results.length}</span>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-[11px] text-emerald-400 font-semibold block">Authorized Textbooks</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">{books.length}</span>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-[11px] text-purple-400 font-semibold block">Verification Status</span>
            <span className="text-2xl font-black text-purple-400 mt-1 block">100% Verified</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          {[
            { id: "BOARDS", label: "Boards Directory", icon: ShieldCheck },
            { id: "RESULTS", label: "Result Announcements", icon: Award },
            { id: "BOOKS", label: "Textbooks Library", icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Boards */}
        {activeTab === "BOARDS" && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Board Name</th>
                  <th className="p-4">Type & State</th>
                  <th className="p-4">Classes</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Official Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {boards.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40">
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-400 font-mono text-[10px] font-bold">
                          {b.code}
                        </span>
                        <span className="font-bold text-white text-xs">{b.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{b.type} • {b.state_name}</td>
                    <td className="p-4 text-slate-400">{b.classes_supported?.join(", ")}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-400">
                        {b.verification_status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <a
                        href={b.official_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg inline-block transition-colors mr-2"
                        title="Official Website"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Results */}
        {activeTab === "RESULTS" && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Examination</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Board</th>
                  <th className="p-4">Date & Status</th>
                  <th className="p-4 text-right">Result URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-white">{r.exam_name}</td>
                    <td className="p-4 text-slate-300">Class {r.class_level}</td>
                    <td className="p-4 text-slate-400">{r.board_code}</td>
                    <td className="p-4">
                      <span className="font-bold text-amber-400 block">{r.result_date_display}</span>
                      <span className="text-[10px] text-slate-400">{r.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <a
                        href={r.official_result_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg inline-block transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Textbooks */}
        {activeTab === "BOOKS" && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Book Title</th>
                  <th className="p-4">Class & Stream</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Publisher</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {books.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-white">{b.title}</td>
                    <td className="p-4 text-slate-300">Class {b.class_level} {b.stream ? `• ${b.stream}` : ""}</td>
                    <td className="p-4 text-slate-400">{b.subject}</td>
                    <td className="p-4 text-slate-400">{b.publisher}</td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/school/books/reader/${b.id}`}
                        className="p-1.5 bg-blue-900/40 hover:bg-blue-900 text-blue-300 rounded-lg inline-block transition-colors mr-2"
                        title="Reader"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <a
                        href={b.official_download_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg inline-block transition-colors"
                        title="Official PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
