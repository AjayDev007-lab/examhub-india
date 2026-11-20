import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const userId = 1; // default demo student
    const savedList = (dbStore?.savedWebsites || []).filter((s) => s.userId === userId);
    const websiteIds = new Set(savedList.map((s) => s.websiteId));

    const favourites = (dbStore?.officialWebsites || [])
      .filter((w) => websiteIds.has(w.id) && w.is_active)
      .map((w) => ({
        ...w,
        is_saved: true
      }));

    return NextResponse.json({
      total: favourites.length,
      favourites
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load favourites" }, { status: 500 });
  }
}
