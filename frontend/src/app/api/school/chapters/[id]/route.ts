import { NextRequest, NextResponse } from "next/server";
import { initialSchoolChapters } from "@/lib/platformData";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return NextResponse.json({ detail: "API service is not configured" }, { status: 503 });
  try {
    const response = await fetch(`${backendUrl}/api/school/chapters/${encodeURIComponent(id)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (response.ok) return new NextResponse(response.body, { status: response.status, headers: { "content-type": response.headers.get("content-type") || "application/json", "Cache-Control": "no-store" } });
    if (response.status !== 404) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(data, { status: response.status });
    }
    const chapter = initialSchoolChapters.find(item => item.id === id);
    if (!chapter) return NextResponse.json({ detail: "Chapter resource not found" }, { status: 404 });
    return NextResponse.json({ success: true, chapter }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ detail: "API service is unavailable" }, { status: 503 });
  }
}
