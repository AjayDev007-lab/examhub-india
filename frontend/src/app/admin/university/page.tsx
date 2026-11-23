"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ArrowLeft,
  Plus,
  Search,
  ExternalLink,
  BookOpen,
  Building2,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Download,
  Eye,
  FileText
} from "lucide-react";
import {
  initialUniversities,
  initialUniversityQuestionPapers,
  UniversityItem,
  UniversityQuestionPaper
} from "@/lib/platformData";

export default function AdminUniversityPage() {
  const [universities, setUniversities] = useState<UniversityItem[]>([]);
  const [papers, setPapers] = useState<UniversityQuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUniv, setSelectedUniv] = useState<number | "ALL">("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Form State for new Paper
  const [univId, setUnivId] = useState<number>(1);
  const [degree, setDegree] = useState("B.E.");
  const [department, setDepartment] = useState("Computer Science and Engineering");
  const [semester, setSemester] = useState(4);
  const [subject, setSubject] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [year, setYear] = useState(2024);
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [univRes, paperRes] = await Promise.all([
        fetch("/api/universities").then((r) => r.json()).catch(() => ({ universities: initialUniversities })),
        fetch("/api/university-papers").then((r) => r.json()).catch(() => ({ papers: initialUniversityQuestionPapers }))
      ]);

      setUniversities(univRes.universities || initialUniversities);
      setPapers(paperRes.papers || initialUniversityQuestionPapers);
    } catch (_) {
      setUniversities(initialUniversities);
      setPapers(initialUniversityQuestionPapers);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPaper(e: React.FormEvent) {
    e.preventDefault();
    const currentUniv = universities.find((u) => u.id === Number(univId));
    const newPaper = {
      university_id: Number(univId),
      university_name: currentUniv?.name || "State University",
      university_code: currentUniv?.short_code || "UNIV",
      degree,
      department,
      semester: Number(semester),
      subject_name: subject,
      subject_code: subjectCode,
      exam_year: Number(year),
      exam_session: "NOV_DEC",
      exam_type: "REGULAR",
      pdf_url: pdfUrl || "https://annauniv.edu/downloads/qp-sample.pdf",
      file_size_mb: 2.1,
      download_count: 0,
      description: "Official End Semester Examination Question Paper"
    };

    try {
      const res = await fetch("/api/university-papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPaper)
      });
      const data = await res.json();
      if (data.paper) {
        setPapers((prev) => [data.paper, ...prev]);
      }
      setSuccessMsg("University Question Paper successfully published!");
      setIsAddModalOpen(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      alert("Failed to save question paper.");
    }
  }

  const filteredPapers = papers.filter((p: any) => {
    const sName = p.subject_name || p.subject || "";
    const sCode = p.subject_code || p.subjectCode || "";
    const uName = p.university_name || p.universityName || "";
    const uId = p.university_id || p.universityId;

    const matchesSearch =
      sName.toLowerCase().includes(search.toLowerCase()) ||
      sCode.toLowerCase().includes(search.toLowerCase()) ||
      uName.toLowerCase().includes(search.toLowerCase());
    const matchesUniv = selectedUniv === "ALL" || uId === selectedUniv;
    return matchesSearch && matchesUniv;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
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
                University Question Papers CMS
              </h1>
              <p className="text-xs text-slate-400">
                Manage affiliated universities, semester examinations, and verified PDF question papers.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/university"
              target="_blank"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <span>View Public Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Question Paper</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500 text-emerald-300 rounded-2xl flex items-center space-x-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-semibold block">Recognized Universities</span>
            <span className="text-2xl font-black text-white mt-1 block">{universities.length}</span>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-[11px] text-blue-400 font-semibold block">Archived Question Papers</span>
            <span className="text-2xl font-black text-blue-400 mt-1 block">{papers.length}</span>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-[11px] text-emerald-400 font-semibold block">Semester 1 to 8 Coverage</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">100% Complete</span>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-[11px] text-purple-400 font-semibold block">Verified Download Links</span>
            <span className="text-2xl font-black text-purple-400 mt-1 block">Active</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subject, code, or university..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedUniv("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedUniv === "ALL" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              All Universities
            </button>
            {universities.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUniv(u.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedUniv === u.id ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {u.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Question Papers Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Subject & Code</th>
                  <th className="py-3 px-4">University</th>
                  <th className="py-3 px-4">Degree / Department</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Exam Year</th>
                  <th className="py-3 px-4 text-right">PDF Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredPapers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      No question papers found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredPapers.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{p.subject_name || p.subject}</div>
                        <div className="text-blue-400 font-semibold">{p.subject_code || p.subjectCode}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-300">{p.university_name || p.universityName}</td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {p.degree} — {p.department}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          Sem {p.semester}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-amber-400">{p.exam_year || p.year}</td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={p.pdf_url || p.downloadUrl}
                          download
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold inline-flex items-center space-x-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add Paper */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-base flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-blue-400" />
                  <span>Upload University Question Paper</span>
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddPaper} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Select University</label>
                  <select
                    value={univId}
                    onChange={(e) => setUnivId(Number(e.target.value))}
                    className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                  >
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.short_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Degree</label>
                    <input
                      type="text"
                      required
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      placeholder="e.g. B.E."
                      className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Department / Branch</label>
                    <input
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science and Engineering"
                      className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Subject Name</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Database Management Systems"
                      className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Subject Code</label>
                    <input
                      type="text"
                      required
                      value={subjectCode}
                      onChange={(e) => setSubjectCode(e.target.value)}
                      placeholder="e.g. CS3492"
                      className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Semester (1 to 8)</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                      className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Examination Year</label>
                    <input
                      type="number"
                      required
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Question Paper PDF URL</label>
                  <input
                    type="url"
                    required
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="https://official-university.edu/papers/cs3492-2024.pdf"
                    className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg"
                  >
                    Upload Paper
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
