import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const identifier = rawId.toLowerCase().trim();
    const isNum = !isNaN(Number(identifier));
    const targetId = isNum ? Number(identifier) : null;

    const website = (dbStore?.officialWebsites || []).find((w: any) => {
      if (targetId !== null && w.id === targetId) return true;
      if (w.slug && w.slug.toLowerCase() === identifier) return true;
      if (w.code && w.code.toLowerCase() === identifier) return true;
      return false;
    });

    if (!website || !website.is_active) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // Increment view count
    website.view_count = (website.view_count || 0) + 1;

    const states = dbStore?.states || [];
    const stateObj = website.state_id ? states.find((s) => s.id === website.state_id) : null;

    return NextResponse.json({
      ...website,
      slug: (website as any).slug || (website.code || String(website.id)).toLowerCase().replace(/_/g, "-"),
      organization_type: (website as any).organization_type || "CENTRAL",
      state: stateObj ? { id: stateObj.id, name: stateObj.name, code: stateObj.code, type: stateObj.type } : null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load website" }, { status: 500 });
  }
}
