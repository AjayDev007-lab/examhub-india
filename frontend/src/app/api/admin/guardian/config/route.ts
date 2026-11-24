import { NextRequest, NextResponse } from "next/server";
import { updateGuardianConfig, getGuardianConfig } from "@/lib/websiteGuardian";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ success: true, config: getGuardianConfig() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const updated = updateGuardianConfig(body);

    return NextResponse.json({
      success: true,
      config: updated,
      message: "Guardian configuration updated successfully."
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update Guardian configuration" },
      { status: 500 }
    );
  }
}
