import test from "node:test";
import assert from "node:assert/strict";

// Import route handlers
import { POST as loginPOST } from "../src/app/api/auth/login/route";
import { POST as registerPOST } from "../src/app/api/auth/register/route";
import { POST as forgotPasswordPOST } from "../src/app/api/auth/forgot-password/route";
import { POST as resetPasswordPOST } from "../src/app/api/auth/reset-password/route";

function createJsonRequest(url: string, body: any): Request {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("Phase 1: Authentication - Login Button & Credentials Validation", async (t) => {
  await t.test("Rejects empty email with 400", async () => {
    const req = createJsonRequest("http://localhost/api/auth/login", { email: "", password: "any" });
    const res = await loginPOST(req);
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.detail, /enter both email and password/i);
  });

  await t.test("Rejects empty password with 400", async () => {
    const req = createJsonRequest("http://localhost/api/auth/login", { email: "student@examhub.in", password: "" });
    const res = await loginPOST(req);
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.detail, /enter both email and password/i);
  });

  await t.test("Rejects invalid credentials with 401", async () => {
    const req = createJsonRequest("http://localhost/api/auth/login", {
      email: "student@examhub.in",
      password: "WrongPassword999!",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.match(data.detail, /Incorrect password/i);
  });

  await t.test("Authenticates registered student and returns student token", async () => {
    const req = createJsonRequest("http://localhost/api/auth/login", {
      email: "student@examhub.in",
      password: "Student@ExamHub2026!",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.access_token);
    assert.equal(data.user_type, "student");
    assert.equal(data.user.email, "student@examhub.in");
  });

  await t.test("Authenticates administrator and returns admin token", async () => {
    const req = createJsonRequest("http://localhost/api/auth/login", {
      email: "ajaydevvs22102004@gmail.com",
      password: "SuperAdmin@ExamHub2026!",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.access_token);
    assert.equal(data.user_type, "admin");
    assert.equal(data.user.role, "SUPER_ADMIN");
  });
});

test("Phase 1: Registration - Validation & Duplicate Prevention", async (t) => {
  const uniqueEmail = `qa_student_${Date.now()}@examhub.in`;

  await t.test("Validates password mismatch with 400", async () => {
    const req = createJsonRequest("http://localhost/api/auth/register", {
      full_name: "QA Candidate",
      email: uniqueEmail,
      password: "SecurePassword123!",
      password_confirm: "DifferentPassword123!",
    });
    const res = await registerPOST(req);
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.detail, /passwords do not match/i);
  });

  await t.test("Enforces minimum 8 characters password with 400", async () => {
    const req = createJsonRequest("http://localhost/api/auth/register", {
      full_name: "QA Candidate",
      email: uniqueEmail,
      password: "short",
      password_confirm: "short",
    });
    const res = await registerPOST(req);
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.detail, /at least 8 characters/i);
  });

  await t.test("Successfully registers student and returns session token", async () => {
    const req = createJsonRequest("http://localhost/api/auth/register", {
      full_name: "QA Candidate",
      email: uniqueEmail,
      mobile: `99${Date.now().toString().slice(-8)}`,
      password: "SecurePassword123!",
      password_confirm: "SecurePassword123!",
    });
    const res = await registerPOST(req);
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.access_token);
    assert.equal(data.user_type, "student");
    assert.equal(data.user.email, uniqueEmail);
  });

  await t.test("Prevents duplicate account registration with 409", async () => {
    const req = createJsonRequest("http://localhost/api/auth/register", {
      full_name: "QA Candidate",
      email: uniqueEmail,
      password: "SecurePassword123!",
      password_confirm: "SecurePassword123!",
    });
    const res = await registerPOST(req);
    assert.equal(res.status, 409);
    const data = await res.json();
    assert.match(data.detail, /already exists/i);
  });

  await t.test("Newly registered student can immediately log in", async () => {
    const req = createJsonRequest("http://localhost/api/auth/login", {
      email: uniqueEmail,
      password: "SecurePassword123!",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.access_token);
    assert.equal(data.user.email, uniqueEmail);
  });
});

test("Phase 1: Password Recovery & Reset Flow", async (t) => {
  let recoveryToken = "";

  await t.test("Requests recovery OTP/token for registered account", async () => {
    const req = createJsonRequest("http://localhost/api/auth/forgot-password", {
      identifier: "student@examhub.in",
    });
    const res = await forgotPasswordPOST(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.debug_reset_token);
    recoveryToken = data.debug_reset_token;
  });

  await t.test("Rejects password reset with invalid/mismatched password", async () => {
    const req = createJsonRequest("http://localhost/api/auth/reset-password", {
      token: recoveryToken,
      new_password: "NewPassword2026!",
      confirm_password: "MismatchedPassword2026!",
    });
    const res = await resetPasswordPOST(req);
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.detail, /passwords do not match/i);
  });

  await t.test("Successfully resets password using valid recovery token", async () => {
    const req = createJsonRequest("http://localhost/api/auth/reset-password", {
      token: recoveryToken,
      new_password: "UpdatedStudentPass2026!",
      confirm_password: "UpdatedStudentPass2026!",
    });
    const res = await resetPasswordPOST(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
  });

  await t.test("Student can log in using their newly updated password", async () => {
    const req = createJsonRequest("http://localhost/api/auth/login", {
      email: "student@examhub.in",
      password: "UpdatedStudentPass2026!",
    });
    const res = await loginPOST(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.access_token);
    assert.equal(data.user.email, "student@examhub.in");
  });
});
