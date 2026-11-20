import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email, mobile, password, password_confirm } = body;

    if (!full_name || !email || !password) {
      return NextResponse.json({ detail: "Full name, email and password are required" }, { status: 400 });
    }

    if (password !== password_confirm) {
      return NextResponse.json({ detail: "Passwords do not match" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ detail: "Password must be at least 8 characters" }, { status: 400 });
    }

    const emailClean = email.trim().toLowerCase();
    const existing = dbStore.students.find(s => s.email.toLowerCase() === emailClean);
    if (existing) {
      return NextResponse.json({ detail: "An account with this email already exists" }, { status: 409 });
    }

    if (mobile) {
      const mobileClean = mobile.trim();
      const existingMobile = dbStore.students.find(s => s.mobile === mobileClean);
      if (existingMobile) {
        return NextResponse.json({ detail: "An account with this mobile number already exists" }, { status: 409 });
      }
    }

    const newUser = {
      id: dbStore.students.length + 1,
      full_name: full_name.trim(),
      email: emailClean,
      mobile: mobile ? mobile.trim() : null,
      is_active: true,
      is_verified: false,
      mobile_verified: false,
      created_at: new Date().toISOString()
    };

    dbStore.students.push(newUser);

    return NextResponse.json({
      access_token: "student_jwt_token_" + Date.now(),
      token_type: "bearer",
      user_type: "student",
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        mobile: newUser.mobile,
        is_verified: newUser.is_verified,
        mobile_verified: newUser.mobile_verified
      }
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Registration failed" }, { status: 500 });
  }
}
