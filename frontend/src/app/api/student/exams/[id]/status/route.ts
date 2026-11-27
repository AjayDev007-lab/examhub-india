import { NextRequest, NextResponse } from "next/server";
import { proxyBackendRequest } from "@/lib/backendProxy";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ detail: "Invalid registration id" }, { status: 400 });
  return proxyBackendRequest(request, `/api/student/exams/${id}/status`, "student", "PUT");
}
