"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Laptop,
  ArrowLeft,
  Plus,
  Search,
  ExternalLink,
  Briefcase,
  Building2,
  Trash2,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Clock,
  DollarSign,
  Sparkles
} from "lucide-react";
import { initialITJobs, ITJobItem } from "@/lib/platformData";

export default function AdminITJobsPage() {
  const [jobs, setJobs] = useState<ITJobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("Software Engineer");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState<"REMOTE" | "HYBRID" | "ON_SITE">("REMOTE");
  const [experience, setExperience] = useState<"FRESHER" | "EXPERIENCED" | "INTERNSHIP">("FRESHER");
  const [salary, setSalary] = useState("₹6,00,000 - ₹12,00,000 / yr");
  const [skillsStr, setSkillsStr] = useState("React, Node.js, TypeScript");
  const [applyUrl, setApplyUrl] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    setLoading(true);
    try {
      const res = await fetch("/api/it-jobs");
      const json = await res.json();
      if (json.jobs && json.jobs.length > 0) {
        setJobs(json.jobs);
      } else {
        setJobs(initialITJobs);
      }
    } catch (_) {
      setJobs(initialITJobs);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault();
    const skills = skillsStr.split(",").map((s: string) => s.trim()).filter(Boolean);
    const newJob = {
      title,
      company_name: company,
      category_display: role,
      location,
      work_mode: workMode,
      experience_level: experience,
      salary_range: salary,
      skills_required: skills,
      apply_url: applyUrl || "https://careers.google.com"
    };

    try {
      const res = await fetch("/api/it-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob)
      });
      const data = await res.json();
      if (data.job) {
        setJobs((prev) => [data.job, ...prev]);
      }
      setSuccessMsg("Job vacancy successfully published to IT & Tech Jobs directory!");
      setIsAddModalOpen(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      alert("Failed to create job posting.");
    }
  }

  const filteredJobs = jobs.filter((j: any) => {
    const jobTitle = j.title || "";
    const jobCompany = j.company_name || j.company || "";
    const jobSkills = j.skills_required || j.skills || [];
    const jobRole = j.category_display || j.role || "";

    const matchesSearch =
      jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      jobCompany.toLowerCase().includes(search.toLowerCase()) ||
      jobSkills.some((s: string) => s.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === "ALL" || jobRole.toLowerCase().includes(roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
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
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                IT & Private Jobs Management CMS
              </h1>
              <p className="text-xs text-slate-400">
                Manage tech recruitment notices, corporate openings, off-campus drives, and internships.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/jobs/it"
              target="_blank"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <span>View Public Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Post New IT Job</span>
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
            <span className="text-[11px] text-slate-400 font-semibold block">Total Active Postings</span>
            <span className="text-2xl font-black text-white mt-1 block">{jobs.length}</span>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-[11px] text-indigo-400 font-semibold block">Remote & Hybrid</span>
            <span className="text-2xl font-black text-indigo-400 mt-1 block">
              {jobs.filter((j: any) => (j.work_mode || j.workMode) !== "ON_SITE").length}
            </span>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-[11px] text-emerald-400 font-semibold block">Fresher & Entry Level</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              {jobs.filter((j: any) => (j.experience_level || j.experience || "").includes("FRESHER") || (j.experience || "").includes("0-")).length}
            </span>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <span className="text-[11px] text-purple-400 font-semibold block">Corporate Partners</span>
            <span className="text-2xl font-black text-purple-400 mt-1 block">15+ MNCs</span>
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
              placeholder="Search by title, company, or skills..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "Software", "Frontend", "Backend", "Data", "AI"].map(
              (r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    roleFilter === r
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              )
            )}
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Role & Company</th>
                  <th className="py-3 px-4">Category / Mode</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Salary Package</th>
                  <th className="py-3 px-4">Skills</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      No matching IT job postings found.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((j: any) => (
                    <tr key={j.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{j.title}</div>
                        <div className="text-indigo-400 font-semibold">{j.company_name || j.company}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-900">
                          {j.category_display || j.role || "Tech"} • {j.work_mode || j.workMode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{j.location}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">{j.salary_range || j.salary}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(j.skills_required || j.skills || []).slice(0, 3).map((s: string) => (
                            <span key={s} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <a
                          href={j.apply_url || j.applyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold inline-flex items-center space-x-1"
                        >
                          <span>Careers Page</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add Job */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-base flex items-center space-x-2">
                  <Laptop className="w-5 h-5 text-indigo-400" />
                  <span>Publish New IT & Tech Job Opening</span>
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddJob} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Job Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Full Stack Engineer (React/Node)"
                    className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Company Name</label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Google India"
                      className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Role Category</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    >
                      <option value="Software Engineer">Software Engineer</option>
                      <option value="Frontend Developer">Frontend Developer</option>
                      <option value="Backend Developer">Backend Developer</option>
                      <option value="Full Stack Developer">Full Stack Developer</option>
                      <option value="Data Analyst">Data Analyst</option>
                      <option value="AI / ML Engineer">AI / ML Engineer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Work Mode</label>
                    <select
                      value={workMode}
                      onChange={(e) => setWorkMode(e.target.value as any)}
                      className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    >
                      <option value="REMOTE">Remote</option>
                      <option value="HYBRID">Hybrid</option>
                      <option value="ON_SITE">On-site</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Experience</label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value as any)}
                      className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    >
                      <option value="FRESHER">Fresher (0-1 yrs)</option>
                      <option value="EXPERIENCED">Experienced</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Salary Range</label>
                    <input
                      type="text"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="e.g. ₹8 - 14 LPA"
                      className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru / Hyderabad / Remote"
                    className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Required Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={skillsStr}
                    onChange={(e) => setSkillsStr(e.target.value)}
                    placeholder="e.g. React, TypeScript, Next.js, PostgreSQL"
                    className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Official Careers / Apply URL</label>
                  <input
                    type="url"
                    required
                    value={applyUrl}
                    onChange={(e) => setApplyUrl(e.target.value)}
                    placeholder="https://company.com/careers/job-123"
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
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg"
                  >
                    Publish IT Job
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
