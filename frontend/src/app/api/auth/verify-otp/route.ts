import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const mobile = (body.mobile || "").trim();
    const otp = (body.otp || "").trim();

    if (!mobile || !otp) {
      return NextResponse.json({ detail: "Mobile and OTP are required" }, { status: 400 });
    }

    // Verify OTP format (accept valid demo OTP 123456 or 6 digits)
    if (otp !== "123456" && otp.length !== 6) {
      return NextResponse.json({ detail: "Invalid or expired OTP" }, { status: 400 });
    }

    let user = dbStore.students.find(s => s.mobile === mobile);
    if (!user) {
      user = {
        id: dbStore.students.length + 1,
        full_name: `Student ${mobile.slice(-4)}`,
        email: `${mobile}@student.examhub.in`,
        mobile: mobile,
        is_active: true,
        is_verified: true,
        mobile_verified: true,
        created_at: new Date().toISOString()
      };
      dbStore.students.push(user);
    } else {
      user.mobile_verified = true;
    }

    return NextResponse.json({
      access_token: "student_jwt_token_" + Date.now(),
      token_type: "bearer",
      user_type: "student",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        mobile: user.mobile,
        is_verified: user.is_verified,
        mobile_verified: user.mobile_verified
      }
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "OTP verification failed" }, { status: 500 });
  }
}
