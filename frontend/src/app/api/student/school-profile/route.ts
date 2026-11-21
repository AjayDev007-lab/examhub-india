import { NextRequest, NextResponse } from "next/server";
import { defaultStudentSchoolProfile, StudentSchoolProfile } from "@/lib/schoolData";

let studentProfileStore: StudentSchoolProfile = { ...defaultStudentSchoolProfile };

export async function GET() {
  return NextResponse.json({
    success: true,
    profile: studentProfileStore
  });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    studentProfileStore = {
      ...studentProfileStore,
      ...body
    };
    return NextResponse.json({
      success: true,
      message: "School academic profile updated successfully",
      profile: studentProfileStore
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update school profile" }, { status: 500 });
  }
}
