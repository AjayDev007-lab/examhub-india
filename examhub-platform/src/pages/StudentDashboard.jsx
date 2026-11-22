import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useExams } from "../context/ExamContext";
import HallTicketModal from "../components/HallTicketModal";
import ResultScorecardModal from "../components/ResultScorecardModal";
import { 
  User, 
  FileText, 
  Award, 
  Bell, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  Printer, 
  ExternalLink,
  ShieldCheck,
  Sparkles,
  BookOpen
} from "lucide-react";

export default function StudentDashboard({ onNavigate }) {
  const { currentUser, studentProfile } = useAuth();
  const { exams, getStudentHallTickets, getStudentResults, unreadNotifCount } = useExams();

  const [selectedHT, setSelectedHT] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);

  const studentUid = currentUser?.uid || "std_001";
  const myHallTickets = getStudentHallTickets(studentUid);
  const myResults = getStudentResults(studentUid);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="rounded-3xl glass-panel-glow p-6 sm:p-8 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center space-x-5 text-center md:text-left">
          <div className="relative">
            <img
              src={studentProfile?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email}`}
              alt="Student"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-cyan-400 shadow-glow-cyan"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-midnight-950 flex items-center justify-center text-black" title="Verified Scholar">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold uppercase font-cyber tracking-wider">
                ID: {studentProfile?.studentId || "EH-2026-90412"}
              </span>
              <span className="text-xs text-slate-400">• Verified Candidate</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-cyber tracking-wide">
              Welcome back, <span className="text-cyan-400">{studentProfile?.fullName || "Scholar"}</span>!
            </h1>
            <p className="text-xs text-slate-300">
              {studentProfile?.course || "Degree Candidate"} • {studentProfile?.college || "Academic Center"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate("student-profile")}
            className="px-4 py-2.5 rounded-xl glass-panel hover:bg-slate-800 text-xs font-bold text-white border border-slate-700 transition-all flex items-center space-x-1.5"
          >
            <User className="w-4 h-4 text-cyan-400" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={() => onNavigate("exams")}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black text-xs font-black shadow-glow-cyan transition-all flex items-center space-x-1.5"
          >
            <span>Register New Exam</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        
        <div 
          onClick={() => onNavigate("exams")}
          className="p-5 rounded-2xl glass-panel hover:border-cyan-500/40 cursor-pointer transition-all hover:scale-105"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Available Exams</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white font-cyber">{exams.length}</span>
          <p className="text-[10px] text-cyan-400 font-semibold mt-1">NTA, UPSC, SSC Live</p>
        </div>

        <div 
          onClick={() => onNavigate("hall-tickets")}
          className="p-5 rounded-2xl glass-panel hover:border-cyan-500/40 cursor-pointer transition-all hover:scale-105"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Admit Cards</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white font-cyber">{myHallTickets.length}</span>
          <p className="text-[10px] text-emerald-400 font-semibold mt-1">Verified & Ready to Print</p>
        </div>

        <div 
          onClick={() => onNavigate("results")}
          className="p-5 rounded-2xl glass-panel hover:border-cyan-500/40 cursor-pointer transition-all hover:scale-105"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Results Declared</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white font-cyber">{myResults.length}</span>
          <p className="text-[10px] text-amber-400 font-semibold mt-1">Official Scorecards</p>
        </div>

        <div 
          onClick={() => onNavigate("notifications")}
          className="p-5 rounded-2xl glass-panel hover:border-cyan-500/40 cursor-pointer transition-all hover:scale-105"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Notices & Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white font-cyber">{unreadNotifCount}</span>
          <p className="text-[10px] text-purple-400 font-semibold mt-1">Unread Announcements</p>
        </div>
      </div>

      {/* Grid: Hall Tickets Ready vs Verified Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Hall Tickets Available Section */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h3 className="font-cyber font-bold text-lg text-white">
                My Examination Hall Tickets
              </h3>
            </div>
            <button
              onClick={() => onNavigate("hall-tickets")}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300"
            >
              View All
            </button>
          </div>

          {myHallTickets.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No hall tickets issued yet. Register for an examination to receive your admit card.
            </div>
          ) : (
            <div className="space-y-3">
              {myHallTickets.map((ht) => (
                <div
                  key={ht.id}
                  className="p-4 rounded-2xl bg-midnight-950/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      ROLL: {ht.rollNumber}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{ht.examName}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Date: <span className="text-slate-200">{ht.examDate}</span> • {ht.examTime}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedHT(ht)}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-glow-cyan transition-all flex items-center space-x-1.5 shrink-0"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View & Print</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Exam Results Section */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="font-cyber font-bold text-lg text-white">
                My Official Scorecards
              </h3>
            </div>
            <button
              onClick={() => onNavigate("results")}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300"
            >
              Check Results
            </button>
          </div>

          {myResults.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No results published for your registered examinations yet.
            </div>
          ) : (
            <div className="space-y-3">
              {myResults.map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-2xl bg-midnight-950/70 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                      {res.status} • {res.grade || "DISTINCTION"}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{res.examName}</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Score: <span className="text-cyan-400 font-bold">{res.marksObtained}/{res.maxMarks}</span> ({res.percentage}%) • Rank: {res.rank}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedResult(res)}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Scorecard</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Quick Action Navigation Grid */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8">
        <h3 className="font-cyber font-bold text-base text-white uppercase tracking-wider mb-4">
          Quick Academic Operations
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate("exams")}
            className="p-4 rounded-2xl bg-midnight-950/60 border border-slate-800 hover:border-cyan-500/30 text-left transition-all"
          >
            <BookOpen className="w-5 h-5 text-cyan-400 mb-2" />
            <h4 className="text-xs font-bold text-white">Entrance Exams</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">View test calendars & dates</p>
          </button>

          <button
            onClick={() => onNavigate("hall-tickets")}
            className="p-4 rounded-2xl bg-midnight-950/60 border border-slate-800 hover:border-cyan-500/30 text-left transition-all"
          >
            <FileText className="w-5 h-5 text-emerald-400 mb-2" />
            <h4 className="text-xs font-bold text-white">Admit Cards</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Print exam hall tickets</p>
          </button>

          <button
            onClick={() => onNavigate("results")}
            className="p-4 rounded-2xl bg-midnight-950/60 border border-slate-800 hover:border-cyan-500/30 text-left transition-all"
          >
            <Award className="w-5 h-5 text-amber-400 mb-2" />
            <h4 className="text-xs font-bold text-white">Merit Scorecards</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Marks & Rank verification</p>
          </button>

          <button
            onClick={() => onNavigate("student-profile")}
            className="p-4 rounded-2xl bg-midnight-950/60 border border-slate-800 hover:border-cyan-500/30 text-left transition-all"
          >
            <User className="w-5 h-5 text-blue-400 mb-2" />
            <h4 className="text-xs font-bold text-white">Candidate Profile</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Manage identity and college</p>
          </button>
        </div>
      </div>

      {/* Hall Ticket Modal */}
      {selectedHT && (
        <HallTicketModal
          hallTicket={selectedHT}
          onClose={() => setSelectedHT(null)}
        />
      )}

      {/* Result Scorecard Modal */}
      {selectedResult && (
        <ResultScorecardModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}

    </div>
  );
}
