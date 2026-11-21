import { NextRequest, NextResponse } from "next/server";
import { schoolSyllabusData } from "@/lib/schoolData";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classLevel = searchParams.get("class");
    const boardCode = searchParams.get("board");
    const subject = searchParams.get("subject");

    let syllabusList = [...schoolSyllabusData];

    if (classLevel && classLevel !== "ALL") {
      syllabusList = syllabusList.filter((s) => s.class_level === classLevel);
    }
    if (boardCode && boardCode !== "ALL") {
      syllabusList = syllabusList.filter((s) => s.board_code.toLowerCase() === boardCode.toLowerCase());
    }
    if (subject && subject !== "ALL") {
      syllabusList = syllabusList.filter((s) => s.subject.toLowerCase() === subject.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      count: syllabusList.length,
      syllabus: syllabusList
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch syllabus" }, { status: 500 });
  }
}
