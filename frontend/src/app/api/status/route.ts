import { NextResponse } from "next/server";

// Fallback in-memory status store for serverless
let operatingState = {
  mode: "ONLINE", // "ONLINE", "MAINTENANCE", "OFFLINE"
  maintenance_message: "ExamHub India is currently undergoing scheduled platform upgrades to serve you better. We will be back online shortly.",
  estimated_return_time: "Tonight by 23:30 IST",
  scheduled_end_time: null,
  auto_online_enabled: true
};

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${backendUrl}/api/status`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      operatingState = { ...operatingState, ...data };
      return NextResponse.json(data);
    }
  } catch (_) {}

  return NextResponse.json({
    mode: operatingState.mode,
    is_public_accessible: operatingState.mode === "ONLINE",
    maintenance_message: operatingState.maintenance_message,
    estimated_return_time: operatingState.estimated_return_time
  });
}
