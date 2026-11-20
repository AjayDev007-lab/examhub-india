import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, new_password, confirm_password } = body;

    if (!token) {
      return NextResponse.json({ detail: "Recovery token is required" }, { status: 400 });
    }

    if (new_password !== confirm_password) {
      return NextResponse.json({ detail: "Passwords do not match" }, { status: 400 });
    }

    if (!new_password || new_password.length < 8) {
      return NextResponse.json({ detail: "Password must be at least 8 characters" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Password successfully reset. You may now log in with your new credentials."
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Reset failed" }, { status: 500 });
  }
}
