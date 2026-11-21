import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let apps = dbStore?.studentApplications || [];

    if (status && status !== "ALL") {
      apps = apps.filter((a) => a.status === status);
    }

    return NextResponse.json({
      total: apps.length,
      applications: apps
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load student applications" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { exam_id, exam_slug, exam_name, authority_code, conducting_authority, notes, status, application_number, roll_number } = body;

    if (!exam_id && !exam_slug && !exam_name) {
      return NextResponse.json({ error: "Missing required examination details" }, { status: 400 });
    }

    if (!dbStore?.studentApplications) {
      if (dbStore) dbStore.studentApplications = [];
    }

    // Check if already in tracker
    const existing = dbStore!.studentApplications.find(
      (a) => (exam_id && a.exam_id === exam_id) || (exam_slug && a.exam_slug === exam_slug)
    );

    if (existing) {
      if (status) existing.status = status;
      if (notes) existing.private_notes = notes;
      if (application_number) existing.application_number = application_number;
      if (roll_number) existing.roll_number = roll_number;
      existing.updated_at = new Date().toISOString();
      return NextResponse.json({ message: "Application tracker updated", application: existing });
    }

    const newApp = {
      id: dbStore!.studentApplications.length + 1,
      user_id: 1, // Demo user / logged-in student
      exam_id: exam_id || 1,
      exam_slug: exam_slug || "custom-exam",
      exam_name: exam_name || "General Examination",
      authority_code: authority_code || "EXAM",
      conducting_authority: conducting_authority || "Examination Board",
      application_number: application_number || "",
      roll_number: roll_number || "",
      status: status || "APPLICATION_STARTED",
      submission_date: status === "SUBMITTED" ? new Date().toISOString() : undefined,
      private_notes: notes || "",
      reminders_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    dbStore!.studentApplications.unshift(newApp);

    return NextResponse.json({
      message: "Application added to personal tracker successfully",
      application: newApp
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to add application" }, { status: 500 });
  }
}
