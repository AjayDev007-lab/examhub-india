import { NextRequest } from "next/server";
import { proxyPublicBackendRequest } from "@/lib/backendProxy";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return proxyPublicBackendRequest(request, "/api/hall-tickets/check", "POST", request.nextUrl.search, true);
}
