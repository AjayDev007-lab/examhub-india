import type { NextRequest } from "next/server";

export type SessionRole = "student" | "admin";

export interface VerifiedSession {
  id: number;
  email: string;
  role: SessionRole;
}

function decodeBase64Url(value: string): Uint8Array | null {
  try {
    const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "="));
    return Uint8Array.from(binary, character => character.charCodeAt(0));
  } catch {
    return null;
  }
}

/** Verify the HS256 access tokens issued by FastAPI. Never trust role cookies. */
export async function verifySessionToken(token: string | undefined, role?: SessionRole): Promise<VerifiedSession | null> {
  const secret = process.env.SECRET_KEY;
  if (!token || !secret || secret.length < 32) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerPart, payloadPart, signaturePart] = parts;
  const headerBytes = decodeBase64Url(headerPart);
  const payloadBytes = decodeBase64Url(payloadPart);
  const signature = decodeBase64Url(signaturePart);
  if (!headerBytes || !payloadBytes || !signature) return null;

  try {
    const decoder = new TextDecoder();
    const header = JSON.parse(decoder.decode(headerBytes));
    const payload = JSON.parse(decoder.decode(payloadBytes));
    if (header.alg !== "HS256" || payload.type !== "student" && payload.type !== "admin") return null;
    if (role && payload.type !== role) return null;
    if (!Number.isSafeInteger(Number(payload.sub)) || Number(payload.sub) < 1) return null;
    if (typeof payload.exp !== "number" || payload.exp <= Math.floor(Date.now() / 1000)) return null;

    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const expected = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${headerPart}.${payloadPart}`)));
    if (expected.length !== signature.length) return null;
    let difference = 0;
    for (let i = 0; i < expected.length; i++) difference |= expected[i] ^ signature[i];
    if (difference !== 0) return null;
    return { id: Number(payload.sub), email: String(payload.email || ""), role: payload.type };
  } catch {
    return null;
  }
}
export async function getStudentSession(request: NextRequest): Promise<VerifiedSession | null> {
  const token = request.cookies.get("examhub_token")?.value ||
    (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  return verifySessionToken(token, "student");
}
