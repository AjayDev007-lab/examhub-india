import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, code, category_type, state_code, state_id, official_url,
      application_portal_url, domain, description, related_examinations,
      contact_email, contact_phone, verification_status, verification_source,
      is_featured
    } = body;

    if (!name || !official_url || !category_type) {
      return NextResponse.json({ error: "Name, official_url, and category_type are required" }, { status: 400 });
    }

    let resolvedStateId = state_id;
    if (!resolvedStateId && state_code) {
      const st = (dbStore?.states || []).find((s) => s.code === state_code.toUpperCase());
      if (st) resolvedStateId = st.id;
    }

    const newId = (dbStore?.officialWebsites?.length || 0) + 1;
    const cleanDomain = domain || new URL(official_url).hostname;

    const newWebsite = {
      id: newId,
      name,
      code: code || name.slice(0, 8).toUpperCase(),
      category_type,
      state_id: resolvedStateId || null,
      official_url,
      application_portal_url: application_portal_url || undefined,
      domain: cleanDomain,
      description: description || "",
      related_examinations: Array.isArray(related_examinations) ? related_examinations : [],
      contact_email: contact_email || undefined,
      contact_phone: contact_phone || undefined,
      verification_status: verification_status || "VERIFIED",
      verification_source: verification_source || "National Portal of India / Official Gazette",
      last_verified_at: new Date().toISOString(),
      is_ssl_valid: official_url.startsWith("https://"),
      response_time_ms: 45,
      is_active: true,
      is_featured: !!is_featured,
      view_count: 0
    };

    if (!dbStore?.officialWebsites) {
      if (dbStore) dbStore.officialWebsites = [];
    }
    dbStore?.officialWebsites.unshift(newWebsite);

    return NextResponse.json({
      message: "Website added to directory successfully",
      website: newWebsite
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to add website" }, { status: 500 });
  }
}
