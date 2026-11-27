import { NextRequest } from "next/server";
import { proxyPublicBackendRequest } from "@/lib/backendProxy";

export async function POST(request: NextRequest) {
  return proxyPublicBackendRequest(request, "/api/directory/reports", "POST", request.nextUrl.search, true);
}
