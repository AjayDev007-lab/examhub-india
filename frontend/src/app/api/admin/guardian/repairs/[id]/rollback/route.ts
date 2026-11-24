import { NextRequest, NextResponse } from "next/server";
import { rollbackGuardianRepair } from "@/lib/websiteGuardian";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const adminLabel = body.adminLabel || "ADMIN_CONSOLE";

    const res = await rollbackGuardianRepair(id, adminLabel);
    return NextResponse.json(res, { status: res.success ? 200 : 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
