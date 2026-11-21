import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cleanSlug = slug.toLowerCase().trim();

    const exam = (dbStore?.examApplications || []).find(
      (e) => e.slug.toLowerCase() === cleanSlug || String(e.id) === cleanSlug
    );

    if (!exam) {
      return NextResponse.json({ error: "Examination application not found" }, { status: 404 });
    }

    return NextResponse.json(exam);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load examination" }, { status: 500 });
  }
}
