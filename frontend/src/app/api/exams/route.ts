import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET() {
  return NextResponse.json(dbStore.exams);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const org = dbStore.organizations.find(o => o.id === Number(body.organization_id));
    const newExam = {
      id: dbStore.exams.length + 1,
      organization_id: Number(body.organization_id),
      organization_name: org?.name || "ExamHub Board",
      organization_code: org?.code || "EXAM",
      name: body.name.trim(),
      code: body.code.trim().toUpperCase(),
      exam_type: body.exam_type || "GOVERNMENT",
      description: body.description || "",
      year: Number(body.year) || 2026,
      cycle: body.cycle || "Annual",
      requires_dob: true,
      requires_captcha: false,
      is_active: true
    };
    dbStore.exams.unshift(newExam);
    return NextResponse.json(newExam, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed" }, { status: 500 });
  }
}
