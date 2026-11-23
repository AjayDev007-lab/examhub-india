import { NextRequest, NextResponse } from "next/server";
import { initialUniversityQuestionPapers, UniversityQuestionPaper } from "@/lib/platformData";
import { dbStore } from "@/lib/data";

if (!(dbStore as any).universityPapers) {
  (dbStore as any).universityPapers = [...initialUniversityQuestionPapers];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const universityId = searchParams.get("university_id");
    const degree = searchParams.get("degree");
    const semester = searchParams.get("semester");
    const year = searchParams.get("year");
    const search = searchParams.get("search");

    let papers: UniversityQuestionPaper[] = (dbStore as any).universityPapers || initialUniversityQuestionPapers;

    if (universityId && universityId !== "ALL") {
      papers = papers.filter(p => p.university_id === parseInt(universityId));
    }
    if (degree && degree !== "ALL") {
      papers = papers.filter(p => p.degree.toLowerCase() === degree.toLowerCase());
    }
    if (semester && semester !== "ALL") {
      papers = papers.filter(p => p.semester === parseInt(semester));
    }
    if (year && year !== "ALL") {
      papers = papers.filter(p => p.exam_year === parseInt(year));
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      papers = papers.filter(
        p =>
          p.subject_name.toLowerCase().includes(q) ||
          p.subject_code.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      total: papers.length,
      papers
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch question papers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newPaper: UniversityQuestionPaper = {
      id: Date.now(),
      university_id: body.university_id || 1,
      university_name: body.university_name || "Anna University",
      university_code: body.university_code || "ANNA_UNIV",
      degree: body.degree || "B.E.",
      department: body.department || "Computer Science and Engineering",
      semester: parseInt(body.semester) || 1,
      subject_name: body.subject_name,
      subject_code: body.subject_code,
      exam_year: parseInt(body.exam_year) || 2025,
      exam_session: body.exam_session || "NOV_DEC",
      exam_type: body.exam_type || "REGULAR",
      regulation: body.regulation || "Regulation 2021",
      pdf_url: body.pdf_url || "https://archive.org/details/sample_paper.pdf",
      file_size_mb: body.file_size_mb || 1.2,
      download_count: 0,
      description: body.description || "Official university examination question paper.",
      uploaded_at: new Date().toISOString()
    };

    if (!(dbStore as any).universityPapers) {
      (dbStore as any).universityPapers = [...initialUniversityQuestionPapers];
    }
    (dbStore as any).universityPapers.unshift(newPaper);

    return NextResponse.json({ success: true, paper: newPaper });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to add question paper" }, { status: 500 });
  }
}
