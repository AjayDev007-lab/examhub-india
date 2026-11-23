import { NextRequest, NextResponse } from "next/server";
import { 
  sendTelegramAdminAlert, 
  formatStudentRegistrationAdminAlert 
} from "@/lib/telegramManager";

// POST /api/auth/register-notify - Dispatches private notification to admin when student registers
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, mobile, uid } = body;

    if (!fullName || !email) {
      return NextResponse.json({ success: false, error: "Missing required student details." }, { status: 400 });
    }

    const alertMessage = formatStudentRegistrationAdminAlert({
      fullName: String(fullName).trim(),
      email: String(email).trim(),
      mobile: mobile ? String(mobile).trim() : undefined,
      uid: uid ? String(uid).trim() : undefined,
      createdAt: new Date().toISOString()
    });

    const result = await sendTelegramAdminAlert(alertMessage);

    return NextResponse.json({
      success: result.success,
      status: result.status,
      message: result.message
    });
  } catch (err: any) {
    // Non-blocking: registration must not fail even if Telegram network has a transient glitch
    return NextResponse.json({ success: false, error: err.message }, { status: 200 });
  }
}
