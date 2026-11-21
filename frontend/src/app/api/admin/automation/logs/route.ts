import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      total: dbStore.scheduledTaskLogs.length,
      logs: dbStore.scheduledTaskLogs
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load task logs" }, { status: 500 });
  }
}
