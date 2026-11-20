import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = (body.identifier || "").trim().toLowerCase();

    const user = dbStore.students.find(s => s.email.toLowerCase() === identifier || s.mobile === identifier);
    const debugToken = user ? "token_demo_recovery_" + Date.now() : null;

    return NextResponse.json({
      success: true,
      message: "If an account matches your details, recovery instructions have been dispatched.",
      debug_reset_token: debugToken
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed" }, { status: 500 });
  }
}
