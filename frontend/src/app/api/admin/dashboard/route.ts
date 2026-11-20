import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET() {
  const healthyCount = dbStore.organizations.filter(o => o.health_status === "HEALTHY").length;
  return NextResponse.json({
    total_organizations: dbStore.organizations.length,
    total_examinations: dbStore.exams.length,
    total_results_indexed: 1240,
    total_students_registered: dbStore.students.length,
    active_integrations: healthyCount,
    recent_announcements: 6
  });
}
