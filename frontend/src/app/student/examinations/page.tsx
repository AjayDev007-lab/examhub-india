"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Award, Search, Filter, BookOpen, ExternalLink, 
  Calendar, CheckCircle2, Plus, FileText, ArrowRight
} from "lucide-react";
import StudentNav from "@/components/StudentNav";
import { fetchApi } from "@/lib/api";

export default function StudentExaminationsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [registeredIds, setRegisteredIds] = useState<number[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [registeringId, setRegisteringId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [search]);

  async function loadData() {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("examhub_user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || 1;

      const [examsRes, myExamsRes] = await Promise.all([
        fetchApi(`/api/exams?limit=50${search.trim() ? `&q=${encodeURIComponent(search.trim())}` : ""}`),
        fetchApi(`/api/student/exams?user_id=${userId}`).catch(() => ({ registered_exams: [] }))
      ]);

      setExams(examsRes || []);
      if (myExamsRes && myExamsRes.registered_exams) {
        setRegisteredIds(myExamsRes.registered_exams.map((r: any) => r.examination_id).filter(Boolean));
      }
    } catch (err) {
      console.error("Failed to load examinations:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToMyExams(exam: any) {
    setRegisteringId(exam.id);
    try {
      const userStr = localStorage.getItem("examhub_user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || 1;

      const res = await fetchApi(`/api/student/exams/register?user_id=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examination_id: exam.id,
          status: "ADDED_TO_MY_EXAMS",
          notes: `Added from public national catalog on ${new Date().toLocaleDateString()}`
        })
      });

      if (res && res.success) {
        setRegisteredIds([...registeredIds, exam.id]);
        setSuccessMsg(`Added ${exam.name} to your registered exams and synced with your calendar!`);
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err: any) {
      alert("Failed to register: " + (err.message || "Unknown error"));
    } finally {
      setRegisteringId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <StudentNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                Official Examination Registry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              National & State Examinations
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Explore verified civil service, engineering, entrance, banking, and university examinations across India.
            </p>
          </div>

          <Link
            href="/student/my-exams"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-colors flex items-center space-x-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>View My Registered Exams</span>
          </Link>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by exam name, organizing body (e.g. UPSC, NTA, SSC), or exam code..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Examination Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Searching official national examinations...
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900">No examinations found</h3>
            <p className="text-xs text-slate-500 mt-1">Try searching with a broader keyword such as "UPSC" or "Board".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {exams.map((exam) => {
              const isAdded = registeredIds.includes(exam.id);

              return (
                <div
                  key={exam.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {exam.code || "GOVT"}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {exam.exam_type}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900 tracking-tight line-clamp-2">
                        {exam.name}
                      </h3>
                      {exam.organization && (
                        <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
                          {exam.organization.name}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3">
                      {exam.description || "Official national entrance and eligibility examination."}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      {exam.syllabus_url && (
                        <a
                          href={exam.syllabus_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center space-x-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Syllabus</span>
                        </a>
                      )}
                      {exam.official_website && (
                        <a
                          href={exam.official_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-600 hover:underline flex items-center space-x-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Official Portal</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    {isAdded ? (
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Added to My Exams</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddToMyExams(exam)}
                        disabled={registeringId === exam.id}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{registeringId === exam.id ? "Adding..." : "Add to My Exams"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
