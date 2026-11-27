import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backendProxy";

export async function GET(request: NextRequest) {
  return proxyBackendRequest(request, "/api/student/school-profile", "student");
}

export async function PUT(request: NextRequest) {
  return proxyBackendRequest(request, "/api/student/school-profile", "student");
}
