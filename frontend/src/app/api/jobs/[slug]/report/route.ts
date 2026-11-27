import { NextRequest } from "next/server";
import { proxyPublicBackendRequest } from "@/lib/backendProxy";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return proxyPublicBackendRequest(
    request,
    `/api/jobs/${encodeURIComponent(slug)}/report`,
    "POST",
    request.nextUrl.search,
    true,
  );
}
