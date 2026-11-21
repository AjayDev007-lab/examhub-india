import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const regId = parseInt(id);

    dbStore.studentExamRegistrations = dbStore.studentExamRegistrations.filter((r: any) => r.id !== regId);
    dbStore.studentCalendarEvents = dbStore.studentCalendarEvents.filter((e: any) => e.registrationId !== regId);
    dbStore.examReminders = dbStore.examReminders.filter((rem: any) => rem.registrationId !== regId);

    return NextResponse.json({ success: true, message: "Exam removed from your list" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove exam" }, { status: 500 });
  }
}
