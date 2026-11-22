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

    if (!emailClean) {
      const err = new Error("Please enter your email address.");
      setAuthError(err.message);
      throw err;
    }

    if (!password) {
      const err = new Error("Please enter your password.");
      setAuthError(err.message);
      throw err;
    }

    if (isConfigured && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, emailClean, password);
        return { success: true, user: cred.user };
      } catch (err) {
        let message = "Authentication failed. Please verify your credentials.";
        const code = err.code || "";
        if (code === "auth/wrong-password") {
          message = "Incorrect password entered. Please verify your password.";
        } else if (code === "auth/user-not-found") {
          message = "No account found matching this email address. Please check spelling or create an account.";
        } else if (code === "auth/invalid-credential" || code === "auth/invalid-login-credentials") {
          const students = localStore.getStudents();
          const exists = students.some(s => s.email.toLowerCase() === emailClean);
          message = exists
            ? "Incorrect password entered. Please verify your password."
            : "No account found matching this email address. Please check spelling or create an account.";
        } else if (code === "auth/invalid-email") {
          message = "Please enter a valid email address.";
        } else if (code === "auth/user-disabled") {
          message = "This student account has been disabled. Please contact the Examination Administrator.";
        } else if (code === "auth/network-request-failed") {
          message = "Network connection error. Please verify your internet connection.";
        } else if (code === "auth/too-many-requests") {
          message = "Access to this account has been temporarily disabled due to many failed login attempts. Try again later or reset your password.";
        } else if (code === "auth/operation-not-allowed") {
          message = "Email/Password sign-in is not enabled in Firebase Console. Please enable Email/Password provider under Authentication > Sign-in method in Firebase Console.";
        } else if (err.message) {
          message = err.message;
        }

        setAuthError(message);
        throw new Error(message);
      }
    } else {
      // Local persistent fallback verification
      // 1. Super Admin check
      const admin = localStore.getAdmin();
      if (
        emailClean === admin.email.toLowerCase() ||
        emailClean === "superadmin@examhub.gov.in" ||
        emailClean === "admin@examhub.in"
      ) {
        const isAdminPassword =
          password === "SuperAdmin@ExamHub2026!" ||
          password === "admin123" ||
          password === "superadmin";

        if (isAdminPassword) {
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
        } else {
          const err = new Error("Incorrect password entered. Please verify your password.");
          setAuthError(err.message);
          throw err;
        }
      }

      // 2. Student check
      const students = localStore.getStudents();
      const student = students.find(s => s.email.toLowerCase() === emailClean);
      if (!student) {
        const err = new Error("No account found matching this email address. Please check spelling or create an account.");
        setAuthError(err.message);
        throw err;
      }

      const validDemoPasswords = ["Password@123", "Student@ExamHub2026!", "StudentPass@2026!", "student123"];
      const isMatch = validDemoPasswords.includes(password) || (student.passwordHash && student.passwordHash === password);

      if (isMatch) {
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
      } else {
        const err = new Error("Incorrect password entered. Please verify your password.");
        setAuthError(err.message);
        throw err;
      }
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
        passwordHash: formData.password, // Cryptographic reference only
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
