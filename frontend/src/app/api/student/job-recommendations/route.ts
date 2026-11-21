import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("user_id") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const pref = dbStore.studentJobPreferences.find((p: any) => p.userId === userId);
    const studentSkills = (pref?.skills || "").toLowerCase().split(",").map((s: string) => s.trim()).filter(Boolean);
    const studentRoles = (pref?.preferredRoles || "").toLowerCase().split(",").map((s: string) => s.trim()).filter(Boolean);
    const studentQual = (pref?.qualification || "GRADUATION").toUpperCase();
    const studentSector = (pref?.sectorPreference || "ALL").toUpperCase();

    const jobs = (dbStore.jobs || []).filter((j: any) => j.status === "PUBLISHED");

    const scored = jobs.map((j: any) => {
      let score = 50;
      const reasons: string[] = [];

      if (studentSector === "ALL" || j.sector === studentSector) {
        score += 15;
        reasons.push(`Sector match (${j.sector})`);
      }

      if ((j.qualification || "").toUpperCase().includes(studentQual)) {
        score += 20;
        reasons.push(`Qualification match (${j.qualification})`);
      }

      const jSkills = (j.required_skills || "").toLowerCase();
      const matchedSkills = studentSkills.filter((sk: string) => jSkills.includes(sk) || j.title.toLowerCase().includes(sk));
      if (matchedSkills.length > 0) {
        score += Math.min(20, matchedSkills.length * 8);
        reasons.push(`Matched skills: ${matchedSkills.slice(0, 3).join(", ")}`);
      }

      const matchedRoles = studentRoles.filter((r: string) => j.title.toLowerCase().includes(r));
      if (matchedRoles.length > 0) {
        score += 15;
        reasons.push(`Role match: ${matchedRoles[0]}`);
      }

      return {
        id: j.id,
        title: j.title,
        slug: j.slug,
        organization_name: j.organization_name,
        sector: j.sector,
        category: j.category,
        qualification: j.qualification,
        required_skills: j.required_skills,
        pay_scale: j.salary_range || j.pay_scale,
        location: j.location,
        total_vacancies: j.total_vacancies || j.vacancies_count,
        last_date_to_apply: j.application_end_date || j.last_date_to_apply,
        official_apply_url: j.official_application_url || j.official_apply_url,
        match_percentage: Math.min(98, score),
        match_reasons: reasons
      };
    });

    scored.sort((a: any, b: any) => b.match_percentage - a.match_percentage);

    return NextResponse.json({
      total: scored.length,
      recommendations: scored.slice(0, limit)
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
