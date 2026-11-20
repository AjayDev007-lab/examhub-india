"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Award, FileText, CreditCard, Search, User, LogIn, Menu, X, 
  ShieldCheck, LayoutDashboard, Bell, LogOut, ExternalLink, BookOpen
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("examhub_user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (_) {}
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("examhub_token");
    localStorage.removeItem("examhub_user");
    setCurrentUser(null);
    window.location.href = "/";
  };

  const navLinks = [
    { name: "Check Results", href: "/results", icon: Award },
    { name: "Hall Tickets", href: "/hall-tickets", icon: FileText },
    { name: "Student ID Cards", href: "/id-cards", icon: CreditCard },
    { name: "Exam Directory", href: "/directory", icon: BookOpen },
  ];

  const isAdminPage = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top National Announcement Bar */}
      <div className="bg-primary-950 text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-100">Official National Portal:</span>
            <span className="hidden sm:inline text-slate-300">Centralized All-India Examination Results, Admit Cards & Academic Identity</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/directory" className="hover:text-white transition-colors">
              Directory (28 States & 8 UTs)
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/admin/login" className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Branding */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-primary-950">
                EXAMHUB<span className="text-blue-600"> INDIA</span>
              </span>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold -mt-1">
                All Examination Documents in One Place
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-blue-700 bg-blue-50/80 font-semibold"
                      : "text-slate-700 hover:text-primary-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Auth Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-primary-700" />
                  <span>{currentUser.full_name?.split(" ")[0] || "Dashboard"}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-primary-950 transition-colors"
                >
                  Student Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-900 hover:bg-primary-800 rounded-lg shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-5 h-5 text-slate-400" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            {currentUser ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium justify-center"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Student Dashboard ({currentUser.full_name})</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-red-600 font-medium text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 bg-primary-900 text-white rounded-lg text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center space-x-1.5 py-2 text-xs text-slate-500 font-medium"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Separate Admin Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
