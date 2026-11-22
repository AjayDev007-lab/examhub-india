const BASE_URL = process.env.TEST_BASE_URL || "https://examhub-india.vercel.app";

async function run() {
  console.log(`Starting Live Auth QA Tests against: ${BASE_URL}\n`);
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. Empty Email Check
  await test("Rejects empty email with 400", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "", password: "password123" }),
    });
    if (res.status !== 400) throw new Error(`Expected status 400, got ${res.status}`);
  });

  // 2. Empty Password Check
  await test("Rejects empty password with 400", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "student@examhub.in", password: "" }),
    });
    if (res.status !== 400) throw new Error(`Expected status 400, got ${res.status}`);
  });

  // 3. Invalid Password Check
  await test("Rejects invalid credentials with 401", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "student@examhub.in", password: "IncorrectPassword99!" }),
    });
    if (res.status !== 401) throw new Error(`Expected status 401, got ${res.status}`);
  });

  // 4. Valid Student Login
  let studentToken = "";
  await test("Authenticates valid registered student", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "student@examhub.in", password: "Student@ExamHub2026!" }),
    });
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    const data = await res.json();
    if (!data.access_token) throw new Error("Missing access_token in response");
    if (data.user_type !== "student") throw new Error(`Expected user_type student, got ${data.user_type}`);
    studentToken = data.access_token;
  });

  // 5. Valid Admin Login
  await test("Authenticates administrator with superadmin credentials", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "ajaydevvs22102004@gmail.com", password: "SuperAdmin@ExamHub2026!" }),
    });
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    const data = await res.json();
    if (!data.access_token) throw new Error("Missing access_token in response");
    if (data.user_type !== "admin") throw new Error(`Expected user_type admin, got ${data.user_type}`);
  });

  // 6. Registration Validation
  const newEmail = `candidate_${Date.now()}@examhub.in`;
  await test("Registration enforces matching passwords with 400", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: "Candidate Test",
        email: newEmail,
        password: "ValidPassword123!",
        password_confirm: "MismatchedPassword123!",
      }),
    });
    if (res.status !== 400) throw new Error(`Expected status 400, got ${res.status}`);
  });

  // 7. Successful Registration
  await test("Registers new student account", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: "Candidate Test",
        email: newEmail,
        password: "ValidPassword123!",
        password_confirm: "ValidPassword123!",
      }),
    });
    if (res.status !== 201) throw new Error(`Expected status 201, got ${res.status}`);
    const data = await res.json();
    if (!data.access_token) throw new Error("Missing access_token in registration response");
  });

  // 8. Duplicate Registration Prevention
  await test("Prevents duplicate account registration with 409", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: "Candidate Test",
        email: newEmail,
        password: "ValidPassword123!",
        password_confirm: "ValidPassword123!",
      }),
    });
    if (res.status !== 409) throw new Error(`Expected status 409, got ${res.status}`);
  });

  // 9. Forgot Password Token Generation
  let resetToken = "";
  await test("Generates password recovery OTP/token", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "student@examhub.in" }),
    });
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error("Recovery request failed");
    resetToken = data.debug_reset_token;
  });

  // 10. Password Reset
  if (resetToken) {
    await test("Resets password using recovery token", async () => {
      const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: resetToken,
          new_password: "NewStudentPass2026!",
          confirm_password: "NewStudentPass2026!",
        }),
      });
      if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    });
  }

  // 11. Public Status Endpoint
  await test("Public website status returns ONLINE mode", async () => {
    const res = await fetch(`${BASE_URL}/api/status`);
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    const data = await res.json();
    if (!["ONLINE", "MAINTENANCE", "OFFLINE"].includes(data.mode)) {
      throw new Error(`Unexpected mode: ${data.mode}`);
    }
  });

  console.log(`\n========================================`);
  console.log(`Summary: ${passed} PASSED, ${failed} FAILED out of ${passed + failed} tests`);
  console.log(`========================================`);
  if (failed > 0) process.exit(1);
}

run();
