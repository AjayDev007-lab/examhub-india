import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  isConfigured, 
  auth, 
  db, 
  localStore, 
  isDemoMode 
} from "../firebase/config";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from "firebase/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [role, setRole] = useState(null); // 'student' | 'admin' | null
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize Auth state
  useEffect(() => {
    if (isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setCurrentUser(user);
          // Fetch student/admin profile from Firestore
          try {
            const adminDocRef = doc(db, "admins", user.uid);
            const adminSnap = await getDoc(adminDocRef);
            if (adminSnap.exists()) {
              setRole("admin");
              setStudentProfile(adminSnap.data());
            } else {
              const studentDocRef = doc(db, "students", user.uid);
              const studentSnap = await getDoc(studentDocRef);
              if (studentSnap.exists()) {
                setRole("student");
                setStudentProfile(studentSnap.data());
              } else {
                setRole("student");
              }
            }
          } catch (err) {
            console.error("Error fetching user profile from Firestore:", err);
          }
        } else {
          setCurrentUser(null);
          setStudentProfile(null);
          setRole(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Local persistent fallback session check
      const savedSession = localStorage.getItem("examhub_active_session");
      if (savedSession) {
        try {
          const sessionData = JSON.parse(savedSession);
          setCurrentUser(sessionData.user);
          setRole(sessionData.role);
          setStudentProfile(sessionData.profile);
        } catch (_) {}
      }
      setLoading(false);
    }
  }, []);

  // Login handler
  const login = async (email, password) => {
    setAuthError(null);
    const emailClean = email.trim().toLowerCase();

    if (isConfigured && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, emailClean, password);
        return { success: true, user: cred.user };
      } catch (err) {
        setAuthError(err.message);
        throw err;
      }
    } else {
      // Demo Mode local verification
      // 1. Super Admin check
      const admin = localStore.getAdmin();
      if (
        (emailClean === admin.email.toLowerCase() || emailClean === "superadmin@examhub.gov.in" || emailClean === "admin@examhub.in") &&
        (password === "SuperAdmin@ExamHub2026!" || password === "admin123" || password === "password")
      ) {
        const adminUser = { uid: admin.uid, email: admin.email, displayName: admin.fullName };
        setCurrentUser(adminUser);
        setRole("admin");
        setStudentProfile(admin);
        localStorage.setItem("examhub_active_session", JSON.stringify({
          user: adminUser,
          role: "admin",
          profile: admin
        }));
        return { success: true, role: "admin", user: adminUser };
      }

      // 2. Student check
      const students = localStore.getStudents();
      const student = students.find(s => s.email.toLowerCase() === emailClean);
      if (student) {
        if (password === "Password@123" || password === "student123" || password === student.password || student.uid) {
          const studentUser = { uid: student.uid, email: student.email, displayName: student.fullName };
          setCurrentUser(studentUser);
          setRole("student");
          setStudentProfile(student);
          localStorage.setItem("examhub_active_session", JSON.stringify({
            user: studentUser,
            role: "student",
            profile: student
          }));
          return { success: true, role: "student", user: studentUser };
        }
      }

      const err = new Error("Invalid email or password. Please verify your credentials.");
      setAuthError(err.message);
      throw err;
    }
  };

  // Student Registration handler (12 required fields)
  const registerStudent = async (formData) => {
    setAuthError(null);
    const emailClean = formData.email.trim().toLowerCase();

    if (isConfigured && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, emailClean, formData.password);
        const newStudentDoc = {
          uid: cred.user.uid,
          studentId: `EH-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
          fullName: formData.fullName.trim(),
          email: emailClean,
          phone: formData.phone.trim(),
          dob: formData.dob,
          gender: formData.gender,
          state: formData.state,
          district: formData.district,
          college: formData.college.trim(),
          course: formData.course.trim(),
          photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.fullName)}`,
          role: "student",
          createdAt: new Date().toISOString(),
          isActive: true,
          emailVerified: false
        };

        await setDoc(doc(db, "students", cred.user.uid), newStudentDoc);
        setStudentProfile(newStudentDoc);
        setRole("student");
        return { success: true, user: cred.user, profile: newStudentDoc };
      } catch (err) {
        setAuthError(err.message);
        throw err;
      }
    } else {
      // Demo Mode local registration
      const students = localStore.getStudents();
      if (students.some(s => s.email.toLowerCase() === emailClean)) {
        throw new Error("An account with this email address already exists.");
      }

      const newStudent = {
        uid: `std_${Date.now()}`,
        studentId: formData.studentId || `EH-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        fullName: formData.fullName.trim(),
        email: emailClean,
        phone: formData.phone.trim(),
        dob: formData.dob,
        gender: formData.gender,
        state: formData.state,
        district: formData.district,
        college: formData.college.trim(),
        course: formData.course.trim(),
        password: formData.password,
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.fullName)}`,
        role: "student",
        createdAt: new Date().toISOString(),
        isActive: true,
        emailVerified: true
      };

      const updated = [newStudent, ...students];
      localStore.saveStudents(updated);

      const userObj = { uid: newStudent.uid, email: newStudent.email, displayName: newStudent.fullName };
      setCurrentUser(userObj);
      setRole("student");
      setStudentProfile(newStudent);
      localStorage.setItem("examhub_active_session", JSON.stringify({
        user: userObj,
        role: "student",
        profile: newStudent
      }));

      return { success: true, user: userObj, profile: newStudent };
    }
  };

  // Profile update handler
  const updateProfile = async (updatedFields) => {
    if (!currentUser) return;

    if (isConfigured && db) {
      try {
        const collectionName = role === "admin" ? "admins" : "students";
        await updateDoc(doc(db, collectionName, currentUser.uid), updatedFields);
        setStudentProfile(prev => ({ ...prev, ...updatedFields }));
        return { success: true };
      } catch (err) {
        throw err;
      }
    } else {
      if (role === "admin") {
        const admin = localStore.getAdmin();
        const updated = { ...admin, ...updatedFields };
        localStore.saveAdmin(updated);
        setStudentProfile(updated);
      } else {
        const students = localStore.getStudents();
        const updatedStudents = students.map(s => s.uid === currentUser.uid ? { ...s, ...updatedFields } : s);
        localStore.saveStudents(updatedStudents);
        const updatedProfile = { ...studentProfile, ...updatedFields };
        setStudentProfile(updatedProfile);
        localStorage.setItem("examhub_active_session", JSON.stringify({
          user: currentUser,
          role: "student",
          profile: updatedProfile
        }));
      }
      return { success: true };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    if (isConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: "Official password reset link sent to your registered email." };
    } else {
      return { 
        success: true, 
        message: "Simulation: 6-digit verification OTP dispatched to " + email + ". Use OTP '202604' to reset password." 
      };
    }
  };

  // Sign out
  const logout = async () => {
    if (isConfigured && auth) {
      await signOut(auth);
    }
    setCurrentUser(null);
    setStudentProfile(null);
    setRole(null);
    localStorage.removeItem("examhub_active_session");
  };

  const value = {
    currentUser,
    studentProfile,
    role,
    loading,
    authError,
    login,
    registerStudent,
    updateProfile,
    forgotPassword,
    logout,
    isDemoMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
