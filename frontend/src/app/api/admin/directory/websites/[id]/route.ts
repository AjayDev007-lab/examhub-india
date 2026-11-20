import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();

    const website = (dbStore?.officialWebsites || []).find((w) => w.id === id);
    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    Object.assign(website, body);
    website.last_verified_at = new Date().toISOString();

    return NextResponse.json({
      message: "Website updated successfully",
      website
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update website" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const website = (dbStore?.officialWebsites || []).find((w) => w.id === id);
    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    website.is_active = false;
    return NextResponse.json({ message: "Website deactivated successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete website" }, { status: 500 });
  }
}
