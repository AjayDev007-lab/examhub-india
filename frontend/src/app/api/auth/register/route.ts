import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email, mobile, password, password_confirm } = body;

    if (!full_name || !full_name.trim()) {
      return NextResponse.json({ detail: "Please enter your full name." }, { status: 400 });
    }

    if (!email || !email.trim() || !email.includes("@")) {
      return NextResponse.json({ detail: "Please enter a valid email address." }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ detail: "Password must be at least 8 characters long." }, { status: 400 });
    }

    if (password !== password_confirm) {
      return NextResponse.json({ detail: "Passwords do not match." }, { status: 400 });
    }

    const emailClean = email.trim().toLowerCase();

    // Check duplicate email in dbStore
    const existing = dbStore.students.find((s) => s.email.toLowerCase() === emailClean);
    if (existing) {
      return NextResponse.json(
        { detail: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // Check duplicate mobile in dbStore
    if (mobile && mobile.trim()) {
      const mobileClean = mobile.trim();
      const existingMobile = dbStore.students.find((s) => s.mobile === mobileClean);
      if (existingMobile) {
        return NextResponse.json(
          { detail: "An account with this mobile number already exists." },
          { status: 409 }
        );
      }
    }

    // 1. Try forwarding to FastAPI backend if available
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: full_name.trim(),
          email: emailClean,
          mobile: mobile ? mobile.trim() : undefined,
          password: password,
          password_confirm: password_confirm,
        }),
        signal: AbortSignal.timeout(2000),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        // Also register in local dbStore for synchronized frontend state
        dbStore.students.push({
          id: data.user?.id || dbStore.students.length + 1,
          full_name: full_name.trim(),
          email: emailClean,
          mobile: mobile ? mobile.trim() : null,
          password: password,
          is_active: true,
          is_verified: true,
          mobile_verified: Boolean(mobile),
          created_at: new Date().toISOString(),
        } as any);
        return NextResponse.json(data, { status: 201 });
      } else if (backendRes.status === 409 || backendRes.status === 400) {
        const errData = await backendRes.json().catch(() => ({}));
        return NextResponse.json(
          { detail: errData.detail || "Registration rejected" },
          { status: backendRes.status }
        );
      }
    } catch (_) {
      // Backend not running locally; proceed with local store registration
    }

    // 2. Standalone registration in dbStore
    const newUser = {
      id: dbStore.students.length + 1,
      full_name: full_name.trim(),
      email: emailClean,
      mobile: mobile ? mobile.trim() : null,
      password: password,
      is_active: true,
      is_verified: true,
      mobile_verified: Boolean(mobile),
      created_at: new Date().toISOString(),
    };

    dbStore.students.push(newUser as any);

    return NextResponse.json(
      {
        access_token: "student_jwt_token_" + Date.now(),
        token_type: "bearer",
        user_type: "student",
        user: {
          id: newUser.id,
          full_name: newUser.full_name,
          email: newUser.email,
          mobile: newUser.mobile,
          is_verified: newUser.is_verified,
          mobile_verified: newUser.mobile_verified,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Registration failed" }, { status: 500 });
  }
}
