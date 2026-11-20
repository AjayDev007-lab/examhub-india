import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const mobile = (body.mobile || "").trim();

    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json({ detail: "Please enter a valid 10-digit Indian mobile number" }, { status: 400 });
    }

    // Deterministic test code for standard demo number, else random 6-digits
    const otp = mobile === "9876543210" ? "123456" : `${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${mobile.slice(0, 2)}******${mobile.slice(-2)}. Valid for 5 minutes.`,
      debug_demo_otp: otp
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to send OTP" }, { status: 500 });
  }
}
