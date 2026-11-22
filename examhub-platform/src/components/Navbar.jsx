import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useExams } from "../context/ExamContext";
import { 
  ShieldCheck, 
  Bell, 
  User, 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  Award, 
  Menu, 
  X, 
  ExternalLink,
  Lock,
  ChevronDown,
  Sparkles,
  MessageCircle
} from "lucide-react";

export default function Navbar({ onNavigate, currentView, onOpenNotifs }) {
  const { currentUser, studentProfile, role, logout, isDemoMode } = useAuth();
  const { unreadNotifCount } = useExams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "exams", label: "Exams" },
    { id: "hall-tickets", label: "Hall Tickets" },
    { id: "results", label: "Results" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
  ];

  const handleNavClick = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    onNavigate("home");
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-midnight-950/80 border-b border-cyan-500/15">
      {/* Demo Mode Notice Banner if Firebase is running in offline localStore mode */}
      {isDemoMode && (
        <div className="demo-banner bg-gradient-to-r from-blue-900/60 via-cyan-950/60 to-blue-900/60 border-b border-cyan-500/20 py-1 px-4 text-center text-[11px] font-medium text-cyan-300 flex items-center justify-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            EXAMHUB SECURE DEMO ENGINE ACTIVE • Persistent LocalStore Emulating Firebase Auth & Firestore
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Branding */}
          <div 
            onClick={() => handleNavClick("home")}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 p-0.5 shadow-glow-cyan transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-midnight-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <div>
              <span className="font-cyber font-bold text-xl tracking-wider text-white block">
                EXAMHUB <span className="text-cyan-400">INDIA</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase text-slate-400 block font-semibold">
                National Examination Portal
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const active = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    active 
                      ? "text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 shadow-glow-cyan" 
                      : "text-slate-300 hover:text-white hover:bg-slate-800/40"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* WhatsApp Official Channel Link */}
            <a
              href="https://whatsapp.com/channel/0029VbA1ZLpJENy3wwL6VC0s"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all shadow-sm group"
              title="Join ExamHub India Official WhatsApp Channel"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/20 group-hover:scale-110 transition-transform" />
              <span>WhatsApp Channel</span>
            </a>

            {/* Notifications Pill */}
            <button
              onClick={onOpenNotifs}
              className="relative p-2.5 rounded-xl bg-midnight-850 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all"
              title="View announcements & notices"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-black text-[10px] font-black flex items-center justify-center animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Authenticated User / Public Auth CTA */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-3 px-3 py-1.5 rounded-2xl bg-midnight-850/80 border border-cyan-500/30 hover:border-cyan-400 text-white transition-all shadow-glow-card"
                >
                  <img
                    src={studentProfile?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`}
                    alt="User"
                    className="w-8 h-8 rounded-xl object-cover border border-cyan-400"
                  />
                  <div className="text-left pr-1">
                    <span className="text-xs font-bold block max-w-[120px] truncate text-slate-100">
                      {studentProfile?.fullName || currentUser.email}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold block">
                      {role === "admin" ? "Administrator" : "Student"}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel-glow py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-white truncate">{currentUser.email}</p>
                    </div>

                    {role === "admin" ? (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate("admin-dashboard");
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-cyan-300 hover:bg-cyan-950/40 flex items-center space-x-2"
                      >
                        <Lock className="w-4 h-4 text-cyan-400" />
                        <span>Admin Console</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate("student-dashboard");
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-800/50 flex items-center space-x-2"
                        >
                          <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                          <span>Student Dashboard</span>
                        </button>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate("student-profile");
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-800/50 flex items-center space-x-2"
                        >
                          <User className="w-4 h-4 text-blue-400" />
                          <span>My Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate("hall-tickets");
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-800/50 flex items-center space-x-2"
                        >
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <span>My Hall Tickets</span>
                        </button>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate("results");
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-800/50 flex items-center space-x-2"
                        >
                          <Award className="w-4 h-4 text-amber-400" />
                          <span>My Exam Results</span>
                        </button>
                      </>
                    )}

                    <div className="border-t border-slate-800 mt-2 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-950/30 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleNavClick("login")}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-200 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick("register")}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-glow-cyan transition-all"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onOpenNotifs}
              className="relative p-2 rounded-xl bg-midnight-850 border border-slate-800 text-slate-300"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-black text-[9px] font-bold flex items-center justify-center">
                  {unreadNotifCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-midnight-850 border border-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-cyan-500/20 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="block w-full text-left px-4 py-2.5 rounded-xl text-base font-semibold text-slate-200 hover:text-cyan-300 hover:bg-slate-800/60"
            >
              {link.label}
            </button>
          ))}

          <div className="pt-4 border-t border-slate-800 flex flex-col space-y-2">
            {currentUser ? (
              <>
                <div className="px-4 py-2 text-xs text-slate-400">
                  Signed in as: <span className="text-white font-bold">{studentProfile?.fullName || currentUser.email}</span>
                </div>
                {role === "admin" ? (
                  <button
                    onClick={() => handleNavClick("admin-dashboard")}
                    className="w-full text-left px-4 py-2 rounded-xl text-sm font-semibold text-cyan-300 bg-cyan-950/40"
                  >
                    Admin Console
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleNavClick("student-dashboard")}
                      className="w-full text-left px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800"
                    >
                      Student Dashboard
                    </button>
                    <button
                      onClick={() => handleNavClick("student-profile")}
                      className="w-full text-left px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800"
                    >
                      My Profile
                    </button>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-950/40"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleNavClick("login")}
                  className="py-2.5 rounded-xl text-center text-sm font-bold bg-slate-800 text-white"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick("register")}
                  className="py-2.5 rounded-xl text-center text-sm font-bold bg-cyan-400 text-black"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
