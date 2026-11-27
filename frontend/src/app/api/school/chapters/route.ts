import { NextRequest, NextResponse } from "next/server";
import { initialSchoolChapters } from "@/lib/platformData";
import { proxyBackendRequest } from "@/lib/backendProxy";

export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return NextResponse.json({ detail: "API service is not configured" }, { status: 503 });
  try {
    const response = await fetch(`${backendUrl}/api/school/chapters`, { cache: "no-store", signal: AbortSignal.timeout(10000) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json(data, { status: response.status });
    const byId = new Map<string, any>();
    for (const chapter of initialSchoolChapters) byId.set(chapter.id, chapter);
    for (const chapter of Array.isArray(data.chapters) ? data.chapters : []) byId.set(chapter.id, chapter);
    let chapters = [...byId.values()];
    const params = request.nextUrl.searchParams;
    const board = params.get("board");
    const classLevel = params.get("class");
    const subject = params.get("subject");
    if (board && board !== "ALL") chapters = chapters.filter((c: any) => c.board_code.toLowerCase() === board.toLowerCase());
    if (classLevel && classLevel !== "ALL") chapters = chapters.filter((c: any) => c.class_level === classLevel);
    if (subject && subject !== "ALL") chapters = chapters.filter((c: any) => c.subject.toLowerCase().includes(subject.toLowerCase()));
    return NextResponse.json({ success: true, total: chapters.length, chapters }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ detail: "API service is unavailable" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  return proxyBackendRequest(request, "/api/school/chapters", "admin");
}
