import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subId = parseInt(id);

    dbStore.jobAlertSubscriptions = dbStore.jobAlertSubscriptions.filter((s: any) => s.id !== subId);
    return NextResponse.json({ success: true, message: "Subscription cancelled" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}
