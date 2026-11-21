import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const countdowns = (dbStore?.countdowns || []).filter(
      (c) => c.event_type === "RESULT_ANNOUNCEMENT"
    );

    return NextResponse.json({
      total: countdowns.length,
      countdowns
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load result countdowns" }, { status: 500 });
  }
}
