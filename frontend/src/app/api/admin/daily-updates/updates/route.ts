import { NextResponse, NextRequest } from "next/server";
import { INITIAL_DETECTED_UPDATES, DetectedUpdate } from "@/lib/dailyUpdatesData";

let updatesStore = [...INITIAL_DETECTED_UPDATES];

export async function GET(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${backendUrl}/api/admin/daily-updates/updates${req.nextUrl.search}`, { cache: "no-store" });
    if (res.ok) return NextResponse.json(await res.json());
  } catch (_) {}

  const category = req.nextUrl.searchParams.get("category");
  const status = req.nextUrl.searchParams.get("verification_status");
  const badge = req.nextUrl.searchParams.get("badge");
  const search = req.nextUrl.searchParams.get("search")?.toLowerCase() || "";

  let list = updatesStore;
  if (category && category !== "ALL") list = list.filter(u => u.category === category);
  if (status && status !== "ALL") list = list.filter(u => u.verification_status === status);
  if (badge && badge !== "ALL") list = list.filter(u => u.verification_badge === badge);
  if (search) {
    list = list.filter(u => u.title.toLowerCase().includes(search) || u.organization.toLowerCase().includes(search));
  }

  return NextResponse.json({ total: list.length, updates: list });
}
