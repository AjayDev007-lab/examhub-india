import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backendProxy";

export async function GET(request: NextRequest) {
  return proxyBackendRequest(request, "/api/admin/rrb-group-d", "admin");
}

export async function POST(request: NextRequest) {
  return proxyBackendRequest(request, "/api/admin/rrb-group-d", "admin");
}

export async function PUT(request: NextRequest) {
  return proxyBackendRequest(request, "/api/admin/rrb-group-d", "admin");
}
