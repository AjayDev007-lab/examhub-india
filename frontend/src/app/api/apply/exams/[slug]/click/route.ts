import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function POST(
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

    exam.apply_clicks = (exam.apply_clicks || 0) + 1;

    return NextResponse.json({
      message: "Click tracked",
      slug: exam.slug,
      destination_url: exam.official_application_url,
      destination_authority: exam.conducting_authority,
      apply_clicks: exam.apply_clicks
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to record click" }, { status: 500 });
  }
}
