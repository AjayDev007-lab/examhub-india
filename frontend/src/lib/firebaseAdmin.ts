// ============================================================================
// EXAMHUB INDIA — FIREBASE ADMIN SDK & SERVERLESS FIRESTORE ENGINE
// Secure server-side privileged client for durable publishing queue operations
// Zero credentials committed to git; reads strictly from Vercel environment variables
// ============================================================================

import { initializeApp, getApps, cert, applicationDefault, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import crypto from "crypto";

export interface FirebaseAdminConfigStatus {
  isConfigured: boolean;
  projectId: string;
  hasClientEmail: boolean;
  hasPrivateKey: boolean;
  usesApplicationDefaultCredentials: boolean;
  error?: string;
}

let adminApp: App | null = null;
let firestoreDb: Firestore | null = null;
let initError: string | null = null;

function cleanEnvString(val: string | undefined): string {
  if (!val) return "";
  let cleaned = val.trim();
  cleaned = cleaned.replace(/^["'\s\\]+/, "");
  cleaned = cleaned.replace(/["'\s\\,]+$/, "");
  return cleaned.trim();
}

export function cleanPrivateKey(raw: string | undefined): string {
  if (!raw) return "";
  let key = raw.trim();

  // If user pasted entire service account JSON into FIREBASE_PRIVATE_KEY
  if (key.startsWith("{") && key.includes("private_key")) {
    try {
      const parsed = JSON.parse(key);
      if (parsed.private_key) key = parsed.private_key;
    } catch (_) {}
  }

  // 1. Try direct clean first (unescape newlines and carriage returns)
  let directClean = key.replace(/\\n/g, "\n").replace(/\r/g, "").trim();
  directClean = directClean.replace(/^["'\s\\]+/, "").replace(/["'\s\\,]+$/, "");
  try {
    crypto.createPrivateKey(directClean);
    return directClean;
  } catch (_) {}

  // 2. Determine original header type (PKCS#1 vs PKCS#8)
  const isPkcs1 = key.includes("RSA PRIVATE KEY");
  const headerType = isPkcs1 ? "RSA PRIVATE KEY" : "PRIVATE KEY";

  // Strip headers and footers, and extract pure base64 characters only
  const base64Body = key
    .replace(/-----BEGIN [A-Z ]+-----/gi, "")
    .replace(/-----END [A-Z ]+-----/gi, "")
    .replace(/[^A-Za-z0-9+/=]/g, "");

  if (base64Body.length > 100) {
    const chunks = base64Body.match(/.{1,64}/g) || [];
    const formatted = chunks.join("\n");

    // Candidate A: with detected header type
    const candidateA = `-----BEGIN ${headerType}-----\n${formatted}\n-----END ${headerType}-----\n`;
    try {
      crypto.createPrivateKey(candidateA);
      return candidateA;
    } catch (_) {}

    // Candidate B: with alternate header type
    const altHeader = isPkcs1 ? "PRIVATE KEY" : "RSA PRIVATE KEY";
    const candidateB = `-----BEGIN ${altHeader}-----\n${formatted}\n-----END ${altHeader}-----\n`;
    try {
      crypto.createPrivateKey(candidateB);
      return candidateB;
    } catch (_) {}

    return candidateA;
  }

  return key;
}

/**
 * Returns the current Firebase Admin configuration status.
 * Never leaks the actual private key or secrets.
 */
export function getFirebaseAdminConfigStatus(): FirebaseAdminConfigStatus {
  const projectId =
    cleanEnvString(process.env.FIREBASE_PROJECT_ID) ||
    cleanEnvString(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) ||
    "examhub-india-6ba59";
  const clientEmail = cleanEnvString(process.env.FIREBASE_CLIENT_EMAIL);
  const rawKey = cleanPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  const usesApplicationDefaultCredentials = Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.K_SERVICE ||
    process.env.FIREBASE_CONFIG
  );

  const hasClientEmail = Boolean(clientEmail && clientEmail.includes("@"));
  const hasPrivateKey = Boolean(rawKey && (rawKey.includes("BEGIN PRIVATE KEY") || rawKey.length > 50));
  const hasServiceAccountCredentials = hasClientEmail && hasPrivateKey;
  const isConfigured = Boolean(
    projectId && (hasServiceAccountCredentials || usesApplicationDefaultCredentials) && !initError
  );

  let error: string | undefined;
  if (initError) {
    error = initError;
  } else if (!isConfigured) {
    error = "Firebase Admin credentials are unavailable. Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY, or run on Google Cloud with Application Default Credentials.";
  }

  return {
    isConfigured,
    projectId,
    hasClientEmail,
    hasPrivateKey,
    usesApplicationDefaultCredentials,
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
  const hasServiceAccountCredentials = status.hasClientEmail && status.hasPrivateKey;
  if (!hasServiceAccountCredentials && !status.usesApplicationDefaultCredentials) {
    return null;
  }

  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      adminApp = existingApps[0]!;
      return adminApp;
    }

    const projectId = status.projectId;
    if (hasServiceAccountCredentials) {
      const clientEmail = cleanEnvString(process.env.FIREBASE_CLIENT_EMAIL);
      const privateKey = cleanPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
      const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";

      try {
        crypto.createPrivateKey(privateKey);
      } catch (pemErr: any) {
        const keyDiag = `len=${rawKey.length}, hasBegin=${rawKey.includes("BEGIN")}, hasEnd=${rawKey.includes("END")}, emailPrefix=${(clientEmail || "").slice(0, 8)}`;
        initError = `Firebase Admin initialization error: Invalid PEM key format [${pemErr.message}] (${keyDiag})`;
        console.error(initError);
        return null;
      }

      adminApp = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        projectId,
      });
    } else {
      adminApp = initializeApp({
        credential: applicationDefault(),
        projectId,
      });
    }

    initError = null;
    return adminApp;
  } catch (err: any) {
    const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
    const keyDiag = `len=${rawKey.length}, hasBegin=${rawKey.includes("BEGIN")}, hasEnd=${rawKey.includes("END")}, emailPrefix=${(process.env.FIREBASE_CLIENT_EMAIL || "").slice(0, 8)}`;
    initError = `Firebase Admin initialization error: ${err.message} (${keyDiag})`;
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
    initError = `Failed to obtain Firestore Admin instance: ${err.message}`;
    console.error("Failed to obtain Firestore Admin instance:", err.message);
    return null;
  }
}
