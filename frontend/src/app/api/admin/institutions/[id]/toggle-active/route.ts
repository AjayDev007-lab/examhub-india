import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backendProxy";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyBackendRequest(request, `/api/admin/institutions/${encodeURIComponent(id)}/toggle-active`, "admin");
}
