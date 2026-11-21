import { NextRequest, NextResponse } from "next/server";
import { schoolTextbooksData } from "@/lib/schoolData";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const book = schoolTextbooksData.find(
      (b) => b.id.toString() === id || b.slug.toLowerCase() === id.toLowerCase()
    );

    if (!book) {
      return NextResponse.json({ error: "Textbook not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, book });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch textbook" }, { status: 500 });
  }
}
