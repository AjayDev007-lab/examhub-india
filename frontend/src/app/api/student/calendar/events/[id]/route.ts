import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);

    dbStore.studentCalendarEvents = dbStore.studentCalendarEvents.filter((e: any) => e.id !== eventId);
    return NextResponse.json({ success: true, message: "Event removed from calendar" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
