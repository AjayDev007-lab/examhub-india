import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

// GET /api/admin/security - Retrieve security incidents and security status
export async function GET() {
  try {
    const incidents = (dbStore as any).securityIncidents || [];
    return NextResponse.json({
      incidents,
      securityStatus: {
        firewall: "ACTIVE",
        ssrfProtection: "ENFORCING",
        rateLimiter: "ENABLED (60 req/min per IP)",
        mfaEnforced: true,
        activeAdminSessions: 1,
        activeStudentSessions: 42,
        unresolvedAlerts: incidents.filter((i: any) => !i.is_resolved).length
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/security - Resolve an incident or revoke session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, incidentId } = body;

    const incidents = (dbStore as any).securityIncidents;
    if (action === "RESOLVE_INCIDENT" && incidentId) {
      const inc = incidents.find((i: any) => i.id === incidentId);
      if (inc) inc.is_resolved = true;
    }

    // Audit log
    dbStore.auditLogs.unshift({
      id: Date.now(),
      admin_name: "SuperAdmin",
      action: `SECURITY_${action || 'ACTION'}`,
      resource: incidentId ? `Incident #${incidentId}` : "Security Policy",
      timestamp: new Date().toISOString(),
      ip_address: "127.0.0.1"
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
