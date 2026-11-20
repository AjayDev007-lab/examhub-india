import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { examination_id, roll_number } = body;
    const exam = dbStore.exams.find(e => e.id === Number(examination_id)) || dbStore.exams[0];

    return NextResponse.json({
      id: 1,
      examination_id: exam.id,
      examination_name: exam.name,
      organization_name: exam.organization_name,
      student_identifier_roll: roll_number || "2604108821",
      student_identifier_reg: "RID-" + (roll_number || "2604108821"),
      student_name: "ADITYA SHARMA",
      date_of_birth: "2007-08-14",
      subject_marks: {
        "Physics": 168,
        "Chemistry": 172,
        "Biology / Botany": 170,
        "Biology / Zoology": 174
      },
      marks_obtained: 684.0,
      max_marks: 720.0,
      percentage: 95.0,
      grade: "DISTINCTION",
      rank: "AIR 142",
      qualifying_status: "QUALIFIED",
      scorecard_path: "scorecard_sample.pdf",
      is_official: true,
      result_status: "AVAILABLE",
      published_date: new Date().toISOString(),
      official_source_url: "https://ntaresults.nic.in",
      has_scorecard: true
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Result lookup failed" }, { status: 500 });
  }
}
