import { NextResponse } from "next/server";
import { dbStore, OrganizationItem } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("query")?.toLowerCase();
  const cat = searchParams.get("category_id");
  const app = searchParams.get("approval_status");
  const health = searchParams.get("health_status");

  let list = [...dbStore.organizations];

  if (q) {
    list = list.filter(o => o.name.toLowerCase().includes(q) || o.code.toLowerCase().includes(q));
  }
  if (cat) {
    list = list.filter(o => o.category_id.toString() === cat);
  }
  if (app) {
    list = list.filter(o => o.approval_status === app);
  }
  if (health) {
    list = list.filter(o => o.health_status === health);
  }

  return NextResponse.json(list);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const codeClean = (body.code || "").trim().toUpperCase();

    // Check duplicate code
    const existing = dbStore.organizations.find(o => o.code === codeClean);
    if (existing) {
      return NextResponse.json(
        { detail: `An institution with code '${codeClean}' already exists` },
        { status: 400 }
      );
    }

    const newId = Math.max(...dbStore.organizations.map(o => o.id), 0) + 1;
    const hasCreds = Boolean(body.api_credentials);
    const masked = hasCreds ? `${body.api_credentials.slice(0, 4)}••••••••` : null;

    const newOrg: OrganizationItem = {
      id: newId,
      name: body.name.trim(),
      code: codeClean,
      category_id: Number(body.category_id),
      state_id: body.state_id ? Number(body.state_id) : null,
      official_website: body.official_website.trim(),
      result_portal_url: body.result_portal_url?.trim() || undefined,
      hall_ticket_portal_url: body.hall_ticket_portal_url?.trim() || undefined,
      id_card_portal_url: body.id_card_portal_url?.trim() || undefined,
      integration_methods: body.integration_methods || ["OFFICIAL_REDIRECT"],
      verification_status: "VERIFIED",
      supports_results: body.supports_results ?? true,
      supports_hall_tickets: body.supports_hall_tickets ?? true,
      supports_id_cards: body.supports_id_cards ?? true,
      results_retrieval_mode: body.results_retrieval_mode || "OFFICIAL_REDIRECT",
      hall_tickets_retrieval_mode: body.hall_tickets_retrieval_mode || "OFFICIAL_REDIRECT",
      id_cards_retrieval_mode: body.id_cards_retrieval_mode || "INSTITUTION_INTEGRATION",
      approval_status: body.approval_status || "APPROVED",
      approved_by: body.approval_status === "APPROVED" ? 1 : null,
      approved_at: body.approval_status === "APPROVED" ? new Date().toISOString() : null,
      api_endpoint_url: body.api_endpoint_url?.trim() || undefined,
      auth_method: body.auth_method || "NONE",
      has_api_credentials: hasCreds,
      masked_credentials: masked,
      health_status: "HEALTHY",
      last_latency_ms: 45,
      last_tested_at: new Date().toISOString(),
      error_count: 0,
      is_active: true
    };

    dbStore.organizations.unshift(newOrg);

    // Record audit log
    dbStore.auditLogs.unshift({
      id: dbStore.auditLogs.length + 1,
      actor_type: "ADMIN",
      actor_id: 1,
      action: "INSTITUTION_REGISTERED",
      target_type: "ORGANIZATION",
      target_id: newOrg.id,
      ip_address: "127.0.0.1",
      created_at: new Date().toISOString()
    });

    return NextResponse.json(newOrg, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to register institution" }, { status: 500 });
  }
}
