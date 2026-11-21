import { NextRequest, NextResponse } from "next/server";
import { schoolResultsData } from "@/lib/schoolData";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classLevel = searchParams.get("class"); // "10" | "11" | "12"
    const boardCode = searchParams.get("board");
    const status = searchParams.get("status");
    const q = searchParams.get("q")?.toLowerCase();

    let results = [...schoolResultsData];

    if (classLevel && classLevel !== "ALL") {
      results = results.filter((r) => r.class_level === classLevel);
    }
    if (boardCode && boardCode !== "ALL") {
      results = results.filter((r) => r.board_code.toLowerCase() === boardCode.toLowerCase());
    }
    if (status && status !== "ALL") {
      results = results.filter((r) => r.status === status);
    }
    if (q) {
      results = results.filter(
        (r) =>
          r.exam_name.toLowerCase().includes(q) ||
          r.board_name.toLowerCase().includes(q) ||
          r.board_code.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      results
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch school results" }, { status: 500 });
  }
}
