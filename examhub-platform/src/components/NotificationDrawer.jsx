import React from "react";
import { useExams } from "../context/ExamContext";
import { Bell, X, Check, ExternalLink, Calendar, AlertCircle } from "lucide-react";

export default function NotificationDrawer({ isOpen, onClose, onNavigate }) {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, unreadNotifCount } = useExams();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-midnight-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md h-full glass-panel-glow border-l border-cyan-500/30 p-6 flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h3 className="font-cyber font-bold text-lg text-white">Notifications & Notices</h3>
            {unreadNotifCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-black text-[10px] font-black">
                {unreadNotifCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadNotifCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
                title="Mark all notifications as read"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No notifications at this time.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationAsRead(notif.id);
                  if (notif.link) {
                    onNavigate(notif.link);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                  notif.unread
                    ? "bg-midnight-900/90 border-cyan-500/40 shadow-glow-cyan"
                    : "bg-midnight-950/60 border-slate-800/80 opacity-80 hover:opacity-100"
                }`}
              >
                {notif.unread && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                )}
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                    {notif.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{notif.date}</span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1 leading-snug">
                  {notif.title}
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                  {notif.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer Link */}
        <div className="pt-4 border-t border-slate-800 text-center">
          <button
            onClick={() => {
              onNavigate("notifications");
              onClose();
            }}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center justify-center space-x-1.5 w-full py-2 rounded-xl bg-midnight-900 border border-cyan-500/30"
          >
            <span>View All Gazette Announcements</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
