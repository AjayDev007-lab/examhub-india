import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backendProxy";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return proxyBackendRequest(request, "/api/admin/exams", "admin");
}
