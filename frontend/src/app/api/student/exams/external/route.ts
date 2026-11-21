import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("user_id") || "1");
    const body = await request.json();

    const newId = dbStore.studentExamRegistrations.length + 1;
    const newReg = {
      id: newId,
      userId,
      examinationId: null,
      status: body.status || "APPLICATION_SUBMITTED",
      application_number: body.application_number || null,
      registration_date: new Date().toISOString(),
      notes: body.notes || "",
      is_external: true,
      external_exam_name: body.external_exam_name,
      external_authority: body.external_authority,
      external_exam_date: body.external_exam_date,
      external_application_deadline: body.external_application_deadline || null,
      createdAt: new Date().toISOString()
    };
    dbStore.studentExamRegistrations.unshift(newReg);

    // Auto-create calendar event
    dbStore.studentCalendarEvents.push({
      id: dbStore.studentCalendarEvents.length + 1,
      userId,
      registrationId: newId,
      examinationId: null,
      title: `${body.external_exam_name} - Exam Day`,
      eventType: "EXAM_DATE",
      eventDate: body.external_exam_date,
      location: body.external_authority,
      status: "SCHEDULED",
      isCustom: true
    });

    return NextResponse.json({
      success: true,
      message: "External examination added to your calendar and reminder timeline!",
      registration_id: newId
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add external exam" }, { status: 500 });
  }
}
