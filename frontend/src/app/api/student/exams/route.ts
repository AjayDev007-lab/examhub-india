import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("user_id") || "1");
    const statusFilter = searchParams.get("status_filter");

    let list = dbStore.studentExamRegistrations.filter((r: any) => r.userId === userId);
    if (statusFilter && statusFilter !== "ALL") {
      list = list.filter((r: any) => r.status === statusFilter);
    }

    const enriched = list.map((r: any) => {
      const exam: any = r.examinationId ? dbStore.exams.find((e: any) => e.id === r.examinationId) : null;
      const org: any = exam ? dbStore.organizations.find((o: any) => o.id === exam.organization_id) : null;
      return {
        id: r.id,
        user_id: r.userId,
        examination_id: r.examinationId,
        examination: exam ? {
          id: exam.id,
          name: exam.name,
          code: exam.code,
          exam_type: exam.exam_type,
          description: exam.description,
          official_website: org?.official_website || null,
          syllabus_url: null,
          notification_pdf_url: null
        } : null,
        status: r.status,
        application_number: r.application_number,
        registration_date: r.registration_date,
        official_portal_url: r.official_portal_url || org?.official_website || null,
        notes: r.notes,
        is_external: r.is_external || false,
        external_exam_name: r.external_exam_name,
        external_authority: r.external_authority,
        external_exam_date: r.external_exam_date,
        external_application_deadline: r.external_application_deadline,
        created_at: r.createdAt
      };
    });

    return NextResponse.json({ total: enriched.length, registered_exams: enriched });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load student exams" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("user_id") || "1");
    const body = await request.json();

    const exam: any = dbStore.exams.find((e: any) => e.id === body.examination_id);
    if (!exam) {
      return NextResponse.json({ detail: "Examination not found" }, { status: 404 });
    }
    const org: any = dbStore.organizations.find((o: any) => o.id === exam.organization_id);

    const existingIndex = dbStore.studentExamRegistrations.findIndex(
      (r: any) => r.userId === userId && r.examinationId === body.examination_id
    );

    if (existingIndex >= 0) {
      dbStore.studentExamRegistrations[existingIndex].status = body.status || dbStore.studentExamRegistrations[existingIndex].status;
      if (body.application_number) dbStore.studentExamRegistrations[existingIndex].application_number = body.application_number;
      if (body.notes) dbStore.studentExamRegistrations[existingIndex].notes = body.notes;
      return NextResponse.json({ success: true, message: "Exam registration updated" });
    }

    const newId = dbStore.studentExamRegistrations.length + 1;
    const newReg = {
      id: newId,
      userId,
      examinationId: body.examination_id,
      scheduleId: body.schedule_id || null,
      status: body.status || "ADDED_TO_MY_EXAMS",
      application_number: body.application_number || null,
      registration_date: new Date().toISOString(),
      official_portal_url: org?.official_website || null,
      notes: body.notes || "",
      is_external: false,
      createdAt: new Date().toISOString()
    };
    dbStore.studentExamRegistrations.unshift(newReg);

    // Auto-create calendar event
    const eventDate = new Date(Date.now() + 60 * 86400000).toISOString();
    dbStore.studentCalendarEvents.push({
      id: dbStore.studentCalendarEvents.length + 1,
      userId,
      registrationId: newId,
      examinationId: exam.id,
      title: `${exam.name} - Target Examination`,
      eventType: "EXAM_DATE",
      eventDate,
      location: "Designated Examination Centre",
      status: "SCHEDULED",
      isCustom: false
    });

    // Auto-create reminder
    dbStore.examReminders.push({
      id: dbStore.examReminders.length + 1,
      userId,
      registrationId: newId,
      examinationId: exam.id,
      reminderType: "EXAM_30D",
      title: `30-Day Reminder: ${exam.name}`,
      message: `Your registered exam ${exam.name} is approaching. Review syllabus and syllabus patterns.`,
      scheduledFor: new Date(Date.now() + 30 * 86400000).toISOString(),
      status: "PENDING",
      deliveryChannel: "IN_APP"
    });

    return NextResponse.json({
      success: true,
      message: "Examination added to your dashboard and personal calendar!",
      registration_id: newId
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to register exam" }, { status: 500 });
  }
}
