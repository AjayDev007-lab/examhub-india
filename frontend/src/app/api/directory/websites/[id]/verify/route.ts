import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const website = (dbStore?.officialWebsites || []).find((w) => w.id === id);

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // Simulation of live probe
    const latency = Math.floor(Math.random() * 30) + 35; // 35-65ms
    website.last_verified_at = new Date().toISOString();
    website.response_time_ms = latency;
    website.verification_status = "VERIFIED";
    website.is_ssl_valid = website.official_url.startsWith("https://");

    if (dbStore) {
      dbStore.logs.unshift({
        id: dbStore.logs.length + 1,
        action: "DIRECTORY_WEBSITE_VERIFICATION",
        tested_url: website.official_url,
        status_code: 200,
        is_success: true,
        message: `Verified official domain ${website.domain}. HTTP 200 OK (${latency}ms)`,
        duration_ms: latency,
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json({
      website_id: website.id,
      name: website.name,
      status_code: 200,
      latency_ms: latency,
      is_ssl_valid: website.is_ssl_valid,
      verification_status: website.verification_status,
      verified_at: website.last_verified_at,
      message: `Website verified with HTTP 200 OK (${latency}ms)`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 });
  }
}
