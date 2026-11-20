import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const categoryType = searchParams.get("category_type")?.trim();
    const stateIdStr = searchParams.get("state_id");
    const stateCode = searchParams.get("state_code")?.toUpperCase().trim();
    const isFeaturedStr = searchParams.get("is_featured");

    // Check for student auth header or cookie to populate is_saved
    const authHeader = request.headers.get("authorization") || "";
    let currentUserId: number | null = null;
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      if (token.startsWith("token_") || token.startsWith("session_") || token.includes("student")) {
        currentUserId = 1; // default demo student ID
      }
    }

    const savedIds = new Set<number>();
    if (currentUserId && dbStore?.savedWebsites) {
      dbStore.savedWebsites
        .filter((s) => s.userId === currentUserId)
        .forEach((s) => savedIds.add(s.websiteId));
    }

    const states = dbStore?.states || [];
    const stateMap = new Map(states.map((s) => [s.id, s]));
    const stateCodeMap = new Map(states.map((s) => [s.code, s.id]));

    let targetStateId: number | null = null;
    if (stateIdStr) {
      targetStateId = parseInt(stateIdStr, 10);
    } else if (stateCode) {
      targetStateId = stateCodeMap.get(stateCode) || null;
    }

    let websites = (dbStore?.officialWebsites || []).filter((w) => w.is_active);

    if (categoryType && categoryType !== "ALL") {
      websites = websites.filter((w) => w.category_type === categoryType);
    }

    if (targetStateId !== null) {
      websites = websites.filter((w) => w.state_id === targetStateId);
    }

    if (isFeaturedStr === "true") {
      websites = websites.filter((w) => w.is_featured);
    }

    if (search) {
      websites = websites.filter((w) => {
        const inName = w.name.toLowerCase().includes(search);
        const inCode = w.code?.toLowerCase().includes(search);
        const inDomain = w.domain?.toLowerCase().includes(search);
        const inDesc = w.description?.toLowerCase().includes(search);
        const inExams = w.related_examinations?.some((e) => e.toLowerCase().includes(search));
        return inName || inCode || inDomain || inDesc || inExams;
      });
    }

    // Sort: featured first, then name
    websites.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return a.name.localeCompare(b.name);
    });

    const enriched = websites.map((w) => {
      const stateObj = w.state_id ? stateMap.get(w.state_id) : null;
      return {
        ...w,
        state: stateObj ? { id: stateObj.id, name: stateObj.name, code: stateObj.code, type: stateObj.type } : null,
        is_saved: savedIds.has(w.id)
      };
    });

    return NextResponse.json({
      total: enriched.length,
      websites: enriched
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch websites" }, { status: 500 });
  }
}
