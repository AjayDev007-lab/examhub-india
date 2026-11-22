import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useExams } from "../context/ExamContext";
import { localStore } from "../firebase/config";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Award, 
  Bell, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Eye, 
  LogOut,
  FileText,
  DollarSign,
  Calendar,
  Globe
} from "lucide-react";

export default function AdminDashboard({ onNavigate }) {
  const { currentUser, role, logout } = useAuth();
  const { 
    exams, 
    addExam, 
    updateExam, 
    deleteExam, 
    results, 
    addOrUpdateResult, 
    publishResult, 
    notifications, 
    addNotification, 
    deleteNotification 
  } = useExams();

  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, students, exams, results, notifications

  // Data collections from localStore
  const [studentsList, setStudentsList] = useState(() => localStore.getStudents());
  const [studentSearch, setStudentSearch] = useState("");

  // Student Add / Edit Modal State
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentFormName, setStudentFormName] = useState("");
  const [studentFormEmail, setStudentFormEmail] = useState("");
  const [studentFormPhone, setStudentFormPhone] = useState("");
  const [studentFormCourse, setStudentFormCourse] = useState("");
  const [studentFormCollege, setStudentFormCollege] = useState("");

  // Exam Add / Edit Modal State
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examFormName, setExamFormName] = useState("");
  const [examFormCategory, setExamFormCategory] = useState("Medical Entrance");
  const [examFormDate, setExamFormDate] = useState("2026-06-15");
  const [examFormDeadline, setExamFormDeadline] = useState("2026-05-01");
  const [examFormDuration, setExamFormDuration] = useState("180 Minutes");
  const [examFormAuthority, setExamFormAuthority] = useState("National Testing Agency");
  const [examFormStatus, setExamFormStatus] = useState("Upcoming");
  const [examFormEligibility, setExamFormEligibility] = useState("10+2 with minimum 50% aggregate");

  // Result Add / Edit Modal State
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [resultExamId, setResultExamId] = useState(exams[0]?.id || "exam_01");
  const [resultStudentRoll, setResultStudentRoll] = useState("2604108821");
  const [resultStudentName, setResultStudentName] = useState("ADITYA SHARMA");
  const [resultMarksObtained, setResultMarksObtained] = useState(175);
  const [resultMaxMarks, setResultMaxMarks] = useState(200);
  const [resultStatus, setResultStatus] = useState("PASS");
  const [resultIsPublished, setResultIsPublished] = useState(true);

  // Notification Add State
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifCategory, setNotifCategory] = useState("Exams");
  const [notifContent, setNotifContent] = useState("");
  const [notifPriority, setNotifPriority] = useState("NORMAL");

  // Status message
  const [actionMsg, setActionMsg] = useState(null);

  // Enforce Admin RBAC Guard
  if (role !== "admin") {
    return (
      <div className="py-20 text-center space-y-4">
        <Lock className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-2xl font-black text-white font-cyber">
          Administrative Privileges Required
        </h2>
        <p className="text-xs text-slate-400">
          Student accounts cannot access the administrative command console.
        </p>
        <button
          onClick={() => onNavigate("login")}
          className="px-6 py-2.5 rounded-xl bg-cyan-400 text-black font-bold text-xs"
        >
          Sign In with Administrator Credentials
        </button>
      </div>
    );
  }

  // Statistics
  const totalStudents = studentsList.length;
  const activeStudents = studentsList.filter(s => s.isActive).length;
  const totalExams = exams.length;
  const upcomingExams = exams.filter(e => e.status === "Upcoming" || e.status === "Registration Open").length;
  const publishedResultsCount = results.filter(r => r.isPublished).length;

  // Student operations
  const handleToggleStudentStatus = (uid) => {
    const updated = studentsList.map(s => {
      if (s.uid === uid) {
        return { ...s, isActive: !s.isActive };
      }
      return s;
    });
    setStudentsList(updated);
    localStore.saveStudents(updated);
    setActionMsg("Student active status toggled successfully.");
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (editingStudent) {
      const updated = studentsList.map(s => s.uid === editingStudent.uid ? {
        ...s,
        fullName: studentFormName,
        email: studentFormEmail,
        phone: studentFormPhone,
        course: studentFormCourse,
        college: studentFormCollege
      } : s);
      setStudentsList(updated);
      localStore.saveStudents(updated);
      setActionMsg("Student profile updated.");
    } else {
      const newS = {
        uid: `std_${Date.now()}`,
        studentId: `EH-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        fullName: studentFormName,
        email: studentFormEmail,
        phone: studentFormPhone,
        course: studentFormCourse,
        college: studentFormCollege,
        role: "student",
        isActive: true,
        createdAt: new Date().toISOString()
      };
      const updated = [newS, ...studentsList];
      setStudentsList(updated);
      localStore.saveStudents(updated);
      setActionMsg("New student account created.");
    }
    setIsStudentModalOpen(false);
    setEditingStudent(null);
  };

  // Exam operations
  const handleSaveExam = (e) => {
    e.preventDefault();
    addExam({
      name: examFormName,
      code: `EXAM-${Math.floor(1000 + Math.random() * 9000)}`,
      category: examFormCategory,
      date: examFormDate,
      registrationDeadline: examFormDeadline,
      duration: examFormDuration,
      authority: examFormAuthority,
      status: examFormStatus,
      eligibility: examFormEligibility,
      fee: "INR 1,200",
      instructions: "Admit card mandatory with government photo ID."
    });
    setIsExamModalOpen(false);
    setActionMsg("New examination created and published to testing catalog.");
  };

  // Results marks calculation & publish
  const handleSaveResult = (e) => {
    e.preventDefault();
    const obtained = parseFloat(resultMarksObtained) || 0;
    const max = parseFloat(resultMaxMarks) || 100;
    const percentage = Number(((obtained / max) * 100).toFixed(2));
    
    let grade = "PASS";
    if (percentage >= 85) grade = "DISTINCTION";
    else if (percentage >= 70) grade = "FIRST CLASS";
    else if (percentage >= 50) grade = "SECOND CLASS";
    else grade = "NEEDS IMPROVEMENT";

    const selectedExam = exams.find(e => e.id === resultExamId) || exams[0];

    addOrUpdateResult({
      examId: selectedExam.id,
      examName: selectedExam.name,
      studentId: "std_001",
      studentUid: "std_001",
      studentName: resultStudentName.toUpperCase(),
      rollNumber: resultStudentRoll,
      registrationNumber: `RID-${resultStudentRoll}`,
      marksObtained: obtained,
      maxMarks: max,
      percentage: percentage,
      grade: grade,
      status: percentage >= 40 ? "PASS" : "FAIL",
      rank: `AIR ${Math.floor(10 + Math.random() * 900)}`,
      percentile: `${(percentage + 3.2).toFixed(2)} Percentile`,
      publishedDate: new Date().toISOString().split("T")[0],
      isPublished: resultIsPublished
    });

    setIsResultModalOpen(false);
    setActionMsg("Exam result and marks evaluated successfully.");
  };

  // Notification broadcast
  const handleBroadcastNotif = (e) => {
    e.preventDefault();
    addNotification({
      title: notifTitle,
      category: notifCategory,
      content: notifContent,
      priority: notifPriority,
      link: "exams"
    });
    setIsNotifModalOpen(false);
    setActionMsg("Official gazette bulletin broadcast to all scholars.");
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Admin Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-cyan-500/20 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500 text-black flex items-center justify-center font-bold shadow-glow-cyan">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 font-cyber">
              PROTECTED ADMINISTRATIVE CONSOLE
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-cyber">
              ExamHub India Administration
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-300 font-medium">
            SuperAdmin: <strong className="text-cyan-400 font-mono">ajaydevvs22102004@gmail.com</strong>
          </span>
          <button
            onClick={() => {
              logout();
              onNavigate("home");
            }}
            className="px-3.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-bold flex items-center space-x-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMsg && (
        <div className="p-3.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs flex items-center justify-between shadow-glow-cyan">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-cyan-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="glass-panel p-2 rounded-2xl flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === "dashboard" ? "bg-cyan-500 text-black shadow-glow-cyan" : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === "students" ? "bg-cyan-500 text-black shadow-glow-cyan" : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Students ({totalStudents})</span>
        </button>

        <button
          onClick={() => setActiveTab("exams")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === "exams" ? "bg-cyan-500 text-black shadow-glow-cyan" : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Examinations ({totalExams})</span>
        </button>

        <button
          onClick={() => setActiveTab("results")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === "results" ? "bg-cyan-500 text-black shadow-glow-cyan" : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Results & Marks</span>
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === "notifications" ? "bg-cyan-500 text-black shadow-glow-cyan" : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Gazette Bulletins</span>
        </button>
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW & STATS */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="glass-panel p-5 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Students</span>
              <span className="text-3xl font-black text-white font-cyber">{totalStudents}</span>
            </div>
            <div className="glass-panel p-5 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Scholars</span>
              <span className="text-3xl font-black text-emerald-400 font-cyber">{activeStudents}</span>
            </div>
            <div className="glass-panel p-5 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Exams</span>
              <span className="text-3xl font-black text-white font-cyber">{totalExams}</span>
            </div>
            <div className="glass-panel p-5 rounded-2xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Upcoming Exams</span>
              <span className="text-3xl font-black text-cyan-400 font-cyber">{upcomingExams}</span>
            </div>
            <div className="glass-panel p-5 rounded-2xl text-center col-span-2 md:col-span-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Results Published</span>
              <span className="text-3xl font-black text-amber-400 font-cyber">{publishedResultsCount}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-3xl space-y-3">
              <h3 className="font-cyber font-bold text-base text-white uppercase">Quick Operations</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setIsExamModalOpen(true)}
                  className="p-3 rounded-xl bg-midnight-950 border border-cyan-500/30 hover:border-cyan-400 text-left font-bold text-cyan-300"
                >
                  + Add New Examination
                </button>
                <button
                  onClick={() => setIsResultModalOpen(true)}
                  className="p-3 rounded-xl bg-midnight-950 border border-amber-500/30 hover:border-amber-400 text-left font-bold text-amber-300"
                >
                  + Enter Results & Marks
                </button>
                <button
                  onClick={() => setIsNotifModalOpen(true)}
                  className="p-3 rounded-xl bg-midnight-950 border border-purple-500/30 hover:border-purple-400 text-left font-bold text-purple-300"
                >
                  + Broadcast Gazette
                </button>
                <button
                  onClick={() => {
                    setEditingStudent(null);
                    setIsStudentModalOpen(true);
                  }}
                  className="p-3 rounded-xl bg-midnight-950 border border-blue-500/30 hover:border-blue-400 text-left font-bold text-blue-300"
                >
                  + Register Student
                </button>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl space-y-3">
              <h3 className="font-cyber font-bold text-base text-white uppercase">Platform Infrastructure</h3>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between p-2 rounded-lg bg-midnight-950">
                  <span>Database Synchronization:</span>
                  <span className="text-emerald-400 font-bold">100% Active</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-midnight-950">
                  <span>Firebase Security Rules:</span>
                  <span className="text-cyan-400 font-bold">Enforced (RBAC)</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-midnight-950">
                  <span>Barcoded Hall Tickets Issued:</span>
                  <span className="text-white font-bold">1,248 Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS MANAGEMENT */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search students..."
                className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <button
              onClick={() => {
                setEditingStudent(null);
                setStudentFormName("");
                setStudentFormEmail("");
                setStudentFormPhone("");
                setStudentFormCourse("");
                setStudentFormCollege("");
                setIsStudentModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-midnight-950 text-slate-400 uppercase text-[10px] font-cyber">
                  <tr>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email / Phone</th>
                    <th className="py-3 px-4">Course & College</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {studentsList
                    .filter(s => s.fullName?.toLowerCase().includes(studentSearch.toLowerCase()) || s.email?.toLowerCase().includes(studentSearch.toLowerCase()))
                    .map((s) => (
                      <tr key={s.uid} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-mono font-bold text-cyan-300">{s.studentId}</td>
                        <td className="py-3 px-4 font-bold text-white">{s.fullName}</td>
                        <td className="py-3 px-4 text-slate-300">
                          <div>{s.email}</div>
                          <div className="text-[10px] text-slate-400">{s.phone}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <div>{s.course || "B.Tech"}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{s.college || "Autonomous College"}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.isActive ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40" : "bg-red-950 text-red-400 border border-red-500/40"
                          }`}>
                            {s.isActive ? "ACTIVE" : "DISABLED"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingStudent(s);
                              setStudentFormName(s.fullName || "");
                              setStudentFormEmail(s.email || "");
                              setStudentFormPhone(s.phone || "");
                              setStudentFormCourse(s.course || "");
                              setStudentFormCollege(s.college || "");
                              setIsStudentModalOpen(true);
                            }}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                            title="Edit Student"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStudentStatus(s.uid)}
                            className={`p-1 rounded text-xs font-bold ${
                              s.isActive ? "bg-amber-950 text-amber-300" : "bg-emerald-950 text-emerald-300"
                            }`}
                            title={s.isActive ? "Disable Student" : "Enable Student"}
                          >
                            {s.isActive ? "Disable" : "Enable"}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXAMINATIONS MANAGEMENT */}
      {activeTab === "exams" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-cyber font-bold text-lg text-white">Active Examinations</h3>
            <button
              onClick={() => setIsExamModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Exam</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((exam) => (
              <div key={exam.id} className="glass-panel p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-cyan-400 font-mono">{exam.code}</span>
                    <h4 className="text-sm font-bold text-white">{exam.name}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                    {exam.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Test Date:</span>
                    <span className="text-white font-semibold">{exam.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Registration Cutoff:</span>
                    <span className="text-amber-400 font-semibold">{exam.registrationDeadline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Testing Authority:</span>
                    <span className="text-cyan-300">{exam.authority}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      const nextStatus = exam.status === "Registration Open" ? "Registration Closed" : "Registration Open";
                      updateExam(exam.id, { status: nextStatus });
                      setActionMsg(`Exam status updated to ${nextStatus}.`);
                    }}
                    className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200"
                  >
                    Toggle Status
                  </button>
                  <button
                    onClick={() => {
                      deleteExam(exam.id);
                      setActionMsg("Examination deleted from system.");
                    }}
                    className="p-1.5 rounded-lg bg-red-950 text-red-400 hover:bg-red-900"
                    title="Delete Exam"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RESULTS & MARKS MANAGEMENT */}
      {activeTab === "results" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-cyber font-bold text-lg text-white">Merit Accreditations & Marks</h3>
            <button
              onClick={() => setIsResultModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Candidate Result</span>
            </button>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-midnight-950 text-slate-400 uppercase text-[10px] font-cyber">
                  <tr>
                    <th className="py-3 px-4">Exam Name</th>
                    <th className="py-3 px-4">Candidate Roll</th>
                    <th className="py-3 px-4">Marks Obtained</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Visibility</th>
                    <th className="py-3 px-4 text-right">Toggle Publish</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {results.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-bold text-white">{res.examName}</td>
                      <td className="py-3 px-4 font-mono text-cyan-300">{res.rollNumber}</td>
                      <td className="py-3 px-4 font-bold text-white">{res.marksObtained} / {res.maxMarks}</td>
                      <td className="py-3 px-4 text-cyan-400 font-bold">{res.percentage}%</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                          {res.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          res.isPublished ? "bg-cyan-950 text-cyan-300" : "bg-amber-950 text-amber-300"
                        }`}>
                          {res.isPublished ? "PUBLISHED" : "PRIVATE (DRAFT)"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            publishResult(res.id, !res.isPublished);
                            setActionMsg(`Result publish status updated for ${res.rollNumber}.`);
                          }}
                          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                        >
                          {res.isPublished ? "Make Private" : "Publish to Student"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GAZETTE NOTIFICATIONS */}
      {activeTab === "notifications" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-cyber font-bold text-lg text-white">Broadcast Gazette Notices</h3>
            <button
              onClick={() => setIsNotifModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Broadcast Notice</span>
            </button>
          </div>

          <div className="space-y-3">
            {notifications.map((notif) => (
              <div key={notif.id} className="glass-panel p-4 rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-cyan-950 text-cyan-300">
                      {notif.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{notif.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">{notif.content}</p>
                </div>
                <button
                  onClick={() => {
                    deleteNotification(notif.id);
                    setActionMsg("Gazette announcement removed.");
                  }}
                  className="p-2 rounded-lg bg-red-950 text-red-400 hover:bg-red-900 shrink-0"
                  title="Delete Bulletin"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT STUDENT */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md">
          <div className="max-w-md w-full glass-panel-glow rounded-3xl p-6 border border-cyan-500/40 space-y-4">
            <h3 className="font-cyber font-bold text-lg text-white">
              {editingStudent ? "Edit Student Details" : "Register Student"}
            </h3>
            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  value={studentFormName}
                  onChange={(e) => setStudentFormName(e.target.value)}
                  placeholder="Aditya Sharma"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Email</label>
                <input
                  type="email"
                  value={studentFormEmail}
                  onChange={(e) => setStudentFormEmail(e.target.value)}
                  placeholder="student@examhub.in"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Phone</label>
                <input
                  type="tel"
                  value={studentFormPhone}
                  onChange={(e) => setStudentFormPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">College</label>
                <input
                  type="text"
                  value={studentFormCollege}
                  onChange={(e) => setStudentFormCollege(e.target.value)}
                  placeholder="Fergusson College"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Course</label>
                <input
                  type="text"
                  value={studentFormCourse}
                  onChange={(e) => setStudentFormCourse(e.target.value)}
                  placeholder="B.Tech Computer Science"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD EXAMINATION */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md">
          <div className="max-w-md w-full glass-panel-glow rounded-3xl p-6 border border-cyan-500/40 space-y-4">
            <h3 className="font-cyber font-bold text-lg text-white">Create Examination Program</h3>
            <form onSubmit={handleSaveExam} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Exam Title</label>
                <input
                  type="text"
                  value={examFormName}
                  onChange={(e) => setExamFormName(e.target.value)}
                  placeholder="e.g. UPSC Combined Defence Services (CDS) 2026"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 uppercase font-bold mb-1">Category</label>
                  <select
                    value={examFormCategory}
                    onChange={(e) => setExamFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value="Medical Entrance">Medical Entrance</option>
                    <option value="Engineering Entrance">Engineering Entrance</option>
                    <option value="Civil Services">Civil Services</option>
                    <option value="Railways Recruitment">Railways Recruitment</option>
                    <option value="Central Recruitment">Central Recruitment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-bold mb-1">Status</label>
                  <select
                    value={examFormStatus}
                    onChange={(e) => setExamFormStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Registration Open">Registration Open</option>
                    <option value="Registration Closed">Registration Closed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 uppercase font-bold mb-1">Test Date</label>
                  <input
                    type="date"
                    value={examFormDate}
                    onChange={(e) => setExamFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-bold mb-1">Registration Cutoff</label>
                  <input
                    type="date"
                    value={examFormDeadline}
                    onChange={(e) => setExamFormDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Testing Authority</label>
                <input
                  type="text"
                  value={examFormAuthority}
                  onChange={(e) => setExamFormAuthority(e.target.value)}
                  placeholder="e.g. UPSC / NTA"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold"
                >
                  Publish Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD RESULT & MARKS */}
      {isResultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md">
          <div className="max-w-md w-full glass-panel-glow rounded-3xl p-6 border border-cyan-500/40 space-y-4">
            <h3 className="font-cyber font-bold text-lg text-white">Enter Candidate Marks & Result</h3>
            <form onSubmit={handleSaveResult} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Examination</label>
                <select
                  value={resultExamId}
                  onChange={(e) => setResultExamId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                >
                  {exams.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 uppercase font-bold mb-1">Candidate Roll</label>
                  <input
                    type="text"
                    value={resultStudentRoll}
                    onChange={(e) => setResultStudentRoll(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-bold mb-1">Candidate Name</label>
                  <input
                    type="text"
                    value={resultStudentName}
                    onChange={(e) => setResultStudentName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs uppercase"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 uppercase font-bold mb-1">Marks Obtained</label>
                  <input
                    type="number"
                    value={resultMarksObtained}
                    onChange={(e) => setResultMarksObtained(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-bold mb-1">Total Maximum Marks</label>
                  <input
                    type="number"
                    value={resultMaxMarks}
                    onChange={(e) => setResultMaxMarks(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="publishCheck"
                  checked={resultIsPublished}
                  onChange={(e) => setResultIsPublished(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500"
                />
                <label htmlFor="publishCheck" className="text-slate-300">
                  Publish to Student Immediately
                </label>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResultModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold"
                >
                  Save & Calculate Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: BROADCAST NOTIFICATION */}
      {isNotifModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md">
          <div className="max-w-md w-full glass-panel-glow rounded-3xl p-6 border border-cyan-500/40 space-y-4">
            <h3 className="font-cyber font-bold text-lg text-white">Broadcast Gazette Notice</h3>
            <form onSubmit={handleBroadcastNotif} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Notice Heading</label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g. Schedule Released for NEET UG 2026"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 uppercase font-bold mb-1">Category</label>
                  <select
                    value={notifCategory}
                    onChange={(e) => setNotifCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value="Exams">Exams</option>
                    <option value="Hall Tickets">Hall Tickets</option>
                    <option value="Results">Results</option>
                    <option value="Important Notices">Important Notices</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-bold mb-1">Priority</label>
                  <select
                    value={notifPriority}
                    onChange={(e) => setNotifPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">Urgent Notice</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Bulletin Content</label>
                <textarea
                  rows={3}
                  value={notifContent}
                  onChange={(e) => setNotifContent(e.target.value)}
                  placeholder="Detailed announcement details..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNotifModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold"
                >
                  Broadcast Bulletin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
