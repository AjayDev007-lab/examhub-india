import { NextRequest, NextResponse } from "next/server";
import { initialSchoolChapters, SchoolChapterResource } from "@/lib/platformData";
import { dbStore } from "@/lib/data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chapters: SchoolChapterResource[] = (dbStore as any).schoolChapters || initialSchoolChapters;
    const chapter = chapters.find(c => c.id === id);

    if (!chapter) {
      return NextResponse.json({ error: "Chapter resource not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      chapter
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load chapter" }, { status: 500 });
  }
}
