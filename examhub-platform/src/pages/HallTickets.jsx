import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useExams } from "../context/ExamContext";
import HallTicketModal from "../components/HallTicketModal";
import { 
  FileText, 
  Printer, 
  Download, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck
} from "lucide-react";

export default function HallTickets({ onNavigate }) {
  const { currentUser } = useAuth();
  const { hallTickets } = useExams();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHT, setSelectedHT] = useState(null);

  const studentUid = currentUser?.uid || "std_001";
  
  // Filter tickets matching user or search
  const visibleTickets = hallTickets.filter((ht) => {
    const isOwner = !currentUser || ht.studentUid === studentUid || ht.studentId === studentUid;
    const matchesSearch = ht.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ht.rollNumber.includes(searchTerm) ||
      ht.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return isOwner && matchesSearch;
  });

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-cyan-500/20 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-cyber">
            Computer-Verified Admit Cards & Identification
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-cyber">
            Hall Ticket Issuance Portal
          </h1>
        </div>
        <p className="text-xs text-slate-400 max-w-md">
          Download, verify and print authentic high-resolution examination hall tickets with encoded candidate QR and security watermarks.
        </p>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex items-center space-x-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by exam name, roll number, or application ID..."
          className="w-full bg-transparent border-none text-white text-xs focus:outline-none"
        />
      </div>

      {/* Hall Ticket Cards */}
      <div className="space-y-4">
        {visibleTickets.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-3">
            <FileText className="w-10 h-10 text-cyan-400 mx-auto opacity-60" />
            <h3 className="text-base font-bold text-white">No Hall Tickets Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You do not have any active hall tickets matching this search. If you haven't applied yet, register for an upcoming examination to automatically generate your admit card.
            </p>
            <button
              onClick={() => onNavigate("exams")}
              className="mt-2 px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold"
            >
              Browse National Exams
            </button>
          </div>
        ) : (
          visibleTickets.map((ht) => (
            <div
              key={ht.id}
              className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-cyan-400/40 transition-all hover:shadow-glow-cyan"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
                <img
                  src={ht.photoUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256"}
                  alt="Candidate"
                  className="w-16 h-20 rounded-xl object-cover border border-cyan-400 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      ROLL: {ht.rollNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                      REG: {ht.registrationNumber}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified & Active</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white font-cyber tracking-wide">
                    {ht.examName}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-300 pt-1">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{ht.examDate}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{ht.examTime}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 sm:col-span-2 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{ht.centreName} ({ht.centreCode})</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                <button
                  onClick={() => setSelectedHT(ht)}
                  className="flex-1 lg:flex-none px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black shadow-glow-cyan flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>View & Print Admit Card</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Active Modal */}
      {selectedHT && (
        <HallTicketModal
          hallTicket={selectedHT}
          onClose={() => setSelectedHT(null)}
        />
      )}

    </div>
  );
}
