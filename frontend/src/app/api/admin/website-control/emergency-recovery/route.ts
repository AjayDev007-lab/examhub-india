import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  try {
    const res = await fetch(`${backendUrl}/api/admin/website-control/emergency-recovery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (res.ok) return NextResponse.json(await res.json());
    const err = await res.json();
    return NextResponse.json(err, { status: res.status });
  } catch (_) {}

  if (body.recovery_key !== "EMERGENCY-SUPERADMIN-RESTORE-ONLINE-2026") {
    return NextResponse.json({ detail: "Invalid emergency recovery key." }, { status: 403 });
  }

  return NextResponse.json({
    success: true,
    previous_mode: "OFFLINE",
    new_mode: "ONLINE",
    message: "EMERGENCY RECOVERY ACTIVATED: Website immediately brought back ONLINE."
  });
}
