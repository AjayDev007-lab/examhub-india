import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET() {
  try {
    const sources = (dbStore as any).jobSources || [];
    return NextResponse.json({
      total: sources.length,
      sources
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
