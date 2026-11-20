import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

// GET /api/admin/scholarships
export async function GET() {
  try {
    const items = (dbStore as any).scholarships || [];
    return NextResponse.json({ total: items.length, scholarships: items });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/scholarships
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = (dbStore as any).scholarships;
    const newId = items.length > 0 ? Math.max(...items.map((i: any) => i.id)) + 1 : 1;

    const newScholarship = {
      id: newId,
      title: body.title,
      provider_name: body.provider_name,
      category: body.category || "CENTRAL",
      eligibility_criteria: body.eligibility_criteria || "",
      award_amount: body.award_amount || "",
      application_portal_url: body.application_portal_url,
      status: body.status || "PUBLISHED",
      deadline_date: body.deadline_date || null
    };

    items.unshift(newScholarship);

    dbStore.auditLogs.unshift({
      id: Date.now(),
      admin_name: "SuperAdmin",
      action: "SCHOLARSHIP_CREATED",
      resource: `Scholarship: ${body.title}`,
      timestamp: new Date().toISOString(),
      ip_address: "127.0.0.1"
    });

    return NextResponse.json(newScholarship, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
