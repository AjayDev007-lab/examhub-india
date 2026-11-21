import { NextRequest, NextResponse } from "next/server";
import { schoolBoardsData } from "@/lib/schoolData";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const board = schoolBoardsData.find(
      (b) => b.id.toString() === id || b.code.toLowerCase() === id.toLowerCase()
    );

    if (!board) {
      return NextResponse.json({ error: "School board not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, board });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch board" }, { status: 500 });
  }
}
