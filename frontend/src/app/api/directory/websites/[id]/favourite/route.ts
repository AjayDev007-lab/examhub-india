import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const website = (dbStore?.officialWebsites || []).find((w) => w.id === id);

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    if (!dbStore?.savedWebsites) {
      if (dbStore) dbStore.savedWebsites = [];
    }

    const userId = 1; // demo student
    const existingIndex = dbStore!.savedWebsites.findIndex(
      (s) => s.userId === userId && s.websiteId === id
    );

    let saved = false;
    if (existingIndex >= 0) {
      dbStore!.savedWebsites.splice(existingIndex, 1);
      saved = false;
    } else {
      dbStore!.savedWebsites.push({
        userId,
        websiteId: id,
        createdAt: new Date().toISOString()
      });
      saved = true;
    }

    return NextResponse.json({
      saved,
      message: saved ? "Saved to your bookmarks" : "Removed from bookmarks"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to toggle favourite" }, { status: 500 });
  }
}
