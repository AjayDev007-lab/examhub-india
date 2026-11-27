import { NextRequest } from "next/server";
import { proxyPublicBackendRequest, proxyBackendRequest } from "@/lib/backendProxy";

export async function GET(request: NextRequest) {
  const query = new URLSearchParams(request.nextUrl.searchParams);
  const closingSoon = query.get("closing_soon");
  if (closingSoon && !query.has("closing_soon_days")) {
    query.set("closing_soon_days", closingSoon === "true" ? "3" : closingSoon);
    query.delete("closing_soon");
  }
  return proxyPublicBackendRequest(request, "/api/jobs", "GET", `?${query.toString()}`, true);
}

export async function POST(request: NextRequest) {
  return proxyBackendRequest(request, "/api/jobs", "admin");
}
