import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const emailClean = (email || "").trim().toLowerCase();
    
    // SuperAdmin credentials check
    if (
      emailClean === "superadmin@examhub.gov.in" &&
      (password === "SuperAdmin@ExamHub2026!" || password === "superadmin")
    ) {
      return NextResponse.json({
        access_token: "examhub_superadmin_secure_token_" + Date.now(),
        token_type: "bearer",
        user_type: "admin",
        user: {
          id: 1,
          full_name: "ExamHub Super Administrator",
          email: "superadmin@examhub.gov.in",
          role: "SUPER_ADMIN"
        }
      });
    }

    return NextResponse.json(
      { detail: "Invalid administrator credentials" },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Login failed" }, { status: 500 });
  }
}
