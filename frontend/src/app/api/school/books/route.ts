import { NextRequest, NextResponse } from "next/server";
import { schoolTextbooksData } from "@/lib/schoolData";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classLevel = searchParams.get("class"); // "10" | "11" | "12"
    const stream = searchParams.get("stream"); // "SCIENCE" | "COMMERCE" | "HUMANITIES" | "GENERAL"
    const boardCode = searchParams.get("board");
    const subject = searchParams.get("subject");
    const language = searchParams.get("language");
    const q = searchParams.get("q")?.toLowerCase();

    let books = [...schoolTextbooksData];

    if (classLevel && classLevel !== "ALL") {
      books = books.filter((b) => b.class_level === classLevel);
    }
    if (stream && stream !== "ALL") {
      books = books.filter((b) => !b.stream || b.stream === stream || b.stream === "GENERAL");
    }
    if (boardCode && boardCode !== "ALL") {
      books = books.filter((b) => b.board_code.toLowerCase() === boardCode.toLowerCase());
    }
    if (subject && subject !== "ALL") {
      books = books.filter((b) => b.subject.toLowerCase() === subject.toLowerCase());
    }
    if (language && language !== "ALL") {
      books = books.filter((b) => b.language.toLowerCase() === language.toLowerCase());
    }
    if (q) {
      books = books.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.subject.toLowerCase().includes(q) ||
          b.publisher.toLowerCase().includes(q) ||
          b.board_name.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      count: books.length,
      books
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch textbooks" }, { status: 500 });
  }
}
