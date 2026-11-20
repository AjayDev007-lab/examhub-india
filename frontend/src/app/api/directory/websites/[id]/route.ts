import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const website = (dbStore?.officialWebsites || []).find((w) => w.id === id);

    if (!website || !website.is_active) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // Increment view count
    website.view_count = (website.view_count || 0) + 1;

    const states = dbStore?.states || [];
    const stateObj = website.state_id ? states.find((s) => s.id === website.state_id) : null;

    return NextResponse.json({
      ...website,
      state: stateObj ? { id: stateObj.id, name: stateObj.name, code: stateObj.code, type: stateObj.type } : null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load website" }, { status: 500 });
  }
}
