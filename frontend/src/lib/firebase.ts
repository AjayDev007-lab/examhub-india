/**
 * EXAMHUB INDIA — Official Firebase Authentication & Cloud Firestore Integration
 * Unified single-source authentication system using official Firebase SDK.
 * Zero plaintext password storage, zero fake validation, zero credential mixing.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  Auth,
  User as FirebaseUser
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  Firestore
} from "firebase/firestore";

// Read Firebase environment variables with active project fallbacks
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDFkI2-OPGnGkZ2PgQqZx5Lc1Z28fB59zQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "examhub-india-6ba59.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "examhub-india-6ba59",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "examhub-india-6ba59.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "109827630610",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:109827630610:web:93ff9fbacd2838d1d69acb"
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.length > 10 &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes("your_firebase_api_key") &&
  !firebaseConfig.apiKey.includes("your-api-key")
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (typeof window !== "undefined") {
  try {
    if (isFirebaseConfigured) {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);

      // Ensure persistent sessions across browser restarts & reloads
      setPersistence(auth, browserLocalPersistence).catch((err) => {
        console.warn("Firebase persistence warning:", err);
      });
    }
  } catch (err) {
    console.warn("Firebase client initialization warning:", err);
  }
}

export {
  app,
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  doc,
  setDoc,
  getDoc
};

/**
 * Format Firebase Authentication error codes into human-friendly, accurate messages (Requirement 6)
 */
export function formatFirebaseAuthError(error: any, _emailToCheck?: string): string {
  if (!error) return "Authentication failed. Please verify your credentials.";

  const code = error.code || "";
  const msg = error.message || "";

  switch (code) {
    case "auth/wrong-password":
      return "Incorrect password entered. Please verify your password.";

    case "auth/user-not-found":
      return "No account found matching this email address. Please check spelling or create an account.";

    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "Incorrect email or password. Please verify your credentials or create a free account.";

    case "auth/email-already-in-use":
      return "An account with this email already exists. Please sign in or reset your password.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/user-disabled":
      return "This student account has been disabled. Please contact the Examination Administrator.";

    case "auth/network-request-failed":
      return "Network connection error. Please verify your internet connection.";

    case "auth/weak-password":
      return "Password must be at least 8 characters long.";

    case "auth/too-many-requests":
      return "Access to this account has been temporarily disabled due to many failed login attempts. Try again later or reset your password.";

    case "auth/operation-not-allowed":
      return "Email/Password sign-in is not enabled in Firebase Console. Please enable Email/Password provider under Authentication > Sign-in method in Firebase Console.";

    default:
      if (msg.includes("network") || msg.includes("Network")) {
        return "Network connection error. Please verify your internet connection.";
      }
      if (msg.includes("user-not-found") || msg.includes("USER_NOT_FOUND")) {
        return "No account found matching this email address. Please check spelling or create an account.";
      }
      if (msg.includes("wrong-password") || msg.includes("INVALID_PASSWORD")) {
        return "Incorrect password entered. Please verify your password.";
      }
      return msg || "Authentication failed. Please verify your credentials.";
  }
}

/**
 * Global secure logout helper
 * Clears Firebase auth session, localStorage, sessionStorage, and HTTP cookies
 */
export async function logoutUser() {
  if (typeof window === "undefined") return;

  try {
    if (auth) {
      await firebaseSignOut(auth).catch(() => {});
    }
  } catch (_) {}

  // Remove local and session tokens
  localStorage.removeItem("examhub_token");
  localStorage.removeItem("examhub_user");
  localStorage.removeItem("examhub_admin_token");
  localStorage.removeItem("examhub_admin_user");
  sessionStorage.clear();

  // Clear session cookies
  document.cookie = "examhub_token=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "examhub_user_type=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "examhub_admin_token=; path=/; max-age=0; SameSite=Lax";

  // Redirect to login
  window.location.href = "/auth/login";
}
