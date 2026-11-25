// ============================================================================
// EXAMHUB INDIA — FIREBASE ADMIN SDK & SERVERLESS FIRESTORE ENGINE
// Secure server-side privileged client for durable publishing queue operations
// Zero credentials committed to git; reads strictly from Vercel environment variables
// ============================================================================

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

export interface FirebaseAdminConfigStatus {
  isConfigured: boolean;
  projectId: string;
  hasClientEmail: boolean;
  hasPrivateKey: boolean;
  error?: string;
}

let adminApp: App | null = null;
let firestoreDb: Firestore | null = null;

/**
 * Returns the current Firebase Admin configuration status.
 * Never leaks the actual private key or secrets.
 */
export function getFirebaseAdminConfigStatus(): FirebaseAdminConfigStatus {
  const projectId =
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
    "examhub-india-6ba59";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim() || "";
  const rawKey = process.env.FIREBASE_PRIVATE_KEY?.trim() || "";

  const hasClientEmail = Boolean(clientEmail && clientEmail.includes("@"));
  const hasPrivateKey = Boolean(rawKey && (rawKey.includes("BEGIN PRIVATE KEY") || rawKey.length > 50));
  const isConfigured = Boolean(projectId && hasClientEmail && hasPrivateKey);

  let error: string | undefined;
  if (!isConfigured) {
    const missing: string[] = [];
    if (!hasClientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
    if (!hasPrivateKey) missing.push("FIREBASE_PRIVATE_KEY");
    error = `Firebase Admin credentials missing in Vercel environment variables (${missing.join(", ")}). Serverless queue is paused for durability protection.`;
  }

  return {
    isConfigured,
    projectId,
    hasClientEmail,
    hasPrivateKey,
    error
  };
}

/**
 * Checks whether Firebase Admin SDK is configured with valid server credentials.
 */
export function isFirebaseAdminConfigured(): boolean {
  return getFirebaseAdminConfigStatus().isConfigured;
}

/**
 * Initializes and returns the privileged Firebase Admin App instance.
 * Reuses existing initialized apps across serverless warm containers.
 */
export function getFirebaseAdminApp(): App | null {
  if (adminApp) return adminApp;

  const status = getFirebaseAdminConfigStatus();
  if (!status.isConfigured) {
    return null;
  }

  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      adminApp = existingApps[0]!;
      return adminApp;
    }

    const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
    // Handle both raw newlines and escaped string \n from Vercel env UI
    const privateKey = rawKey.replace(/\\n/g, "\n").trim();

    adminApp = initializeApp({
      credential: cert({
        projectId: status.projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.trim(),
        privateKey: privateKey
      })
    });

    return adminApp;
  } catch (err: any) {
    console.error("Firebase Admin initialization error:", err.message);
    return null;
  }
}

/**
 * Returns the Firestore Database instance for serverless queue operations.
 * Returns null if credentials are not configured or initialization failed.
 */
export function getFirestoreAdminDb(): Firestore | null {
  if (firestoreDb) return firestoreDb;

  const app = getFirebaseAdminApp();
  if (!app) return null;

  try {
    firestoreDb = getFirestore(app);
    // Ignore undefined properties in Firestore documents
    firestoreDb.settings({ ignoreUndefinedProperties: true });
    return firestoreDb;
  } catch (err: any) {
    console.error("Failed to obtain Firestore Admin instance:", err.message);
    return null;
  }
}
