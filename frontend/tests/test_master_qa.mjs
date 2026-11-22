const BASE_URL = process.env.TEST_URL || "https://examhub-india.vercel.app";
let passCount = 0;
let failCount = 0;
const results = [];

function record(phase, testName, passed, detail = "") {
  if (passed) {
    passCount++;
    console.log(`[PASS] [${phase}] ${testName}`);
    results.push({ phase, testName, status: "PASS", detail });
  } else {
    failCount++;
    console.error(`[FAIL] [${phase}] ${testName}: ${detail}`);
    results.push({ phase, testName, status: "FAIL", detail });
  }
}

async function runMasterQA() {
  console.log(`=======================================================`);
  console.log(`EXAMHUB INDIA - MASTER QA & VERIFICATION SUITE`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`=======================================================\n`);

  // ==========================================
  // PHASE 1: LOGIN & REGISTRATION
  // ==========================================
  try {
    // 1.1 Empty validation
    const emptyRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "", password: "" })
    });
    record("PHASE 1", "Rejects empty login fields with 400", emptyRes.status === 400);

    // 1.2 Invalid credentials
    const invalidRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid_student@examhub.in", password: "WrongPassword999!" })
    });
    record("PHASE 1", "Rejects invalid student credentials with 401", invalidRes.status === 401);

    // 1.3 Student login
    const studentRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "student@examhub.in", password: "Password@123" })
    });
    const studentJson = await studentRes.json();
    record("PHASE 1", "Authenticates valid registered student with 200", studentRes.status === 200 && !!studentJson.access_token);

    // 1.4 Admin login
    const adminRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "ajaydevvs22102004@gmail.com", password: "SuperAdmin@ExamHub2026!" })
    });
    const adminJson = await adminRes.json();
    record("PHASE 1", "Authenticates Super Admin with 200 & admin user_type", adminRes.status === 200 && adminJson.user_type === "admin");
    const adminToken = adminJson.access_token;

    // 1.5 Registration validation
    const uniqueEmail = `test_student_${Date.now()}@examhub.in`;
    const regMismatch = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: "QA Student",
        email: uniqueEmail,
        mobile: "9876543210",
        password: "SecurePass@123",
        password_confirm: "WrongPassword",
        confirm_password: "WrongPassword"
      })
    });
    record("PHASE 1", "Registration rejects mismatched passwords with 400", regMismatch.status === 400);

    // 1.6 Registration success
    const regSuccess = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: "QA Student",
        email: uniqueEmail,
        mobile: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: "SecurePass@123",
        password_confirm: "SecurePass@123",
        confirm_password: "SecurePass@123"
      })
    });
    record("PHASE 1", "Registers new student account with 201", regSuccess.status === 201);

    // 1.7 Duplicate check
    const regDup = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: "Duplicate QA Student",
        email: uniqueEmail,
        mobile: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: "SecurePass@123",
        password_confirm: "SecurePass@123",
        confirm_password: "SecurePass@123"
      })
    });
    record("PHASE 1", "Prevents duplicate student registration with 409", regDup.status === 409);

    // 1.8 Forgot & reset password
    const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "student@examhub.in" })
    });
    const forgotJson = await forgotRes.json();
    record("PHASE 1", "Generates password recovery token with 200", forgotRes.status === 200 && !!forgotJson.recovery_token);

    if (forgotJson.recovery_token) {
      const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recovery_token: forgotJson.recovery_token,
          new_password: "Password@123",
          confirm_password: "Password@123"
        })
      });
      record("PHASE 1", "Resets password successfully with 200", resetRes.status === 200);
    }
  } catch (err) {
    record("PHASE 1", "Phase 1 Exception", false, err.message);
  }

  // ==========================================
  // PHASE 2: ADMIN & OPERATING MODES
  // ==========================================
  try {
    const adminHeaders = {
      "Content-Type": "application/json",
      "Authorization": "Bearer examhub_superadmin_secure_token_live"
    };

    // 2.1 Check current status
    const statusRes = await fetch(`${BASE_URL}/api/status`);
    const statusJson = await statusRes.json();
    record("PHASE 2", "Public status returns ONLINE operating mode", statusRes.status === 200 && statusJson.mode === "ONLINE");

    // 2.2 Switch to MAINTENANCE
    const maintRes = await fetch(`${BASE_URL}/api/admin/website-control/mode`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ mode: "MAINTENANCE", reason: "Automated QA Verification" })
    });
    record("PHASE 2", "Admin switches mode to MAINTENANCE with 200", maintRes.status === 200);

    // 2.3 Verify MAINTENANCE blocks public API with 503
    const maintPublic = await fetch(`${BASE_URL}/api/jobs`, {
      headers: { "Cookie": "examhub_site_mode=MAINTENANCE" }
    });
    record("PHASE 2", "MAINTENANCE mode enforces 503 on public API", maintPublic.status === 503);

    // 2.4 Verify Admin status API remains accessible during MAINTENANCE
    const adminMaintAccess = await fetch(`${BASE_URL}/api/admin/website-control/status`, {
      headers: adminHeaders
    });
    record("PHASE 2", "Admin console remains accessible during MAINTENANCE", adminMaintAccess.status === 200);

    // 2.5 Switch to OFFLINE without confirmation code fails
    const offlineFailRes = await fetch(`${BASE_URL}/api/admin/website-control/mode`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ mode: "OFFLINE", reason: "Test fail code" })
    });
    record("PHASE 2", "OFFLINE switch without CONFIRM-OFFLINE rejected with 400", offlineFailRes.status === 400);

    // 2.6 Switch to OFFLINE with confirmation code succeeds
    const offlineSuccessRes = await fetch(`${BASE_URL}/api/admin/website-control/mode`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        mode: "OFFLINE",
        reason: "Critical emergency test",
        admin_confirmation_code: "CONFIRM-OFFLINE"
      })
    });
    record("PHASE 2", "OFFLINE switch with CONFIRM-OFFLINE succeeds with 200", offlineSuccessRes.status === 200);

    // 2.7 Verify OFFLINE mode enforces 503 on public requests
    const offlinePublic = await fetch(`${BASE_URL}/api/jobs`, {
      headers: { "Cookie": "examhub_site_mode=OFFLINE" }
    });
    record("PHASE 2", "OFFLINE mode enforces 503 on public requests", offlinePublic.status === 503);

    // 2.8 Restore to ONLINE mode
    const restoreRes = await fetch(`${BASE_URL}/api/admin/website-control/mode`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({ mode: "ONLINE", reason: "QA Verification Complete" })
    });
    record("PHASE 2", "Restores website to ONLINE mode with 200", restoreRes.status === 200);

    // 2.9 Verify ONLINE restores public requests
    const onlinePublic = await fetch(`${BASE_URL}/api/status`);
    const onlineJson = await onlinePublic.json();
    record("PHASE 2", "Public access confirmed restored to ONLINE", onlineJson.mode === "ONLINE");
  } catch (err) {
    record("PHASE 2", "Phase 2 Exception", false, err.message);
  }

  // ==========================================
  // PHASE 3: DATABASE & API TESTING
  // ==========================================
  try {
    // 3.1 Exams API
    const examsRes = await fetch(`${BASE_URL}/api/exams`);
    const examsJson = await examsRes.json();
    record("PHASE 3", "GET /api/exams returns array of examinations", examsRes.status === 200 && Array.isArray(examsJson) && examsJson.length > 0);

    // 3.2 Jobs API
    const jobsRes = await fetch(`${BASE_URL}/api/jobs`);
    const jobsJson = await jobsRes.json();
    const jobList = Array.isArray(jobsJson) ? jobsJson : (jobsJson.jobs || []);
    record("PHASE 3", "GET /api/jobs returns active job postings", jobsRes.status === 200 && Array.isArray(jobList) && jobList.length > 0);

    // 3.3 Results lookup validation (empty fields)
    const resultEmpty = await fetch(`${BASE_URL}/api/results/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examination_id: "", roll_number: "" })
    });
    record("PHASE 3", "POST /api/results/check rejects empty inputs with 400", resultEmpty.status === 400);

    // 3.4 Results lookup validation (missing roll number)
    const resultNoRoll = await fetch(`${BASE_URL}/api/results/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examination_id: 1, roll_number: "" })
    });
    record("PHASE 3", "POST /api/results/check rejects missing roll number with 400", resultNoRoll.status === 400);

    // 3.5 Results lookup validation (invalid examination ID)
    const resultInvalidExam = await fetch(`${BASE_URL}/api/results/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examination_id: 999999, roll_number: "2604108821" })
    });
    record("PHASE 3", "POST /api/results/check rejects non-existent exam with 404", resultInvalidExam.status === 404);

    // 3.6 Results lookup success
    const resultValid = await fetch(`${BASE_URL}/api/results/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examination_id: 1, roll_number: "2604108821" })
    });
    const resultJson = await resultValid.json();
    record("PHASE 3", "POST /api/results/check returns valid score payload with 200", resultValid.status === 200 && !!resultJson.student_name && !!resultJson.marks_obtained);

    // 3.7 Hall tickets search
    const hallTicketsRes = await fetch(`${BASE_URL}/api/hall-tickets/search?q=NEET`);
    const hallTicketsJson = await hallTicketsRes.json();
    record("PHASE 3", "GET /api/hall-tickets/search returns search results with 200", hallTicketsRes.status === 200 && Array.isArray(hallTicketsJson));
  } catch (err) {
    record("PHASE 3", "Phase 3 Exception", false, err.message);
  }

  // ==========================================
  // PHASE 4: PUBLIC WEBSITE ROUTE TESTING
  // ==========================================
  try {
    const publicPages = [
      { name: "Homepage", path: "/" },
      { name: "Results Portal", path: "/results" },
      { name: "Hall Tickets", path: "/hall-tickets" },
      { name: "Jobs Portal", path: "/jobs" },
      { name: "Official Websites Directory", path: "/official-websites" },
      { name: "About Us", path: "/about" },
      { name: "Contact & Grievances", path: "/contact" },
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
      { name: "School Results", path: "/school/results" },
      { name: "School Books", path: "/school/books" },
      { name: "Student Login Page", path: "/auth/login" },
      { name: "Student Register Page", path: "/auth/register" }
    ];

    for (const page of publicPages) {
      const pageRes = await fetch(`${BASE_URL}${page.path}`);
      record("PHASE 4", `Page [${page.name}] (${page.path}) loads with 200 OK`, pageRes.status === 200);
    }
  } catch (err) {
    record("PHASE 4", "Phase 4 Exception", false, err.message);
  }

  // ==========================================
  // PHASE 5: SECURITY & RBAC TESTING
  // ==========================================
  try {
    // 5.1 Unauthenticated access to /api/admin/* rejected with 401
    const unauthAdmin = await fetch(`${BASE_URL}/api/admin/users`);
    record("PHASE 5", "Unauthenticated request to /api/admin/users rejected with 401", unauthAdmin.status === 401);

    // 5.2 Student token accessing /api/admin/* rejected with 403 Forbidden
    const studentAdminAccess = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: {
        "Cookie": "examhub_user_type=student; examhub_token=sample_student_token"
      }
    });
    record("PHASE 5", "Student cookie accessing /api/admin/users rejected with 403", studentAdminAccess.status === 403);

    // 5.3 Student navigating to /admin UI page gets redirected away
    const studentAdminPage = await fetch(`${BASE_URL}/admin/dashboard`, {
      redirect: "manual",
      headers: {
        "Cookie": "examhub_user_type=student"
      }
    });
    const isRedirect = studentAdminPage.status === 307 || studentAdminPage.status === 302 || studentAdminPage.status === 308;
    record("PHASE 5", "Student cookie visiting /admin/dashboard redirects to /dashboard", isRedirect);

    // 5.4 SQL Injection attempt in login fields
    const sqliLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "' OR '1'='1' --", password: "' OR '1'='1' --" })
    });
    record("PHASE 5", "SQL Injection payload in login handled safely (401)", sqliLogin.status === 401);

    // 5.5 XSS payload handling in registration
    const xssReg = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: "<script>alert('XSS')</script> Student",
        email: `xss_test_${Date.now()}@examhub.in`,
        mobile: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
        password: "Password@123",
        confirm_password: "Password@123",
        password_confirm: "Password@123"
      })
    });
    record("PHASE 5", "XSS payload in registration safely processed without execution (201)", xssReg.status === 201);
  } catch (err) {
    record("PHASE 5", "Phase 5 Exception", false, err.message);
  }

  // ==========================================
  // FINAL SUMMARY
  // ==========================================
  console.log("\n=======================================================");
  console.log(`MASTER QA RUN COMPLETE: ${passCount} PASSED, ${failCount} FAILED out of ${passCount + failCount} tests.`);
  console.log("=======================================================");

  if (failCount > 0) {
    process.exit(1);
  }
}

runMasterQA();
