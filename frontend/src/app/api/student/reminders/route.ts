import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("user_id") || "1");
    const status = searchParams.get("status");

    let reminders = dbStore.examReminders.filter((rem: any) => rem.userId === userId);
    if (status && status !== "ALL") {
      reminders = reminders.filter((rem: any) => rem.status === status);
    }

    const out = reminders.map((rem: any) => ({
      id: rem.id,
      registration_id: rem.registrationId,
      examination_id: rem.examinationId,
      reminder_type: rem.reminderType,
      title: rem.title,
      message: rem.message,
      scheduled_for: rem.scheduledFor,
      status: rem.status,
      delivery_channel: rem.deliveryChannel
    }));

    return NextResponse.json({ total: out.length, reminders: out });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load reminders" }, { status: 500 });
  }
}
