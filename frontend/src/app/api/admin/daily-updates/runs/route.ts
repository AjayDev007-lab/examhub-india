import { NextResponse, NextRequest } from "next/server";
import { runAutomatedJobDiscovery } from "@/lib/jobDiscovery";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    try {
      const res = await fetch(`${backendUrl}/api/admin/daily-updates/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) return NextResponse.json(await res.json());
    } catch (_) {}

    // Execute live job discovery scan across official Government and IT sources
    const discoveryResult = await runAutomatedJobDiscovery({
      forcePublish: Boolean(body.forcePublish),
      sourceFilter: body.sourceFilter,
      maxJobsToPublish: body.maxJobsToPublish ?? 1
    });

    return NextResponse.json({
      success: true,
      run_id: discoveryResult.runId,
      sources_checked: discoveryResult.sourcesChecked,
      new_items_detected: discoveryResult.totalDiscovered,
      verified_count: discoveryResult.verifiedCount,
      published_count: discoveryResult.publishedCount,
      blocked_count: discoveryResult.blockedCount,
      message: `Successfully executed automated monitoring scan across ${discoveryResult.sourcesChecked} official sources. Discovered ${discoveryResult.totalDiscovered} opportunities, verified ${discoveryResult.verifiedCount}, published ${discoveryResult.publishedCount} directly to Telegram.`,
      discovery: discoveryResult
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
