import { NextRequest, NextResponse } from "next/server";
import { initialUniversities } from "@/lib/platformData";
import { proxyBackendRequest } from "@/lib/backendProxy";

export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return NextResponse.json({ detail: "API service is not configured" }, { status: 503 });
  try {
    const response = await fetch(`${backendUrl}/api/universities`, { cache: "no-store", signal: AbortSignal.timeout(10000) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json(data, { status: response.status });

    const byCode = new Map<string, any>();
    for (const university of initialUniversities) byCode.set(university.short_code, university);
    for (const university of Array.isArray(data.universities) ? data.universities : []) byCode.set(university.short_code, university);
    let universities = [...byCode.values()];
    const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase();
    const state = request.nextUrl.searchParams.get("state");
    if (state && state !== "ALL") universities = universities.filter((u: any) => u.state.toLowerCase() === state.toLowerCase());
    if (search) universities = universities.filter((u: any) => [u.name, u.city, u.short_code].some(v => String(v || "").toLowerCase().includes(search)));
    return NextResponse.json({ success: true, total: universities.length, universities }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ detail: "API service is unavailable" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  return proxyBackendRequest(request, "/api/universities", "admin");
}
