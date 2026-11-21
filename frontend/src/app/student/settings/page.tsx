"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, Save, CheckCircle, Bell, 
  GraduationCap, Briefcase, Clock, ShieldCheck
} from "lucide-react";
import StudentNav from "@/components/StudentNav";
import { fetchApi } from "@/lib/api";

export default function StudentSettingsPage() {
  // Career profile
  const [qual, setQual] = useState("GRADUATION");
  const [dept, setDept] = useState("B.E. Computer Science & Engineering");
  const [gradYear, setGradYear] = useState("2025");
  const [skills, setSkills] = useState("Python, SQL, FastApi, Machine Learning");
  const [exp, setExp] = useState("FRESHER");
  const [roles, setRoles] = useState("Software Engineer, Bank PO, Systems Engineer");
  const [locations, setLocations] = useState("Chennai, Bangalore, All India");
  const [sectorPref, setSectorPref] = useState("ALL");

  // Reminders toggles
  const [remind30d, setRemind30d] = useState(true);
  const [remind7d, setRemind7d] = useState(true);
  const [remind1d, setRemind1d] = useState(true);
  const [remindClosing, setRemindClosing] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    try {
      const userStr = localStorage.getItem("examhub_user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || 1;

      const res = await fetchApi(`/api/student/job-preferences?user_id=${userId}`);
      if (res) {
        if (res.qualification) setQual(res.qualification);
        if (res.degree_department) setDept(res.degree_department);
        if (res.graduation_year) setGradYear(res.graduation_year.toString());
        if (res.skills) setSkills(res.skills);
        if (res.experience_level) setExp(res.experience_level);
        if (res.preferred_roles) setRoles(res.preferred_roles);
        if (res.preferred_locations) setLocations(res.preferred_locations);
        if (res.sector_preference) setSectorPref(res.sector_preference);
        if (res.job_alerts_enabled !== undefined) setJobAlerts(res.job_alerts_enabled);
        if (res.email_alerts_enabled !== undefined) setEmailAlerts(res.email_alerts_enabled);
      }
    } catch (err) {
      console.error("Failed to load student preferences:", err);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const userStr = localStorage.getItem("examhub_user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || 1;

      await fetchApi(`/api/student/job-preferences?user_id=${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qualification: qual,
          degree_department: dept.trim(),
          graduation_year: parseInt(gradYear) || 2025,
          skills: skills.trim(),
          experience_level: exp,
          preferred_roles: roles.trim(),
          preferred_locations: locations.trim(),
          sector_preference: sectorPref,
          job_alerts_enabled: jobAlerts,
          email_alerts_enabled: emailAlerts
        })
      });

      setSuccessMsg("Career profile & automated reminder preferences saved successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      alert("Failed to save: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <StudentNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Academic Profile & Reminder Preferences
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Configure your educational background to receive accurate examination reminders and personalized job match notifications.
          </p>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
          {/* Career & Degree Details */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-black text-slate-900">Educational Qualification & Skills</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Highest Qualification</label>
                <select
                  value={qual}
                  onChange={(e) => setQual(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                >
                  <option value="10TH">10th Matriculation</option>
                  <option value="12TH">12th Higher Secondary</option>
                  <option value="DIPLOMA">Diploma in Engineering</option>
                  <option value="GRADUATION">Bachelor's Degree (Graduate)</option>
                  <option value="POST_GRADUATION">Master's Degree (Post Graduate)</option>
                  <option value="PHD">Doctorate / PhD</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Degree & Major Discipline</label>
                <input
                  type="text"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  placeholder="e.g. B.E. Computer Science / B.Sc Physics"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Year of Passing / Graduation</label>
                <input
                  type="number"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Experience Level</label>
                <select
                  value={exp}
                  onChange={(e) => setExp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                >
                  <option value="FRESHER">Fresher (0 years)</option>
                  <option value="0-1">0 - 1 Year</option>
                  <option value="1-3">1 - 3 Years</option>
                  <option value="3-5">3 - 5 Years</option>
                  <option value="5+">5+ Years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Technical Skills & Competencies (comma-separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Python, SQL, FastApi, Machine Learning, Banking"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Roles</label>
                <input
                  type="text"
                  value={roles}
                  onChange={(e) => setRoles(e.target.value)}
                  placeholder="e.g. Software Engineer, Bank PO, Civil Services"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sector Preference</label>
                <select
                  value={sectorPref}
                  onChange={(e) => setSectorPref(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                >
                  <option value="ALL">All Sectors (Government & Private)</option>
                  <option value="GOVERNMENT">Government & PSUs Only</option>
                  <option value="PRIVATE">Private Sector & IT Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Automated Examination Reminders */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-black text-slate-900">Automated Examination Reminder Schedule</h2>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900">30 Days Before Examination</div>
                  <div className="text-[11px] text-slate-500">Early reminder to finalize preparation schedule and exam logistics.</div>
                </div>
                <input
                  type="checkbox"
                  checked={remind30d}
                  onChange={(e) => setRemind30d(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900">7 Days Before Examination</div>
                  <div className="text-[11px] text-slate-500">Reminder to verify venue address and download printed admit card.</div>
                </div>
                <input
                  type="checkbox"
                  checked={remind7d}
                  onChange={(e) => setRemind7d(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900">24 Hours Before Examination</div>
                  <div className="text-[11px] text-slate-500">Urgent reminder to prepare original Photo ID and hall ticket.</div>
                </div>
                <input
                  type="checkbox"
                  checked={remind1d}
                  onChange={(e) => setRemind1d(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <div>
                  <div className="font-bold text-slate-900">Application Deadline Alerts (3 Days & 1 Day Prior)</div>
                  <div className="text-[11px] text-slate-500">Alerts to submit application fee before the server cutoff.</div>
                </div>
                <input
                  type="checkbox"
                  checked={remindClosing}
                  onChange={(e) => setRemindClosing(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Preferences..." : "Save All Preferences"}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
