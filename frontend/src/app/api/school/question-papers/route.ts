import { NextRequest, NextResponse } from "next/server";
import { schoolQuestionPapersData } from "@/lib/schoolData";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classLevel = searchParams.get("class");
    const boardCode = searchParams.get("board");
    const subject = searchParams.get("subject");
    const year = searchParams.get("year");

    let papers = [...schoolQuestionPapersData];

    if (classLevel && classLevel !== "ALL") {
      papers = papers.filter((p) => p.class_level === classLevel);
    }
    if (boardCode && boardCode !== "ALL") {
      papers = papers.filter((p) => p.board_code.toLowerCase() === boardCode.toLowerCase());
    }
    if (subject && subject !== "ALL") {
      papers = papers.filter((p) => p.subject.toLowerCase().includes(subject.toLowerCase()));
    }
    if (year && year !== "ALL") {
      papers = papers.filter((p) => p.year.toString() === year);
    }

    return NextResponse.json({
      success: true,
      count: papers.length,
      papers
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch question papers" }, { status: 500 });
  }
}
