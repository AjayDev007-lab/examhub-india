import { NextRequest } from "next/server";
import { proxyPublicBackendRequest } from "@/lib/backendProxy";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyPublicBackendRequest(
    request,
    `/api/directory/websites/${encodeURIComponent(id)}/verify`,
    "POST",
    request.nextUrl.search,
    true,
  );
}
