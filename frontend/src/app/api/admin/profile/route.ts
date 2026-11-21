import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET() {
  const admin = (dbStore as any).adminProfile || {
    id: 1,
    full_name: "ExamHub Super Administrator",
    email: "superadmin@examhub.gov.in",
    role: "SUPER_ADMIN"
  };

  return NextResponse.json({
    id: admin.id || 1,
    full_name: admin.full_name,
    email: admin.email,
    role_name: admin.role,
    is_active: true
  });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ detail: "A valid email address is required" }, { status: 400 });
    }

    if (!dbStore.adminProfile) {
      dbStore.adminProfile = {
        id: 1,
        full_name: "ExamHub Super Administrator",
        email: "superadmin@examhub.gov.in",
        password: "SuperAdmin@ExamHub2026!",
        role: "SUPER_ADMIN"
      };
    }

    if (full_name && full_name.trim()) {
      dbStore.adminProfile.full_name = full_name.trim();
    }
    if (email && email.trim()) {
      dbStore.adminProfile.email = email.trim().toLowerCase();
    }

    return NextResponse.json({
      id: dbStore.adminProfile.id,
      full_name: dbStore.adminProfile.full_name,
      email: dbStore.adminProfile.email,
      role_name: dbStore.adminProfile.role,
      is_active: true
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to update admin profile" }, { status: 500 });
  }
}
