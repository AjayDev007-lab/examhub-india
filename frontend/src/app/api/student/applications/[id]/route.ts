import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);

    const app = (dbStore?.studentApplications || []).find((a) => a.id === id);
    if (!app) {
      return NextResponse.json({ error: "Application record not found" }, { status: 404 });
    }

    // Attach exam details if available
    const exam = (dbStore?.examApplications || []).find((e) => e.slug === app.exam_slug || e.id === app.exam_id);

    return NextResponse.json({
      application: app,
      examination_details: exam || null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load application details" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const body = await request.json();

    const app = (dbStore?.studentApplications || []).find((a) => a.id === id);
    if (!app) {
      return NextResponse.json({ error: "Application record not found" }, { status: 404 });
    }

    if (body.status !== undefined) {
      app.status = body.status;
      if (body.status === "SUBMITTED" && !app.submission_date) {
        app.submission_date = new Date().toISOString();
      }
    }
    if (body.application_number !== undefined) app.application_number = body.application_number;
    if (body.roll_number !== undefined) app.roll_number = body.roll_number;
    if (body.private_notes !== undefined) app.private_notes = body.private_notes;
    if (body.reminders_active !== undefined) app.reminders_active = body.reminders_active;
    app.updated_at = new Date().toISOString();

    return NextResponse.json({
      message: "Application updated successfully",
      application: app
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update application" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);

    const index = (dbStore?.studentApplications || []).findIndex((a) => a.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Application record not found" }, { status: 404 });
    }

    dbStore!.studentApplications.splice(index, 1);

    return NextResponse.json({ message: "Application removed from tracker" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete application" }, { status: 500 });
  }
}
