import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orgId = Number(id);
  const logs = dbStore.logs.filter(l => l.organization_id === orgId);
  return NextResponse.json(logs);
}
