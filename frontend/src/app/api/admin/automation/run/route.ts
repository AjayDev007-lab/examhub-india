import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const taskName = (body.task_name || "RECALCULATE_REMINDERS").toUpperCase();

    const newLog = {
      id: dbStore.scheduledTaskLogs.length + 1,
      taskName,
      status: "COMPLETED",
      recordsProcessed: Math.floor(Math.random() * 50) + 15,
      startedAt: new Date().toISOString(),
      completedAt: new Date(Date.now() + 1500).toISOString()
    };
    dbStore.scheduledTaskLogs.unshift(newLog);

    return NextResponse.json({
      success: true,
      task_name: taskName,
      status: "COMPLETED",
      records_processed: newLog.recordsProcessed,
      message: `Automation task '${taskName}' executed successfully!`
    });
  } catch (error) {
    return NextResponse.json({ error: "Automation failed" }, { status: 500 });
  }
}
