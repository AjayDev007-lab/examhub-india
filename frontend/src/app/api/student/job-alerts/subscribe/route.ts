import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("user_id") || "1");
    const body = await request.json();

    const newId = dbStore.jobAlertSubscriptions.length + 1;
    const newSub = {
      id: newId,
      userId,
      keyword: body.keyword || "",
      sector: body.sector || "ALL",
      category: body.category || "ALL",
      qualification: body.qualification || "GRADUATION",
      frequency: body.frequency || "INSTANT",
      isActive: true
    };
    dbStore.jobAlertSubscriptions.push(newSub);

    return NextResponse.json({
      success: true,
      subscription_id: newId,
      message: "Job alert subscription created successfully!"
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
