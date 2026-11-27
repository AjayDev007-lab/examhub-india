import { NextRequest, NextResponse } from "next/server";
import { proxyBackendRequest } from "@/lib/backendProxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-zA-Z0-9-]+$/.test(slug)) return NextResponse.json({ detail: "Invalid job identifier" }, { status: 400 });
  return proxyBackendRequest(request, `/api/jobs/${encodeURIComponent(slug)}/apply`, "student", "POST");
}
