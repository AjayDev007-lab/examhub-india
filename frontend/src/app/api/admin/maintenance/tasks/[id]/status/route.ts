import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backendProxy";

export async function PUT(request: NextRequest) {
  return proxyBackendRequest(request, request.nextUrl.pathname, "admin");
}
