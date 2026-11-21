import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const regId = parseInt(id);
    const body = await request.json();

    const index = dbStore.studentExamRegistrations.findIndex((r: any) => r.id === regId);
    if (index === -1) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    if (body.status) dbStore.studentExamRegistrations[index].status = body.status;
    if (body.application_number !== undefined) dbStore.studentExamRegistrations[index].application_number = body.application_number;
    if (body.notes !== undefined) dbStore.studentExamRegistrations[index].notes = body.notes;

    return NextResponse.json({
      success: true,
      message: `Status updated to ${body.status}`
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
