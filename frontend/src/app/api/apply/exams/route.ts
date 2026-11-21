import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const query = searchParams.get("q")?.toLowerCase();
    const state = searchParams.get("state")?.toLowerCase();
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;

    let exams = dbStore?.examApplications || [];

    if (category && category !== "ALL" && category !== "all-exams") {
      const cleanCategory = category.toUpperCase().replace(/-/g, "_");
      exams = exams.filter((e) => {
        if (cleanCategory === "CLOSING_SOON") return e.status === "CLOSING_SOON";
        if (cleanCategory === "UPCOMING") return e.status === "UPCOMING";
        if (cleanCategory === "GOVERNMENT") return e.category === "CENTRAL_GOVERNMENT" || e.category === "STATE_GOVERNMENT";
        return e.category === cleanCategory || e.category.includes(cleanCategory);
      });
    }

    if (status) {
      exams = exams.filter((e) => e.status === status.toUpperCase());
    }

    if (state && state !== "all") {
      exams = exams.filter((e) => 
        (e.state_name && e.state_name.toLowerCase().includes(state)) ||
        (e.state_code && e.state_code.toLowerCase() === state) ||
        e.state_name === "All India"
      );
    }

    if (query) {
      exams = exams.filter((e) => 
        e.name.toLowerCase().includes(query) ||
        e.conducting_authority.toLowerCase().includes(query) ||
        e.authority_code.toLowerCase().includes(query) ||
        e.qualification.toLowerCase().includes(query) ||
        e.category_label.toLowerCase().includes(query)
      );
    }

    if (limit) {
      exams = exams.slice(0, limit);
    }

    return NextResponse.json({
      total: exams.length,
      exams
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load examination applications" }, { status: 500 });
  }
}
