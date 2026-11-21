import { NextResponse } from "next/server";
import { INITIAL_HEALTH_COMPONENTS, INITIAL_MAINTENANCE_TASKS, INITIAL_BROKEN_LINKS, INITIAL_BACKUPS, INITIAL_ERRORS } from "@/lib/maintenanceData";

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${backendUrl}/api/admin/maintenance/dashboard`, { cache: "no-store" });
    if (res.ok) return NextResponse.json(await res.json());
  } catch (_) {}

  return NextResponse.json({
    status: "HEALTHY",
    last_checked: new Date().toISOString(),
    components: INITIAL_HEALTH_COMPONENTS,
    metrics: {
      open_maintenance_tasks: INITIAL_MAINTENANCE_TASKS.filter(t => t.status !== "RESOLVED").length,
      urgent_tasks: INITIAL_MAINTENANCE_TASKS.filter(t => t.priority === "URGENT" && t.status !== "RESOLVED").length,
      broken_links: INITIAL_BROKEN_LINKS.filter(l => l.status === "PENDING").length,
      expired_jobs: 3,
      open_errors: INITIAL_ERRORS.filter(e => e.status === "OPEN").length,
      last_backup_status: INITIAL_BACKUPS[0]?.status || "SUCCESS",
      last_backup_time: INITIAL_BACKUPS[0]?.created_at || new Date().toISOString()
    }
  });
}
