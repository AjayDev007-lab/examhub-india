// ============================================================================
// EXAMHUB INDIA — ADMIN JOB DISCOVERY API
// Inspect sources, trigger discovery sweeps, and inspect discovery history
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  OFFICIAL_DISCOVERY_SOURCES,
  REAL_DISCOVERY_FEED,
  runAutomatedJobDiscovery,
  getDiscoveryHistory
} from "@/lib/jobDiscovery";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const history = getDiscoveryHistory(20);
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      sources: OFFICIAL_DISCOVERY_SOURCES,
      feedCount: REAL_DISCOVERY_FEED.length,
      history
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await runAutomatedJobDiscovery({
      forcePublish: Boolean(body.forcePublish),
      sourceFilter: body.sourceFilter,
      maxJobsToPublish: body.maxJobsToPublish ?? 1
    });

    return NextResponse.json({
      success: true,
      result,
      message: `Discovered ${result.totalDiscovered} opportunities from ${result.sourcesChecked} sources. Verified: ${result.verifiedCount}, Auto-Published: ${result.publishedCount}.`
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
