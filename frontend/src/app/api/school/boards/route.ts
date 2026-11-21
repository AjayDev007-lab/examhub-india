import { NextRequest, NextResponse } from "next/server";
import { schoolBoardsData } from "@/lib/schoolData";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "NATIONAL" | "STATE"
    const state = searchParams.get("state");
    const q = searchParams.get("q")?.toLowerCase();

    let boards = [...schoolBoardsData];

    if (type && type !== "ALL") {
      boards = boards.filter((b) => b.type === type);
    }
    if (state && state !== "ALL") {
      boards = boards.filter((b) => b.state_name.toLowerCase().includes(state.toLowerCase()));
    }
    if (q) {
      boards = boards.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q) ||
          b.short_name.toLowerCase().includes(q) ||
          b.state_name.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      count: boards.length,
      boards
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch boards" }, { status: 500 });
  }
}
