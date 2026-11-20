import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const org = dbStore.organizations.find(o => o.id === Number(id));
  if (!org) {
    return NextResponse.json({ detail: "Institution not found" }, { status: 404 });
  }
  return NextResponse.json(org);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = Number(id);
    const index = dbStore.organizations.findIndex(o => o.id === orgId);
    if (index === -1) {
      return NextResponse.json({ detail: "Institution not found" }, { status: 404 });
    }

    const body = await request.json();
    const existing = dbStore.organizations[index];

    const hasNewCreds = Boolean(body.api_credentials);
    const masked = hasNewCreds 
      ? `${body.api_credentials.slice(0, 4)}••••••••` 
      : existing.masked_credentials;

    const updated = {
      ...existing,
      ...body,
      id: orgId,
      code: body.code ? body.code.trim().toUpperCase() : existing.code,
      has_api_credentials: hasNewCreds ? true : existing.has_api_credentials,
      masked_credentials: masked
    };

    dbStore.organizations[index] = updated;

    dbStore.auditLogs.unshift({
      id: dbStore.auditLogs.length + 1,
      actor_type: "ADMIN",
      actor_id: 1,
      action: "INSTITUTION_UPDATED",
      target_type: "ORGANIZATION",
      target_id: orgId,
      ip_address: "127.0.0.1",
      created_at: new Date().toISOString()
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orgId = Number(id);
  const index = dbStore.organizations.findIndex(o => o.id === orgId);
  if (index === -1) {
    return NextResponse.json({ detail: "Institution not found" }, { status: 404 });
  }

  const removed = dbStore.organizations.splice(index, 1)[0];

  dbStore.auditLogs.unshift({
    id: dbStore.auditLogs.length + 1,
    actor_type: "ADMIN",
    actor_id: 1,
    action: "INSTITUTION_DELETED",
    target_type: "ORGANIZATION",
    target_id: orgId,
    ip_address: "127.0.0.1",
    created_at: new Date().toISOString()
  });

  return NextResponse.json({ message: `Institution '${removed.name}' removed`, id: orgId });
}
