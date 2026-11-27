import { NextRequest, NextResponse } from "next/server";
import { proxyBackendRequest } from "@/lib/backendProxy";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ detail: "Invalid event id" }, { status: 400 });
  return proxyBackendRequest(request, `/api/student/calendar/events/${id}`, "student", "DELETE");
}
