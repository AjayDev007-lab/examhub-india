import { NextResponse } from "next/server";
import { INITIAL_SCHEDULES } from "@/lib/dailyUpdatesData";

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${backendUrl}/api/admin/daily-updates/schedules`, { cache: "no-store" });
    if (res.ok) return NextResponse.json(await res.json());
  } catch (_) {}

  return NextResponse.json({ schedules: INITIAL_SCHEDULES });
}
