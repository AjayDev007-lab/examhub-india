// ============================================================================
// EXAMHUB INDIA — FIREBASE ADMIN SDK & SERVERLESS FIRESTORE ENGINE
// Secure server-side privileged client for durable publishing queue operations
// Zero credentials committed to git; reads strictly from Vercel environment variables
// ============================================================================

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import crypto from "crypto";

export interface FirebaseAdminConfigStatus {
  isConfigured: boolean;
  projectId: string;
  hasClientEmail: boolean;
  hasPrivateKey: boolean;
  error?: string;
}

let adminApp: App | null = null;
let firestoreDb: Firestore | null = null;
let initError: string | null = null;

function cleanEnvString(val: string | undefined): string {
  if (!val) return "";
  let cleaned = val.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

export function cleanPrivateKey(raw: string | undefined): string {
  if (!raw) return "";
  let key = raw.trim();

  // If user pasted entire service account JSON into FIREBASE_PRIVATE_KEY
  if (key.startsWith("{") && key.endsWith("}")) {
    try {
      const parsed = JSON.parse(key);
      if (parsed.private_key) key = parsed.private_key;
    } catch (_) {}
  }

  // Strip wrapping quotes and backslashes
  key = key.replace(/^["'\\s]+|["'\\s]+$/g, "");

  // If base64-encoded PEM
  if (!key.includes("BEGIN") && key.length > 200) {
    try {
      const decoded = Buffer.from(key, "base64").toString("utf8");
      if (decoded.includes("BEGIN")) {
        key = decoded;
      }
    } catch (_) {}
  }

  // Unescape literal backslash-n
  while (key.includes("\\n")) {
    key = key.replace(/\\n/g, "\n");
  }

  // Extract pure base64 payload to rebuild canonical 64-character PEM format
  const base64Body = key
    .replace(/-----BEGIN [A-Z ]+-----/g, "")
    .replace(/-----END [A-Z ]+-----/g, "")
    .replace(/[\s\r\n]+/g, "");

  if (base64Body.length > 50) {
    const chunks = base64Body.match(/.{1,64}/g) || [];
    return "-----BEGIN PRIVATE KEY-----\n" + chunks.join("\n") + "\n-----END PRIVATE KEY-----\n";
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

  const hasClientEmail = Boolean(clientEmail && clientEmail.includes("@"));
  const hasPrivateKey = Boolean(rawKey && (rawKey.includes("BEGIN PRIVATE KEY") || rawKey.length > 50));
  const isConfigured = Boolean(projectId && hasClientEmail && hasPrivateKey && !initError);

  let error: string | undefined;
  if (initError) {
    error = initError;
  } else if (!isConfigured) {
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
  if (!status.hasClientEmail || !status.hasPrivateKey) {
    return null;
  }

  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      adminApp = existingApps[0]!;
      return adminApp;
    }

    const projectId = status.projectId;
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
      credential: cert({
        projectId,
        clientEmail,
        privateKey
      })
    });

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
