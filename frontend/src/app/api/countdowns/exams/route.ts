import { NextRequest } from "next/server";
import { proxyPublicBackendRequest } from "@/lib/backendProxy";

export async function GET(request: NextRequest) {
  return proxyPublicBackendRequest(request, "/api/countdowns/exams");
}
