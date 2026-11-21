import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const countdowns = dbStore?.countdowns || [];
    return NextResponse.json({
      total: countdowns.length,
      countdowns
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load countdowns" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, exam_name, authority_code, event_type, target_date, official_source, verification_status, result_status, exam_slug, official_portal_url } = body;

    if (!title || !target_date) {
      return NextResponse.json({ error: "Title and target date are required" }, { status: 400 });
    }

    if (!dbStore?.countdowns) {
      if (dbStore) dbStore.countdowns = [];
    }

    const newCountdown = {
      id: dbStore!.countdowns.length + 1,
      title,
      exam_name: exam_name || title,
      authority_code: authority_code || "GOVT",
      event_type: event_type || "EXAM_DATE",
      target_date,
      official_source: official_source || "Official Gazette",
      verification_status: verification_status || "CONFIRMED_OFFICIAL",
      result_status: result_status || (event_type === "RESULT_ANNOUNCEMENT" ? "CONFIRMED_OFFICIAL" : undefined),
      exam_slug: exam_slug || "general-exam",
      official_portal_url: official_portal_url || "https://india.gov.in"
    };

    dbStore!.countdowns.push(newCountdown);

    return NextResponse.json({
      message: "Countdown created successfully",
      countdown: newCountdown
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create countdown" }, { status: 500 });
  }
}
