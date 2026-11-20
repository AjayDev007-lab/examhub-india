import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orgId = Number(id);
  const org = dbStore.organizations.find(o => o.id === orgId);
  if (!org) {
    return NextResponse.json({ detail: "Institution not found" }, { status: 404 });
  }

  org.is_active = !org.is_active;
  return NextResponse.json(org);
}
