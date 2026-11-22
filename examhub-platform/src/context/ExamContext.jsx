import React, { createContext, useContext, useState, useEffect } from "react";
import { localStore } from "../firebase/config";

const ExamContext = createContext(null);

export function ExamProvider({ children }) {
  const [exams, setExams] = useState(() => localStore.getExams());
  const [hallTickets, setHallTickets] = useState(() => localStore.getHallTickets());
  const [results, setResults] = useState(() => localStore.getResults());
  const [notifications, setNotifications] = useState(() => localStore.getNotifications());
  const [registrations, setRegistrations] = useState(() => localStore.getRegistrations());

  // Listen to cross-component store events
  useEffect(() => {
    const handleExamsUpdate = (e) => setExams(e.detail);
    const handleHTUpdate = (e) => setHallTickets(e.detail);
    const handleResultsUpdate = (e) => setResults(e.detail);
    const handleNotifUpdate = (e) => setNotifications(e.detail);

    window.addEventListener("examhub_store_exams", handleExamsUpdate);
    window.addEventListener("examhub_store_hallTickets", handleHTUpdate);
    window.addEventListener("examhub_store_results", handleResultsUpdate);
    window.addEventListener("examhub_store_notifications", handleNotifUpdate);

    return () => {
      window.removeEventListener("examhub_store_exams", handleExamsUpdate);
      window.removeEventListener("examhub_store_hallTickets", handleHTUpdate);
      window.removeEventListener("examhub_store_results", handleResultsUpdate);
      window.removeEventListener("examhub_store_notifications", handleNotifUpdate);
    };
  }, []);

  // Exam Operations
  const addExam = (newExam) => {
    const created = {
      id: `exam_${Date.now()}`,
      ...newExam
    };
    const updated = [created, ...exams];
    setExams(updated);
    localStore.saveExams(updated);
    return created;
  };

  const updateExam = (id, updatedFields) => {
    const updated = exams.map(e => e.id === id ? { ...e, ...updatedFields } : e);
    setExams(updated);
    localStore.saveExams(updated);
  };

  const deleteExam = (id) => {
    const updated = exams.filter(e => e.id !== id);
    setExams(updated);
    localStore.saveExams(updated);
  };

  // Student Exam Registration
  const registerForExam = (examId, student) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) throw new Error("Examination not found");

    const newReg = {
      id: `reg_${Date.now()}`,
      examId,
      examName: exam.name,
      studentId: student.uid || student.studentId,
      studentName: student.fullName,
      registeredAt: new Date().toISOString(),
      status: "CONFIRMED",
      registrationNumber: `REG${new Date().getFullYear()}${Math.floor(100000 + Math.random() * 900000)}`
    };

    const updatedRegs = [newReg, ...registrations];
    setRegistrations(updatedRegs);
    localStore.saveRegistrations(updatedRegs);

    // Auto-generate Hall Ticket for registered student
    const newHT = {
      id: `ht_${Date.now()}`,
      examId: exam.id,
      examName: exam.name,
      examCode: exam.code || "EXAM-2026",
      studentId: student.studentId || student.uid,
      studentUid: student.uid || "std_001",
      studentName: student.fullName.toUpperCase(),
      rollNumber: `2604${Math.floor(100000 + Math.random() * 900000)}`,
      registrationNumber: newReg.registrationNumber,
      examDate: exam.date,
      examTime: "09:30 AM to 12:30 PM IST",
      reportingTime: "08:00 AM",
      gateClosingTime: "09:00 AM",
      centreName: "ExamHub India Verified CBT Center 04",
      centreCode: "IN-CBT-042",
      centreAddress: `${student.district || "Metropolitan"}, ${student.state || "India"} — Testing Hub Alpha`,
      photoUrl: student.photoUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256",
      barcodeValue: `EH${newReg.registrationNumber}`,
      instructions: [
        "Candidate must bring printed copy of this Hall Ticket along with valid Photo ID.",
        "Report before gate closing time. No entry will be permitted under any circumstances after closure.",
        "Electronic gadgets, mobile phones, and calculators are strictly forbidden."
      ]
    };

    const updatedHTs = [newHT, ...hallTickets];
    setHallTickets(updatedHTs);
    localStore.saveHallTickets(updatedHTs);

    // Create a personalized notification
    addNotification({
      title: `Registration Confirmed: ${exam.name}`,
      category: "Exams",
      content: `Your application has been accepted with Reg No: ${newReg.registrationNumber}. Your official Hall Ticket has been generated.`,
      link: "hall-tickets",
      priority: "HIGH"
    });

    return { registration: newReg, hallTicket: newHT };
  };

  // Hall Ticket retrieval
  const getStudentHallTickets = (studentUid) => {
    return hallTickets.filter(h => h.studentUid === studentUid || h.studentId === studentUid);
  };

  // Results Management
  const addOrUpdateResult = (newResult) => {
    let updated;
    const exists = results.some(r => r.id === newResult.id);
    if (exists) {
      updated = results.map(r => r.id === newResult.id ? newResult : r);
    } else {
      updated = [{ id: `res_${Date.now()}`, ...newResult }, ...results];
    }
    setResults(updated);
    localStore.saveResults(updated);
  };

  const publishResult = (resultId, isPublished = true) => {
    const updated = results.map(r => r.id === resultId ? { ...r, isPublished } : r);
    setResults(updated);
    localStore.saveResults(updated);
  };

  const getStudentResults = (studentUid) => {
    return results.filter(r => (r.studentUid === studentUid || r.studentId === studentUid) && r.isPublished);
  };

  // Notification Management
  const addNotification = (notif) => {
    const created = {
      id: `notif_${Date.now()}`,
      date: "Just now",
      timestamp: Date.now(),
      unread: true,
      ...notif
    };
    const updated = [created, ...notifications];
    setNotifications(updated);
    localStore.saveNotifications(updated);
    return created;
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStore.saveNotifications(updated);
  };

  const markNotificationAsRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, unread: false } : n);
    setNotifications(updated);
    localStore.saveNotifications(updated);
  };

  const markAllNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, unread: false }));
    setNotifications(updated);
    localStore.saveNotifications(updated);
  };

  const unreadNotifCount = notifications.filter(n => n.unread).length;

  const value = {
    exams,
    addExam,
    updateExam,
    deleteExam,
    registerForExam,
    registrations,
    hallTickets,
    getStudentHallTickets,
    results,
    addOrUpdateResult,
    publishResult,
    getStudentResults,
    notifications,
    addNotification,
    deleteNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotifCount
  };

  return (
    <ExamContext.Provider value={value}>
      {children}
    </ExamContext.Provider>
  );
}

export function useExams() {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error("useExams must be used within an ExamProvider");
  }
  return context;
}
