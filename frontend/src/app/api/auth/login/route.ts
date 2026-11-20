import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const emailClean = (email || "").trim().toLowerCase();
    if (
      emailClean === "student@examhub.in" && 
      (password === "Student@ExamHub2026!" || password === "StudentPass@2026!")
    ) {
      return NextResponse.json({
        access_token: "student_jwt_token_" + Date.now(),
        token_type: "bearer",
        user_type: "student",
        user: {
          id: 1,
          full_name: "Aditya Sharma",
          email: "student@examhub.in",
          mobile: "9876543210",
          is_verified: true
        }
      });
    }

    return NextResponse.json({ detail: "Invalid email or password" }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Login failed" }, { status: 500 });
  }
}
