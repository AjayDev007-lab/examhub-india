import { NextRequest } from "next/server";
import { proxyPublicBackendRequest, proxyBackendRequest } from "@/lib/backendProxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return proxyPublicBackendRequest(request, `/api/jobs/${encodeURIComponent(slug)}`, "GET", request.nextUrl.search, true);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return proxyBackendRequest(request, `/api/jobs/${encodeURIComponent(slug)}`, "admin", "PUT");
}
