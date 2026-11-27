import { fetchApi } from "@/lib/api";
import type { User, UserCredential } from "firebase/auth";
import {
  auth,
  createUserWithEmailAndPassword,
  isFirebaseConfigured,
  signInWithEmailAndPassword,
} from "@/lib/firebase";

async function exchangeFirebaseUser(user: User) {
  return fetchApi("/api/auth/firebase-exchange", {
    method: "POST",
    body: JSON.stringify({ id_token: await user.getIdToken() }),
  });
}

/** Sign in with Firebase; existing SQL accounts are linked after their password is verified. */
export async function signInWithExamHub(email: string, password: string, legacyEndpoint = "/api/auth/login") {
  if (!isFirebaseConfigured) {
    return fetchApi(legacyEndpoint, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }
  if (!auth) throw new Error("Firebase Authentication did not initialize. Check the Firebase web configuration.");

  let credential: UserCredential;
  try {
    credential = await signInWithEmailAndPassword(auth, email, password);
  } catch {
    // Existing SQL accounts are linked only after the backend verifies their password.
    const legacySession = await fetchApi(legacyEndpoint, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!["student", "admin"].includes(legacySession.user_type)) return legacySession;
    try {
      credential = await createUserWithEmailAndPassword(auth, email, password);
    } catch {
      return legacySession;
    }
  }
  return exchangeFirebaseUser(credential.user);
}

export async function registerFirebaseIdentity(email: string, password: string) {
  if (!isFirebaseConfigured) return null;
  if (!auth) throw new Error("Firebase Authentication did not initialize. Check the Firebase web configuration.");
  let credential: UserCredential;
  try {
    credential = await createUserWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    if (error?.code !== "auth/email-already-in-use") throw error;
    credential = await signInWithEmailAndPassword(auth, email, password);
  }
  return credential.user;
}

export async function exchangeFirebaseIdentity(user: User) {
  return exchangeFirebaseUser(user);
}
