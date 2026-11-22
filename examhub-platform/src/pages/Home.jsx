import React, { useState } from "react";
import SpiderMascot3D from "../components/SpiderMascot3D";
import { useExams } from "../context/ExamContext";
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Award, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Zap, 
  Globe, 
  BookOpen, 
  Search,
  Bell
} from "lucide-react";

export default function Home({ onNavigate }) {
  const { exams, notifications } = useExams();
  const [activeFaq, setActiveFaq] = useState(0);

  const stats = [
    { label: "Active Aspirants", value: "2.4 Cr+", sub: "Across 28 States & 8 UTs", icon: Users },
    { label: "Partner Boards", value: "128+", sub: "NTA, UPSC, SSC, RRB & State", icon: Globe },
    { label: "Hall Tickets Issued", value: "1.2 M+", sub: "With Encrypted Barcodes", icon: FileText },
    { label: "Result Accuracy", value: "99.98%", sub: "Computerized Direct Feed", icon: ShieldCheck }
  ];

  const benefits = [
    {
      title: "Direct Government Synchronization",
      desc: "Real-time updates directly connected with national testing agencies and official government gazettes.",
      icon: Globe,
      color: "from-blue-600 to-cyan-500"
    },
    {
      title: "Instant Encrypted Hall Tickets",
      desc: "Download and print tamper-evident examination admit cards with official QR and candidate photo.",
      icon: FileText,
      color: "from-cyan-500 to-emerald-500"
    },
    {
      title: "Verified Merit Scorecards",
      desc: "Access computerized results with subject-wise marks breakdown, percentile, and All India Rank.",
      icon: Award,
      color: "from-amber-500 to-rose-500"
    },
    {
      title: "Autonomous Student Alerts",
      desc: "Instant notifications for deadline extensions, exam dates, syllabus updates, and result declarations.",
      icon: Zap,
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const faqs = [
    {
      q: "What is ExamHub India?",
      a: "ExamHub India is India's premier unified examination management and student academic accreditation portal. It centralizes schedules, verified admit card generation, and merit scorecard access for all central, state, university, and competitive examinations."
    },
    {
      q: "How do I download my official Hall Ticket?",
      a: "Once registered, navigate to the 'Hall Tickets' tab or your Student Dashboard. Click 'View Hall Ticket' on your registered examination, and you can instantly preview, print, or download the high-resolution admit card."
    },
    {
      q: "Are the published results officially verified?",
      a: "Yes. All results published on ExamHub India are cryptographically verified and matched against official test authority gazettes (NTA, UPSC, SSC, CBSE). Each scorecard carries an authentic verification hash."
    },
    {
      q: "How does the Student Dashboard work?",
      a: "The Student Dashboard gives you a personalized command center. You can view upcoming exams, download admit cards, check results, manage your profile, and receive real-time alerts."
    },
    {
      q: "Can administrators manage examinations and publish results?",
      a: "Yes. ExamHub India features a dedicated, role-protected Administrator Console allowing verified officials to schedule exams, monitor student registrations, enter marks, and broadcast announcements."
    }
  ];

  return (
    <div className="relative min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden spider-grid-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-glow-cyan">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>NEXT-GEN INDIAN EXAMINATION INFRASTRUCTURE 2026</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] font-cyber">
                Your Future <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 drop-shadow-md">
                  Starts Here.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                ExamHub India is the unified national gateway for competitive entrance examinations, instant official hall ticket downloads, and verified academic result scorecards for over 2.4 crore Indian scholars.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => onNavigate("register")}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-blue-400 text-black font-black text-base shadow-glow-cyan flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onNavigate("exams")}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel hover:bg-slate-800/80 text-white font-bold text-base border border-slate-700/80 flex items-center justify-center space-x-2 transition-all"
                >
                  <Search className="w-5 h-5 text-cyan-400" />
                  <span>Explore All Examinations</span>
                </button>
              </div>

              {/* Security accreditation highlights */}
              <div className="pt-4 flex items-center justify-center lg:justify-start space-x-6 text-xs text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>256-Bit Encrypted Portal</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>NTA & UPSC Synchronized</span>
                </div>
              </div>
            </div>

            {/* Right Mascot Hero 3D Interactive Canvas */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative">
                <SpiderMascot3D size={360} interactive={true} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section className="py-12 bg-midnight-900/60 border-y border-cyan-500/15 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl glass-panel text-center space-y-1.5 transition-transform hover:scale-105">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 mb-2">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white font-cyber">{s.value}</h3>
                  <p className="text-xs font-bold text-cyan-300 uppercase tracking-wider">{s.label}</p>
                  <p className="text-[10px] text-slate-400">{s.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* POPULAR EXAMINATIONS SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-cyber block mb-1">
              Active National Testing Calendars
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-cyber">
              Popular Examinations 2026
            </h2>
          </div>
          <button
            onClick={() => onNavigate("exams")}
            className="mt-4 md:mt-0 text-xs font-bold text-cyan-300 hover:text-cyan-200 flex items-center space-x-1"
          >
            <span>View All National Examinations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {exams.slice(0, 3).map((exam) => (
            <div
              key={exam.id}
              className="glass-panel rounded-3xl p-6 flex flex-col justify-between hover:border-cyan-400/50 transition-all hover:shadow-glow-cyan"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                    {exam.category}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                    exam.status === "Registration Open" 
                      ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40" 
                      : "bg-blue-950/80 text-blue-400 border border-blue-500/40"
                  }`}>
                    {exam.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                  {exam.name}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 mb-4">
                  {exam.instructions || exam.eligibility}
                </p>

                <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800 pt-3">
                  <div className="flex justify-between">
                    <span>Exam Date:</span>
                    <span className="text-white font-bold">{exam.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Authority:</span>
                    <span className="text-cyan-300 font-semibold">{exam.authority}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center space-x-2">
                <button
                  onClick={() => onNavigate("exams")}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all shadow-glow-cyan"
                >
                  View Details & Apply
                </button>
                <button
                  onClick={() => onNavigate("hall-tickets")}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  title="Check Hall Ticket"
                >
                  Admit Card
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STUDENT BENEFITS SECTION */}
      <section className="py-20 bg-midnight-900/40 border-t border-cyan-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-cyber block mb-1">
              Engineered For Academic Distinction
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-cyber">
              Why 24 Million Scholars Choose ExamHub
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div key={idx} className="glass-panel p-6 rounded-3xl space-y-3 hover:border-cyan-400/40 transition-all">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${b.color} p-0.5 shadow-md`}>
                    <div className="w-full h-full bg-midnight-950 rounded-[14px] flex items-center justify-center text-white">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug">{b.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-cyber block mb-1">
            Questions & Redressal
          </span>
          <h2 className="text-3xl font-black text-white font-cyber">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl overflow-hidden border border-slate-800 transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? -1 : idx)}
                className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-white text-sm hover:text-cyan-300"
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-cyan-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl glass-panel-glow p-8 md:p-12 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white font-cyber">
              Ready to Access Your 2026 Examination Portal?
            </h2>
            <p className="text-sm text-slate-300">
              Create your official student account in under 60 seconds and sync your entrance test records instantly.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onNavigate("register")}
                className="px-8 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-sm shadow-glow-cyan"
              >
                Register Student Account
              </button>
              <button
                onClick={() => onNavigate("login")}
                className="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
              >
                Sign In to Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
