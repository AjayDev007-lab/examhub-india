import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useExams } from "../context/ExamContext";
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  DollarSign, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  X,
  FileText
} from "lucide-react";

export default function Exams({ onNavigate }) {
  const { currentUser, studentProfile } = useAuth();
  const { exams, registerForExam } = useExams();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Detailed Modal State
  const [activeModalExam, setActiveModalExam] = useState(null);
  const [registrationMsg, setRegistrationMsg] = useState(null);

  const categories = ["ALL", "Medical Entrance", "Engineering Entrance", "Civil Services", "Railways Recruitment", "Central Recruitment"];
  const statuses = ["ALL", "Upcoming", "Registration Open", "Registration Closed", "Completed"];

  // Filtered examinations
  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exam.authority && exam.authority.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCat = selectedCategory === "ALL" || exam.category === selectedCategory;
    const matchesStatus = selectedStatus === "ALL" || exam.status === selectedStatus;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleApply = (exam) => {
    if (!currentUser) {
      onNavigate("login");
      return;
    }

    try {
      const studentData = studentProfile || {
        uid: currentUser.uid,
        studentId: "EH-2026-90412",
        fullName: currentUser.displayName || "Aditya Sharma"
      };

      const result = registerForExam(exam.id, studentData);
      setRegistrationMsg({
        success: true,
        text: `Registration confirmed for ${exam.name}! Hall ticket REG# ${result.registration.registrationNumber} has been automatically generated.`
      });
    } catch (err) {
      setRegistrationMsg({
        success: false,
        text: err.message || "Failed to submit exam registration."
      });
    }
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-cyan-500/20 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-cyber">
            National Testing Catalogs & Deadlines
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-cyber">
            Examination Management
          </h1>
        </div>
        <p className="text-xs text-slate-400 max-w-md">
          Search and apply for all active central, state, university, and autonomous recruitment testing programs.
        </p>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Field */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by exam name (e.g. NEET, JEE, UPSC, SSC)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "ALL" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All Statuses" : s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Registration Notification Toast */}
      {registrationMsg && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between shadow-glow-cyan ${
          registrationMsg.success 
            ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-300" 
            : "bg-red-950/90 border-red-500/40 text-red-300"
        }`}>
          <div className="flex items-center space-x-2">
            {registrationMsg.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span className="font-semibold">{registrationMsg.text}</span>
          </div>
          {registrationMsg.success && (
            <button
              onClick={() => onNavigate("hall-tickets")}
              className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[11px] ml-4 shrink-0"
            >
              View Hall Ticket
            </button>
          )}
        </div>
      )}

      {/* Examinations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-400 text-sm">
            No examinations match the selected search or filter criteria.
          </div>
        ) : (
          filteredExams.map((exam) => {
            const isRegOpen = exam.status === "Registration Open";
            const isUpcoming = exam.status === "Upcoming";

            return (
              <div
                key={exam.id}
                className="glass-panel rounded-3xl p-6 flex flex-col justify-between hover:border-cyan-400/50 transition-all hover:shadow-glow-cyan group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                      {exam.category}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isRegOpen 
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40" 
                        : isUpcoming 
                        ? "bg-blue-950 text-blue-400 border border-blue-500/40"
                        : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}>
                      {exam.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-cyan-300 transition-colors">
                    {exam.name}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                    {exam.instructions || exam.eligibility}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800 pt-3">
                    <div className="flex justify-between">
                      <span>Exam Date:</span>
                      <span className="text-white font-bold">{exam.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deadline:</span>
                      <span className="text-amber-400 font-semibold">{exam.registrationDeadline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Authority:</span>
                      <span className="text-cyan-300 font-semibold">{exam.authority}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center space-x-2">
                  <button
                    onClick={() => setActiveModalExam(exam)}
                    className="flex-1 py-2.5 rounded-xl glass-panel hover:bg-slate-800 text-xs font-bold text-white border border-slate-700 transition-all"
                  >
                    View Details
                  </button>

                  {isRegOpen ? (
                    <button
                      onClick={() => handleApply(exam)}
                      className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black shadow-glow-cyan transition-all"
                    >
                      Register Now
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate("hall-tickets")}
                      className="px-3 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      Hall Ticket
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detailed Examination Modal */}
      {activeModalExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl glass-panel-glow rounded-3xl p-6 sm:p-8 my-8 border border-cyan-500/40 space-y-6">
            
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-950 border border-cyan-500/40 text-cyan-300 mb-1 inline-block">
                  {activeModalExam.category} • {activeModalExam.code}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white font-cyber">
                  {activeModalExam.name}
                </h2>
              </div>
              <button
                onClick={() => setActiveModalExam(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-midnight-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Test Date</span>
                <span className="font-bold text-white text-sm">{activeModalExam.date}</span>
              </div>
              <div className="p-3 rounded-xl bg-midnight-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Registration Cutoff</span>
                <span className="font-bold text-amber-400 text-sm">{activeModalExam.registrationDeadline}</span>
              </div>
              <div className="p-3 rounded-xl bg-midnight-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Duration</span>
                <span className="font-bold text-cyan-300 text-sm">{activeModalExam.duration}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-midnight-950/60 border border-slate-800">
                <span className="text-[10px] text-cyan-400 uppercase font-bold block mb-1">Eligibility Criteria</span>
                <p className="text-slate-200">{activeModalExam.eligibility}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-midnight-950/60 border border-slate-800">
                <span className="text-[10px] text-cyan-400 uppercase font-bold block mb-1">Official Instructions</span>
                <p className="text-slate-200">{activeModalExam.instructions}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
              <button
                onClick={() => setActiveModalExam(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleApply(activeModalExam);
                  setActiveModalExam(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black shadow-glow-cyan"
              >
                Apply & Generate Hall Ticket
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
