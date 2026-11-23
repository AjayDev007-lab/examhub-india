"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles, CheckCircle2, AlertCircle, XCircle, ArrowRight,
  Compass, Clock, ShieldCheck, Briefcase, GraduationCap,
  BookOpen, ExternalLink, Calendar, Search, Award
} from "lucide-react";
import { evaluateJobEligibility, initialITJobs } from "@/lib/platformData";
import { initialJobs } from "@/lib/data";

export default function AICareerToolsPage() {
  const [activeTool, setActiveTool] = useState<"ELIGIBILITY" | "CAREER_PATH" | "DEADLINE">("ELIGIBILITY");

  // Tool 1: Eligibility Checker State
  const [userEducation, setUserEducation] = useState("B.E. Computer Science and Engineering");
  const [userAge, setUserAge] = useState(24);
  const [userSkills, setUserSkills] = useState("Python, SQL, React.js, Web Development");
  const [selectedJobId, setSelectedJobId] = useState<string>("upsc-cse");
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);

  // Tool 2: Career Path Finder State
  const [careerDegree, setCareerDegree] = useState("12th Pass / Undergraduate");
  const [careerInterest, setCareerInterest] = useState("SOFTWARE");
  const [careerRoadmap, setCareerRoadmap] = useState<any>(null);

  function handleCheckEligibility(e: React.FormEvent) {
    e.preventDefault();
    const skillsArr = userSkills.split(",").map(s => s.trim()).filter(Boolean);

    let jobTarget: any;
    if (selectedJobId === "upsc-cse") {
      jobTarget = {
        title: "UPSC Civil Services Examination 2026",
        qualification: "Any Graduate (Bachelor's Degree in any discipline)",
        age_limit: "21 - 32 Years",
        required_skills: "General Studies, Essay Writing, Current Affairs"
      };
    } else if (selectedJobId === "ssc-cgl") {
      jobTarget = {
        title: "SSC Combined Graduate Level 2026",
        qualification: "Bachelor's Degree from a recognized University",
        age_limit: "18 - 30 Years",
        required_skills: "Quantitative Aptitude, English, Reasoning"
      };
    } else if (selectedJobId === "rrb-alp") {
      jobTarget = {
        title: "RRB Assistant Loco Pilot & Technician",
        qualification: "10th + ITI or Diploma in Engineering",
        age_limit: "18 - 33 Years",
        required_skills: "Technical Trade, Physics, Math"
      };
    } else {
      jobTarget = {
        title: "Zoho Full Stack Developer 2026",
        qualification: "B.E. / B.Tech / BCA / B.Sc / MCA / Any Graduate",
        age_limit: "18 - 28 Years",
        required_skills: "JavaScript, TypeScript, React.js, Node.js, SQL"
      };
    }

    const evalRes = evaluateJobEligibility(
      { education: userEducation, age: userAge, skills: skillsArr },
      jobTarget
    );
    setEligibilityResult({ ...evalRes, jobTitle: jobTarget.title });
  }

  function handleGenerateCareerPath(e: React.FormEvent) {
    e.preventDefault();

    const roadmaps: Record<string, any> = {
      SOFTWARE: {
        title: "Full Stack & Cloud Software Engineering",
        timeline: "6 - 12 Months to First Role",
        avgSalary: "₹6,00,000 - ₹14,00,000 P.A.",
        milestones: [
          { phase: "Month 1-3", focus: "Programming Foundations: JavaScript, TypeScript, Data Structures, Git." },
          { phase: "Month 4-6", focus: "Frontend & Backend: React.js, Next.js, Node.js, PostgreSQL/MongoDB, REST APIs." },
          { phase: "Month 7-9", focus: "Cloud & DevOps: Docker, AWS deployment, CI/CD pipelines, portfolio projects." },
          { phase: "Month 10-12", focus: "Interview Prep: LeetCode medium algorithms, system design, mock interviews." }
        ],
        targetExamsOrDrives: ["TCS NQT", "Zoho Off-Campus", "Infosys InfyTQ", "Cognizant GenC", "Product Startups"],
        recommendedCertifications: ["AWS Certified Cloud Practitioner", "Meta Front-End Developer"]
      },
      GOVT_CIVIL: {
        title: "Central & State Administrative Civil Services",
        timeline: "12 - 24 Months Dedicated Preparation",
        avgSalary: "Pay Level 10 (₹56,100 initial base) + DA + Government Housing",
        milestones: [
          { phase: "Month 1-4", focus: "NCERT Mastery: History, Geography, Polity, Economy (Classes 6-12)." },
          { phase: "Month 5-8", focus: "Core Reference Texts: Laxmikanth Polity, Ramesh Singh Economy, Spectrum History." },
          { phase: "Month 9-12", focus: "Answer Writing & CSAT: Daily answer evaluation, current affairs magazine." },
          { phase: "Month 13+", focus: "Prelims & Mains Test Series: 40+ mock exams, time management." }
        ],
        targetExamsOrDrives: ["UPSC CSE (IAS/IPS/IFS)", "TNPSC Group 1 & 2", "SSC CGL (ASO/Inspectors)"],
        recommendedCertifications: ["Bachelor's Degree in any discipline"]
      },
      DATA_AI: {
        title: "Data Science & Artificial Intelligence Engineer",
        timeline: "8 - 14 Months Intensive Path",
        avgSalary: "₹8,00,000 - ₹18,00,000 P.A.",
        milestones: [
          { phase: "Month 1-3", focus: "Mathematics & Python: Linear Algebra, Statistics, NumPy, Pandas." },
          { phase: "Month 4-6", focus: "Machine Learning: Scikit-Learn, Regression, Classification, Model Evaluation." },
          { phase: "Month 7-10", focus: "Deep Learning & Generative AI: PyTorch, HuggingFace transformers, LangChain, RAG." },
          { phase: "Month 11+", focus: "Deployment: FastAPI inference servers, Vector Databases (Pinecone/Chroma), Kaggle competitions." }
        ],
        targetExamsOrDrives: ["Freshworks AI Roles", "Tiger Analytics", "Mu Sigma", "Fractal Analytics", "Tech Unicorns"],
        recommendedCertifications: ["DeepLearning.AI TensorFlow / PyTorch Specialization"]
      }
    };

    setCareerRoadmap(roadmaps[careerInterest] || roadmaps.SOFTWARE);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* 1. HERO HEADER */}
      <section className="bg-gradient-to-b from-[#081629] via-[#0f2746] to-[#081629] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-5xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Intelligent Career Navigation • 100% Free for Students</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            AI-Powered Career & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-300">
              Job Eligibility Tools
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Verify official recruitment qualifications instantly, map custom career roadmaps, and monitor critical exam application deadlines.
          </p>

          {/* Tool Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { id: "ELIGIBILITY", label: "AI Job Eligibility Checker", icon: ShieldCheck },
              { id: "CAREER_PATH", label: "Career Path Finder", icon: Compass },
              { id: "DEADLINE", label: "Deadline Rescue Tracker", icon: Clock }
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTool === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTool(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4 text-sky-400" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. MAIN TOOL CONTAINER */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* TOOL 1: ELIGIBILITY CHECKER */}
        {activeTool === "ELIGIBILITY" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>AI Job Eligibility Checker</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your education, age, and skill set to evaluate your match with official recruitment notifications.
              </p>
            </div>

            <form onSubmit={handleCheckEligibility} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Your Educational Degree</label>
                <input
                  type="text"
                  value={userEducation}
                  onChange={e => setUserEducation(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  placeholder="e.g. B.E. CSE / B.Com / Any Graduate"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Your Current Age (Years)</label>
                <input
                  type="number"
                  value={userAge}
                  onChange={e => setUserAge(parseInt(e.target.value) || 20)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  min="16"
                  max="55"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Select Target Recruitment Notification</label>
                <select
                  value={selectedJobId}
                  onChange={e => setSelectedJobId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none font-medium"
                >
                  <option value="upsc-cse">UPSC Civil Services Examination (IAS / IPS / IFS 2026)</option>
                  <option value="ssc-cgl">SSC Combined Graduate Level (CGL Assistant Section Officer 2026)</option>
                  <option value="rrb-alp">Railway RRB Assistant Loco Pilot & Technician 2026</option>
                  <option value="zoho-dev">Zoho Corporation Full Stack Developer 2026</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Your Skills & Strengths (comma-separated)</label>
                <input
                  type="text"
                  value={userSkills}
                  onChange={e => setUserSkills(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  placeholder="e.g. Reasoning, Quantitative Aptitude, Python, React, English"
                />
              </div>

              <button
                type="submit"
                className="md:col-span-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all mt-2"
              >
                Evaluate Eligibility with AI
              </button>
            </form>

            {/* Results Area */}
            {eligibilityResult && (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Evaluation Target</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{eligibilityResult.jobTitle}</h3>
                  </div>

                  <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    eligibilityResult.status === "LIKELY_ELIGIBLE"
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                      : eligibilityResult.status === "NEEDS_VERIFICATION"
                      ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                      : "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700"
                  }`}>
                    {eligibilityResult.status.replace(/_/g, " ")} ({eligibilityResult.matchPercentage}% Match)
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {eligibilityResult.reason}
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-slate-500 text-[10px]">Degree Qualification Match</span>
                    <div className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-white">
                      {eligibilityResult.details.qualificationMatch ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Satisfies Education Criteria</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span>Check Specific Degree Rules</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-slate-500 text-[10px]">Prescribed Age Limit</span>
                    <div className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-white">
                      {eligibilityResult.details.ageMatch ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Within Prescribed Age</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          <span>Check Category Relaxations</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-slate-500 font-bold block">Important Recommendations:</span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                    {eligibilityResult.recommendations.map((rec: string, rIdx: number) => (
                      <li key={rIdx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TOOL 2: CAREER PATH FINDER */}
        {activeTool === "CAREER_PATH" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                <span>Career Path Finder & Step-by-Step Roadmap</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select your education level and primary area of interest to discover step-by-step career milestones, key exams, and expected salary brackets.
              </p>
            </div>

            <form onSubmit={handleGenerateCareerPath} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Current Educational Stage</label>
                <select
                  value={careerDegree}
                  onChange={e => setCareerDegree(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none font-medium"
                >
                  <option value="12th">Class 12th Pass (Science / Commerce / Arts)</option>
                  <option value="Undergraduate">College Undergraduate (B.E. / B.Tech / B.Sc / B.Com)</option>
                  <option value="Graduate">Recent Graduate / Fresher Seeking Employment</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Target Career Domain</label>
                <select
                  value={careerInterest}
                  onChange={e => setCareerInterest(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none font-medium"
                >
                  <option value="SOFTWARE">Software & Cloud Engineering</option>
                  <option value="DATA_AI">Data Science & Artificial Intelligence</option>
                  <option value="GOVT_CIVIL">Central & State Civil Services (UPSC / TNPSC)</option>
                </select>
              </div>

              <button
                type="submit"
                className="md:col-span-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all mt-2"
              >
                Generate Custom Career Roadmap
              </button>
            </form>

            {careerRoadmap && (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-5 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-3 gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{careerRoadmap.title}</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{careerRoadmap.timeline}</p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-700">
                    Avg: {careerRoadmap.avgSalary}
                  </span>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Structured Roadmap Milestones
                  </h4>
                  <div className="space-y-2">
                    {careerRoadmap.milestones.map((ms: any, mIdx: number) => (
                      <div key={mIdx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs">
                        <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold font-mono shrink-0">
                          {ms.phase}
                        </span>
                        <p className="text-slate-700 dark:text-slate-300">{ms.focus}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold">Recommended Exams / Drives: </span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{careerRoadmap.targetExamsOrDrives.join(", ")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TOOL 3: DEADLINE RESCUE */}
        {activeTool === "DEADLINE" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span>Deadline Rescue & Reminders</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Active examination and job application deadlines monitored 24/7 by ExamHub India AI Guardian.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { name: "SSC Combined Graduate Level (CGL) 2026", authority: "Staff Selection Commission", date: "28 Dec 2026", status: "OPEN", daysLeft: 34, href: "/jobs" },
                { name: "Department of Posts Gramin Dak Sevak (GDS)", authority: "India Post", date: "22 Dec 2026", status: "OPEN", daysLeft: 28, href: "/jobs" },
                { name: "Zoho Corporation Junior Software Developer", authority: "Zoho Careers", date: "31 Dec 2026", status: "OPEN", daysLeft: 37, href: "/jobs/it" },
                { name: "Anna University Nov/Dec Semester Exam Registration", authority: "Office of the Controller of Examinations", date: "15 Dec 2026", status: "OPEN", daysLeft: 21, href: "/university" }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">{item.authority}</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h4>
                    <p className="text-[11px] text-slate-500">Last Date to Apply: <strong className="text-slate-700 dark:text-slate-300">{item.date}</strong></p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono font-bold text-xs">
                      {item.daysLeft} Days Left
                    </span>

                    <Link
                      href={item.href}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
