import React, { useState } from "react";
import { useExams } from "../context/ExamContext";
import { 
  Bell, 
  Search, 
  Check, 
  ExternalLink, 
  Filter, 
  Calendar, 
  AlertCircle,
  ShieldCheck,
  Zap
} from "lucide-react";

export default function Notifications({ onNavigate }) {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, unreadNotifCount } = useExams();

  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = ["ALL", "Hall Tickets", "Results", "Exams", "Important Notices"];

  const filteredNotifs = notifications.filter((notif) => {
    const matchesCat = selectedCategory === "ALL" || notif.category === selectedCategory;
    const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-cyan-500/20 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-cyber">
            Official Announcements & Deadlines
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-cyber">
            Notifications & Gazette Bulletins
          </h1>
        </div>

        {unreadNotifCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="px-4 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center space-x-1.5 self-start md:self-auto"
          >
            <Check className="w-4 h-4 text-cyan-400" />
            <span>Mark All as Read ({unreadNotifCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-cyan-500 text-black shadow-glow-cyan"
                  : "bg-slate-800/60 text-slate-300 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bulletins..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs"
          />
        </div>
      </div>

      {/* Bulletin Feed */}
      <div className="space-y-4">
        {filteredNotifs.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 text-xs">
            No notices match the selected category or filter.
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationAsRead(notif.id);
                if (notif.link) onNavigate(notif.link);
              }}
              className={`glass-panel rounded-3xl p-6 transition-all cursor-pointer relative hover:border-cyan-400/40 ${
                notif.unread
                  ? "border-cyan-500/40 bg-midnight-900/90 shadow-glow-cyan"
                  : "border-slate-800/80 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                    {notif.category}
                  </span>
                  <span className="text-xs text-slate-400">{notif.date}</span>
                </div>
                {notif.priority === "HIGH" && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-red-950 border border-red-500/40 text-red-400">
                    Urgent Notice
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white mb-2 leading-snug">
                {notif.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {notif.content}
              </p>

              {notif.link && (
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1">
                    <span>Open relevant portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                  {notif.unread && (
                    <span className="text-[10px] text-cyan-400 font-semibold">• Click to read</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
