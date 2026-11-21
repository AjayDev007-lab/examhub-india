import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const authHeader = req.headers.get("authorization") || "";

  try {
    const res = await fetch(`${backendUrl}/api/admin/website-control/mode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader
      },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    const err = await res.json();
    return NextResponse.json(err, { status: res.status });
  } catch (_) {}

  if (body.mode === "OFFLINE" && body.admin_confirmation_code !== "CONFIRM-OFFLINE") {
    return NextResponse.json({ detail: "Taking website OFFLINE requires strict confirmation code: 'CONFIRM-OFFLINE'." }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    previous_mode: "ONLINE",
    current_mode: body.mode,
    message: `Website operating mode successfully changed to ${body.mode}.`
  });
}
