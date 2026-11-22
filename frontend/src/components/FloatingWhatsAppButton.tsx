"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, ExternalLink } from "lucide-react";

export default function FloatingWhatsAppButton() {
  const pathname = usePathname();

  // Hide on dedicated auth views so it doesn't obstruct 3D mascot interaction
  if (pathname === "/auth/login" || pathname === "/student/login" || pathname?.startsWith("/auth/")) {
    return null;
  }

  const channelUrl = "https://whatsapp.com/channel/0029VbA1ZLpJENy3wwL6VC0s";

  return (
    <div className="fixed bottom-6 left-6 z-40 print:hidden">
      <a
        href={channelUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center space-x-2.5 px-3.5 py-2.5 bg-[#25D366] hover:bg-[#20BA56] text-white rounded-full shadow-[0_4px_24px_rgba(37,211,102,0.4)] border border-emerald-300/40 transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Join ExamHub India Official WhatsApp Channel"
      >
        {/* WhatsApp Icon */}
        <div className="relative">
          <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-100" />
          </span>
        </div>

        {/* Text Pill */}
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-black uppercase tracking-wider leading-tight text-white drop-shadow-sm">
            WhatsApp Channel
          </span>
          <span className="text-[9px] font-semibold text-emerald-100/90 leading-tight">
            Live Exam & Admit Alerts
          </span>
        </div>

        {/* External Link Arrow */}
        <ExternalLink className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </a>
    </div>
  );
}
