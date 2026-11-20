import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = Number(id);
    const org = dbStore.organizations.find(o => o.id === orgId);
    if (!org) {
      return NextResponse.json({ detail: "Institution not found" }, { status: 404 });
    }

    const body = await request.json();
    org.approval_status = body.approval_status;
    if (body.approval_status === "APPROVED") {
      org.approved_by = 1;
      org.approved_at = new Date().toISOString();
    } else {
      org.approved_by = null;
      org.approved_at = null;
    }

    dbStore.auditLogs.unshift({
      id: dbStore.auditLogs.length + 1,
      actor_type: "ADMIN",
      actor_id: 1,
      action: `INSTITUTION_APPROVAL_${body.approval_status}`,
      target_type: "ORGANIZATION",
      target_id: orgId,
      ip_address: "127.0.0.1",
      created_at: new Date().toISOString()
    });

    return NextResponse.json(org);
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed" }, { status: 500 });
  }
}
