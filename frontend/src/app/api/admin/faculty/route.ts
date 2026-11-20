import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

// GET /api/admin/faculty
export async function GET() {
  try {
    const faculty = (dbStore as any).faculty || [];
    return NextResponse.json({ total: faculty.length, faculty });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/faculty
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const faculty = (dbStore as any).faculty;
    const newId = faculty.length > 0 ? Math.max(...faculty.map((f: any) => f.id)) + 1 : 1;

    const newFaculty = {
      id: newId,
      name: body.name,
      email: body.email,
      institution_id: body.institution_id || 1,
      institution_name: body.institution_name || "Assigned Institution",
      department: body.department || "General",
      role: body.role || "FACULTY",
      status: "ACTIVE"
    };

    faculty.unshift(newFaculty);

    dbStore.auditLogs.unshift({
      id: Date.now(),
      admin_name: "SuperAdmin",
      action: "FACULTY_ASSIGNED",
      resource: `Faculty: ${body.name} (${body.email})`,
      timestamp: new Date().toISOString(),
      ip_address: "127.0.0.1"
    });

    return NextResponse.json(newFaculty, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
