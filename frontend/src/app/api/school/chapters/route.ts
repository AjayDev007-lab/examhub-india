import { NextRequest, NextResponse } from "next/server";
import { initialSchoolChapters, SchoolChapterResource } from "@/lib/platformData";
import { dbStore } from "@/lib/data";

if (!(dbStore as any).schoolChapters) {
  (dbStore as any).schoolChapters = [...initialSchoolChapters];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const board = searchParams.get("board");
    const classLevel = searchParams.get("class");
    const subject = searchParams.get("subject");

    let chapters: SchoolChapterResource[] = (dbStore as any).schoolChapters || initialSchoolChapters;

    if (board && board !== "ALL") {
      chapters = chapters.filter(c => c.board_code.toLowerCase() === board.toLowerCase());
    }
    if (classLevel && classLevel !== "ALL") {
      chapters = chapters.filter(c => c.class_level === classLevel);
    }
    if (subject && subject !== "ALL") {
      chapters = chapters.filter(c => c.subject.toLowerCase().includes(subject.toLowerCase()));
    }

    return NextResponse.json({
      success: true,
      total: chapters.length,
      chapters
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch chapters" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newChapter: SchoolChapterResource = {
      id: body.id || `ch-${Date.now()}`,
      board_code: body.board_code || "CBSE",
      board_name: body.board_name || "Central Board of Secondary Education",
      class_level: body.class_level || "10",
      subject: body.subject || "Science",
      subject_code: body.subject_code,
      chapter_number: parseInt(body.chapter_number) || 1,
      chapter_title: body.chapter_title,
      summary_notes: body.summary_notes || "# Chapter Notes\nDetailed notes here.",
      pdf_notes_url: body.pdf_notes_url || "",
      video_lessons: body.video_lessons || [],
      previous_exam_questions: body.previous_exam_questions || [],
      important_questions: body.important_questions || [],
      practice_quiz: body.practice_quiz || []
    };

    if (!(dbStore as any).schoolChapters) {
      (dbStore as any).schoolChapters = [...initialSchoolChapters];
    }
    (dbStore as any).schoolChapters.push(newChapter);

    return NextResponse.json({ success: true, chapter: newChapter });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create chapter" }, { status: 500 });
  }
}
