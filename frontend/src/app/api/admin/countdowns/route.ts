import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backendProxy";

export async function GET(request: NextRequest) {
  return proxyBackendRequest(request, "/api/admin/countdowns", "admin");
}

export async function POST(request: NextRequest) {
  return proxyBackendRequest(request, "/api/admin/countdowns", "admin");
}
