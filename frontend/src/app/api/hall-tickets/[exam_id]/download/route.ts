import { NextRequest } from "next/server";
import { proxyPublicBackendRequest } from "@/lib/backendProxy";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ exam_id: string }> },
) {
  const { exam_id } = await context.params;
  return proxyPublicBackendRequest(
    request,
    `/api/hall-tickets/${encodeURIComponent(exam_id)}/download`,
  );
}
