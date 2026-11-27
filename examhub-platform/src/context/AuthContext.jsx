import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  isConfigured, 
  auth, 
  db, 
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
          message = "Incorrect email or password. Please verify your credentials.";
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
      const message = "Authentication service is not configured.";
      setAuthError(message);
      throw new Error(message);
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
      const message = "Authentication service is not configured.";
      setAuthError(message);
      throw new Error(message);
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
      throw new Error("Authentication service is not configured.");
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    if (isConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: "Official password reset link sent to your registered email." };
    } else {
      throw new Error("Account recovery service is not configured.");
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
