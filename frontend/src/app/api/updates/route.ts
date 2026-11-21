import { NextResponse, NextRequest } from "next/server";
import { INITIAL_DETECTED_UPDATES } from "@/lib/dailyUpdatesData";

export async function GET(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${backendUrl}/api/updates${req.nextUrl.search}`, { cache: "no-store" });
    if (res.ok) return NextResponse.json(await res.json());
  } catch (_) {}

  const category = req.nextUrl.searchParams.get("category");
  const badge = req.nextUrl.searchParams.get("badge");
  const closingSoon = req.nextUrl.searchParams.get("closing_soon");
  const search = req.nextUrl.searchParams.get("search")?.toLowerCase() || "";

  let list = INITIAL_DETECTED_UPDATES.filter(u => u.verification_status === "PUBLISHED");
  if (category && category !== "ALL") list = list.filter(u => u.category === category);
  if (badge && badge !== "ALL") list = list.filter(u => u.verification_badge === badge);
  if (closingSoon === "true") list = list.filter(u => u.is_closing_soon);
  if (search) {
    list = list.filter(u => u.title.toLowerCase().includes(search) || u.organization.toLowerCase().includes(search));
  }

  return NextResponse.json({ total: list.length, updates: list });
}
