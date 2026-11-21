import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("user_id") || "1");

    const events = dbStore.studentCalendarEvents.filter((e: any) => e.userId === userId);

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ExamHub India//Student Examination Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:ExamHub India - My Examination Calendar",
      "X-WR-TIMEZONE:Asia/Kolkata"
    ];

    for (const ev of events) {
      const d = new Date(ev.eventDate);
      const dtStr = d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const endD = new Date(d.getTime() + 3 * 3600000);
      const endDtStr = endD.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const uid = `examhub-${ev.id}-${userId}@examhub.in`;

      lines.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${dtStr}`,
        `DTSTART:${dtStr}`,
        `DTEND:${endDtStr}`,
        `SUMMARY:${ev.title}`,
        `DESCRIPTION:${ev.notes || ev.eventType}`,
        `LOCATION:${ev.location || "Official Examination Centre"}`,
        "STATUS:CONFIRMED",
        "END:VEVENT"
      );
    }

    lines.push("END:VCALENDAR");
    const icsContent = lines.join("\r\n");

    return new NextResponse(icsContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename=examhub_calendar_${userId}.ics`
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to export calendar" }, { status: 500 });
  }
}
