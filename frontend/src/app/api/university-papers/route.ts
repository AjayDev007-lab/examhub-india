import { NextRequest, NextResponse } from "next/server";
import { initialUniversityQuestionPapers } from "@/lib/platformData";
import { proxyBackendRequest } from "@/lib/backendProxy";

function key(paper: any) {
  return [paper.university_code, paper.degree, paper.semester, paper.subject_code, paper.exam_year, paper.exam_session, paper.exam_type]
    .map(value => String(value || "").toLowerCase()).join("|");
}

export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return NextResponse.json({ detail: "API service is not configured" }, { status: 503 });
  try {
    const response = await fetch(`${backendUrl}/api/university-papers`, { cache: "no-store", signal: AbortSignal.timeout(10000) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json(data, { status: response.status });

    const papersByKey = new Map<string, any>();
    for (const paper of initialUniversityQuestionPapers) papersByKey.set(key(paper), paper);
    for (const paper of Array.isArray(data.papers) ? data.papers : []) papersByKey.set(key(paper), paper);
    let papers = [...papersByKey.values()];

    const params = request.nextUrl.searchParams;
    const universityId = params.get("university_id");
    const degree = params.get("degree");
    const semester = params.get("semester");
    const year = params.get("year");
    const search = params.get("search")?.trim().toLowerCase();
    if (universityId && universityId !== "ALL") papers = papers.filter((p: any) => p.university_id === Number(universityId));
    if (degree && degree !== "ALL") papers = papers.filter((p: any) => p.degree.toLowerCase() === degree.toLowerCase());
    if (semester && semester !== "ALL") papers = papers.filter((p: any) => p.semester === Number(semester));
    if (year && year !== "ALL") papers = papers.filter((p: any) => p.exam_year === Number(year));
    if (search) papers = papers.filter((p: any) => [p.subject_name, p.subject_code, p.department].some(v => String(v || "").toLowerCase().includes(search)));
    return NextResponse.json({ success: true, total: papers.length, papers }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ detail: "API service is unavailable" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  return proxyBackendRequest(request, "/api/university-papers", "admin");
}
