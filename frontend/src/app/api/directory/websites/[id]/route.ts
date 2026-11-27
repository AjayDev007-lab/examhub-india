import { NextRequest } from "next/server";
import { proxyPublicBackendRequest } from "@/lib/backendProxy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyPublicBackendRequest(
    request,
    `/api/directory/websites/${encodeURIComponent(id)}`,
    "GET",
    request.nextUrl.search,
    true,
  );
}
