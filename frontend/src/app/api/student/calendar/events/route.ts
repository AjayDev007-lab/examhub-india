import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("user_id") || "1");
    const eventType = searchParams.get("event_type");

    let events = dbStore.studentCalendarEvents.filter((e: any) => e.userId === userId);
    if (eventType && eventType !== "ALL") {
      events = events.filter((e: any) => e.eventType === eventType);
    }

    const out = events.map((e: any) => ({
      id: e.id,
      registration_id: e.registrationId,
      examination_id: e.examinationId,
      title: e.title,
      event_type: e.eventType,
      event_date: e.eventDate,
      location: e.location || "",
      notes: e.notes || "",
      status: e.status || "SCHEDULED",
      is_custom: e.isCustom || false
    }));

    return NextResponse.json({ total: out.length, events: out });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load calendar events" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("user_id") || "1");
    const body = await request.json();

    const newId = dbStore.studentCalendarEvents.length + 1;
    const newEvent = {
      id: newId,
      userId,
      registrationId: null,
      examinationId: null,
      title: body.title,
      eventType: body.event_type || "CUSTOM",
      eventDate: body.event_date,
      location: body.location || "",
      notes: body.notes || "",
      status: "SCHEDULED",
      isCustom: true
    };
    dbStore.studentCalendarEvents.push(newEvent);

    return NextResponse.json({
      success: true,
      event_id: newId,
      message: "Custom event added to your calendar"
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
