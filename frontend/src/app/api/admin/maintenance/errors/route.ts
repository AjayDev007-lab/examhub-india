import { NextResponse } from "next/server";
import { INITIAL_ERRORS } from "@/lib/maintenanceData";

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${backendUrl}/api/admin/maintenance/errors`, { cache: "no-store" });
    if (res.ok) return NextResponse.json(await res.json());
  } catch (_) {}

  return NextResponse.json({ total: INITIAL_ERRORS.length, errors: INITIAL_ERRORS });
}
