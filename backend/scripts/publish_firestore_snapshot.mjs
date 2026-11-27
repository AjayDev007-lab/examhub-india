#!/usr/bin/env node

import { createSign, createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const SNAPSHOT_COLLECTION = "examhub_sqlite_snapshot_state";
const CHUNKS_COLLECTION = "examhub_sqlite_snapshot_chunks";
const CHUNK_BYTES = 512 * 1024;
const COMMIT_GROUP_SIZE = 8;

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

async function accessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: serviceAccount.token_uri || "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${signer.sign(serviceAccount.private_key).toString("base64url")}`;

  const response = await fetch(serviceAccount.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const result = await response.json();
  if (!response.ok || !result.access_token) {
    throw new Error(`Google token request failed (${response.status}): ${result.error_description || result.error || "unknown error"}`);
  }
  return result.access_token;
}

function documentsUrl(projectId, suffix = "") {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents${suffix}`;
}

function documentName(projectId, path) {
  return `projects/${projectId}/databases/(default)/documents/${path}`;
}

async function firestoreRequest(url, token, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body.error?.message || `Firestore request failed (${response.status})`;
    throw new Error(message);
  }
  return body;
}

async function getDocument(path, token, projectId) {
  const url = documentsUrl(projectId, `/${path.split("/").map(encodeURIComponent).join("/")}`);
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (response.status === 404) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error?.message || `Firestore request failed (${response.status})`);
  return body;
}

async function listChunks(projectId, token, slot) {
  const where = slot ? {
    fieldFilter: {
      field: { fieldPath: "slot" },
      op: "EQUAL",
      value: { stringValue: slot },
    },
  } : undefined;
  const structuredQuery = {
    from: [{ collectionId: CHUNKS_COLLECTION }],
    ...(where ? { where } : {}),
  };
  const response = await firestoreRequest(documentsUrl(projectId, ":runQuery"), token, {
    method: "POST",
    body: JSON.stringify({ structuredQuery }),
  });
  return response.map((item) => item.document).filter(Boolean);
}

async function commit(projectId, token, writes) {
  await firestoreRequest(documentsUrl(projectId, ":commit"), token, {
    method: "POST",
    body: JSON.stringify({ writes }),
  });
}

function integerValue(value) {
  return { integerValue: String(value) };
}

async function main() {
  const databasePath = argument("--database");
  const projectId = argument("--project-id");
  const keyPath = argument("--service-account");
  const replaceExisting = process.argv.includes("--replace-existing");
  if (!databasePath || !projectId || !keyPath) {
    throw new Error("Usage: node publish_firestore_snapshot.mjs --database FILE --project-id ID --service-account KEY.json [--replace-existing]");
  }

  const serviceAccount = JSON.parse(await readFile(keyPath, "utf8"));
  if (serviceAccount.project_id !== projectId) {
    throw new Error("The service-account key belongs to a different Firebase project.");
  }

  const token = await accessToken(serviceAccount);
  const pointerPath = `${SNAPSHOT_COLLECTION}/current`;
  const current = await getDocument(pointerPath, token, projectId);
  if (current && !replaceExisting) {
    throw new Error("A Firestore snapshot already exists. Review it first; do not add --replace-existing unless replacement is intentional.");
  }

  let activeSlot = current?.fields?.slot?.stringValue || "";
  const nextSlot = activeSlot === "A" ? "B" : "A";
  if (activeSlot && !["A", "B"].includes(activeSlot)) {
    throw new Error("Existing Firestore snapshot metadata is invalid; refusing to replace it.");
  }

  if (current) {
    const staleChunks = await listChunks(projectId, token, nextSlot);
    for (let start = 0; start < staleChunks.length; start += 400) {
      const writes = staleChunks.slice(start, start + 400).map((document) => ({ delete: document.name }));
      await commit(projectId, token, writes);
    }
  } else {
    const orphanChunks = await listChunks(projectId, token, "");
    if (orphanChunks.length) {
      throw new Error("Firestore contains snapshot chunks without a current snapshot pointer; refusing to publish.");
    }
  }

  const databaseBytes = await readFile(databasePath);
  const compressed = gzipSync(databaseBytes, { level: 6, mtime: 0 });
  const sha256 = createHash("sha256").update(databaseBytes).digest("hex");
  const chunks = [];
  for (let offset = 0; offset < compressed.length; offset += CHUNK_BYTES) {
    chunks.push(compressed.subarray(offset, offset + CHUNK_BYTES));
  }
  if (!chunks.length) chunks.push(Buffer.alloc(0));

  for (let start = 0; start < chunks.length; start += COMMIT_GROUP_SIZE) {
    const writes = chunks.slice(start, start + COMMIT_GROUP_SIZE).map((payload, index) => {
      const chunkIndex = start + index;
      const id = `${nextSlot}-${String(chunkIndex).padStart(8, "0")}`;
      return {
        update: {
          name: documentName(projectId, `${CHUNKS_COLLECTION}/${id}`),
          fields: {
            slot: { stringValue: nextSlot },
            index: integerValue(chunkIndex),
            payload: { bytesValue: payload.toString("base64") },
          },
        },
      };
    });
    await commit(projectId, token, writes);
  }

  await commit(projectId, token, [{
    update: {
      name: documentName(projectId, pointerPath),
      fields: {
        slot: { stringValue: nextSlot },
        chunkCount: integerValue(chunks.length),
        databaseBytes: integerValue(databaseBytes.length),
        compressedBytes: integerValue(compressed.length),
        sha256: { stringValue: sha256 },
        updatedAt: { stringValue: new Date().toISOString() },
      },
    },
  }]);

  console.log(`Firestore snapshot published successfully (${chunks.length} chunk(s), ${databaseBytes.length} bytes).`);
}

main().catch((error) => {
  console.error(`Snapshot import failed: ${error.message}`);
  process.exitCode = 1;
});
