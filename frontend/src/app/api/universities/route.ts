import { NextRequest, NextResponse } from "next/server";
import { initialUniversities, UniversityItem } from "@/lib/platformData";
import { dbStore } from "@/lib/data";

if (!(dbStore as any).universities) {
  (dbStore as any).universities = [...initialUniversities];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const state = searchParams.get("state");

    let universities: UniversityItem[] = (dbStore as any).universities || initialUniversities;

    if (state && state !== "ALL") {
      universities = universities.filter(u => u.state.toLowerCase() === state.toLowerCase());
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      universities = universities.filter(
        u => u.name.toLowerCase().includes(q) || u.city.toLowerCase().includes(q) || u.short_code.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      total: universities.length,
      universities
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch universities" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newUniv: UniversityItem = {
      id: Date.now(),
      name: body.name,
      short_code: body.short_code || body.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10),
      state: body.state || "Tamil Nadu",
      city: body.city || "Chennai",
      type: body.type || "STATE_GOVT",
      official_website: body.official_website || "https://university.ac.in",
      portal_url: body.portal_url || "https://university.ac.in/exams",
      logo_url: body.logo_url || "https://images.unsplash.com/photo-1562774053-701939374585?w=128&h=128&fit=crop",
      degrees_offered: body.degrees_offered || ["B.E.", "B.Tech.", "B.Sc.", "B.Com."],
      departments_count: body.departments_count || 12,
      papers_count: 0
    };

    if (!(dbStore as any).universities) {
      (dbStore as any).universities = [...initialUniversities];
    }
    (dbStore as any).universities.push(newUniv);

    return NextResponse.json({ success: true, university: newUniv });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create university" }, { status: 500 });
  }
}
