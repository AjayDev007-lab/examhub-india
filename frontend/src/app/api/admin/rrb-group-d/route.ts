import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

// GET /api/admin/rrb-group-d - List RRB Group D results with filtering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cen = searchParams.get("cen");
    const zone = searchParams.get("zone");
    const status = searchParams.get("status");

    let items = (dbStore as any).rrbGroupDResults || [];

    if (cen && cen !== "ALL") {
      items = items.filter((r: any) => r.cen_number.toLowerCase().includes(cen.toLowerCase()));
    }
    if (zone && zone !== "ALL") {
      items = items.filter((r: any) => r.zone_code === zone);
    }
    if (status && status !== "ALL") {
      items = items.filter((r: any) => r.status === status);
    }

    return NextResponse.json({
      total: items.length,
      results: items
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/rrb-group-d - Create or update an RRB Group D result record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.cen_number || !body.title || !body.zone_code || !body.zone_name || !body.official_portal_url) {
      return NextResponse.json({ error: "Missing mandatory RRB recruitment details" }, { status: 400 });
    }

    const items = (dbStore as any).rrbGroupDResults;
    const newId = items.length > 0 ? Math.max(...items.map((i: any) => i.id)) + 1 : 1;

    const newRecord = {
      id: newId,
      cen_number: body.cen_number.trim(),
      title: body.title.trim(),
      zone_code: body.zone_code.trim(),
      zone_name: body.zone_name.trim(),
      vacancies_count: Number(body.vacancies_count) || 0,
      official_portal_url: body.official_portal_url.trim(),
      scorecard_url: body.scorecard_url?.trim() || null,
      merit_list_pdf_url: body.merit_list_pdf_url?.trim() || null,
      cutoff_marks_pdf_url: body.cutoff_marks_pdf_url?.trim() || null,
      pet_instructions_url: body.pet_instructions_url?.trim() || null,
      document_verification_url: body.document_verification_url?.trim() || null,
      announcement_date: body.announcement_date || new Date().toISOString(),
      status: body.status || "DRAFT", // DRAFT, PENDING_VERIFICATION, APPROVED, PUBLISHED, ARCHIVED
      verification_source: body.verification_source?.trim() || "Railway Recruitment Control Board / RRB Official Portal",
      admin_notes: body.admin_notes?.trim() || "",
      view_count: 0,
      created_at: new Date().toISOString()
    };

    items.unshift(newRecord);

    // Audit log
    dbStore.auditLogs.unshift({
      id: Date.now(),
      admin_name: "SuperAdmin",
      action: "RRB_RESULT_CREATED",
      resource: `RRB Result ID ${newId} (${body.cen_number} - ${body.zone_code})`,
      timestamp: new Date().toISOString(),
      ip_address: "127.0.0.1"
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/admin/rrb-group-d - Workflow transition (Draft -> Pending -> Approved -> Published)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, admin_notes } = body;

    const items = (dbStore as any).rrbGroupDResults;
    const index = items.findIndex((i: any) => i.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "RRB Result record not found" }, { status: 404 });
    }

    const validTransitions = ["DRAFT", "PENDING_VERIFICATION", "APPROVED", "PUBLISHED", "ARCHIVED"];
    if (status && !validTransitions.includes(status)) {
      return NextResponse.json({ error: `Invalid status transition: ${status}` }, { status: 400 });
    }

    if (status) items[index].status = status;
    if (admin_notes !== undefined) items[index].admin_notes = admin_notes;

    // Audit log
    dbStore.auditLogs.unshift({
      id: Date.now(),
      admin_name: "SuperAdmin",
      action: `RRB_STATUS_${status || 'UPDATED'}`,
      resource: `RRB Result ID ${id} (${items[index].cen_number} - ${items[index].zone_code})`,
      timestamp: new Date().toISOString(),
      ip_address: "127.0.0.1"
    });

    return NextResponse.json(items[index]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
