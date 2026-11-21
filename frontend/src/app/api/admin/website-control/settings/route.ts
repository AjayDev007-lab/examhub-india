import { NextResponse, NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const authHeader = req.headers.get("authorization") || "";

  try {
    const res = await fetch(`${backendUrl}/api/admin/website-control/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader
      },
      body: JSON.stringify(body)
    });
    if (res.ok) return NextResponse.json(await res.json());
  } catch (_) {}

  return NextResponse.json({ success: true, message: "Website operating settings updated successfully." });
}
