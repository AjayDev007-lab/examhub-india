import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ParticlesBackground from "./components/ParticlesBackground";
import NotificationDrawer from "./components/NotificationDrawer";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Exams from "./pages/Exams";
import HallTickets from "./pages/HallTickets";
import Results from "./pages/Results";
import Notifications from "./pages/Notifications";
import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./pages/StudentProfile";
import AdminDashboard from "./pages/AdminDashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

export default function App() {
  const { currentUser, role } = useAuth();
  const [currentView, setCurrentView] = useState("home");
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  // Scroll to top upon view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentView]);

  // Protected route redirects
  const handleNavigate = (view) => {
    if ((view === "student-dashboard" || view === "student-profile") && !currentUser) {
      setCurrentView("login");
      return;
    }
    if (view === "admin-dashboard" && (!currentUser || role !== "admin")) {
      setCurrentView("login");
      return;
    }
    setCurrentView(view);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-midnight-950 text-slate-100 overflow-x-hidden">
      
      {/* Background Interactive Cyber Web Particles Engine */}
      <ParticlesBackground />

      {/* Primary Navigation Bar */}
      <Navbar
        onNavigate={handleNavigate}
        currentView={currentView}
        onOpenNotifs={() => setNotifDrawerOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 relative z-10">
        {currentView === "home" && <Home onNavigate={handleNavigate} />}
        {currentView === "login" && <Login onNavigate={handleNavigate} />}
        {currentView === "register" && <Register onNavigate={handleNavigate} />}
        {currentView === "exams" && <Exams onNavigate={handleNavigate} />}
        {currentView === "hall-tickets" && <HallTickets onNavigate={handleNavigate} />}
        {currentView === "results" && <Results onNavigate={handleNavigate} />}
        {currentView === "notifications" && <Notifications onNavigate={handleNavigate} />}
        {currentView === "student-dashboard" && <StudentDashboard onNavigate={handleNavigate} />}
        {currentView === "student-profile" && <StudentProfile onNavigate={handleNavigate} />}
        {currentView === "admin-dashboard" && <AdminDashboard onNavigate={handleNavigate} />}
        {currentView === "about" && <About onNavigate={handleNavigate} />}
        {currentView === "contact" && <Contact onNavigate={handleNavigate} />}
        {currentView === "privacy" && <Privacy onNavigate={handleNavigate} />}
        {currentView === "terms" && <Terms onNavigate={handleNavigate} />}
      </main>

      {/* Global Slide-Over Notification Drawer */}
      <NotificationDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Standard Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
