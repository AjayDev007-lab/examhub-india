import { NextRequest, NextResponse } from "next/server";
import { runGuardianScan } from "@/lib/websiteGuardian";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const scanType = body.scanType || "FULL";

    if (!["FULL", "LINKS", "CONTENT", "JOB_EXPIRY"].includes(scanType)) {
      return NextResponse.json(
        { success: false, error: "Invalid scanType. Must be FULL, LINKS, CONTENT, or JOB_EXPIRY." },
        { status: 400 }
      );
    }

    const host = req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const baseUrl = host ? `${proto}://${host}` : undefined;

    const result = await runGuardianScan(scanType as any, baseUrl);

    return NextResponse.json({
      success: true,
      scan: result,
      message: `Guardian ${scanType} scan completed successfully in ${result.durationMs}ms.`
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to execute Guardian scan" },
      { status: 500 }
    );
  }
}
