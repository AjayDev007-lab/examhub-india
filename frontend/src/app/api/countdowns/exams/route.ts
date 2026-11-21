import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const countdowns = (dbStore?.countdowns || []).filter(
      (c) => c.event_type === "EXAM_DATE" || c.event_type === "APPLICATION_DEADLINE"
    );

    return NextResponse.json({
      total: countdowns.length,
      countdowns
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load examination countdowns" }, { status: 500 });
  }
}
