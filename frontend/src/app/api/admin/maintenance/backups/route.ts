import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backendProxy";

export async function GET(request: NextRequest) {
  return proxyBackendRequest(request, request.nextUrl.pathname, "admin");
}

export async function POST(request: NextRequest) {
  return proxyBackendRequest(request, request.nextUrl.pathname, "admin");
}
