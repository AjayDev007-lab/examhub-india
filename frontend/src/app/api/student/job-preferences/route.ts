import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("user_id") || "1");

    const pref = dbStore.studentJobPreferences.find((p: any) => p.userId === userId);
    if (!pref) {
      return NextResponse.json({
        user_id: userId,
        qualification: "GRADUATION",
        degree_department: "",
        graduation_year: null,
        skills: "",
        experience_level: "FRESHER",
        preferred_roles: "",
        preferred_locations: "All India",
        expected_salary_min: "",
        sector_preference: "ALL",
        employment_type_preference: "FULL_TIME",
        job_alerts_enabled: true,
        email_alerts_enabled: true,
        push_alerts_enabled: false
      });
    }

    return NextResponse.json({
      id: pref.id,
      user_id: pref.userId,
      qualification: pref.qualification,
      degree_department: pref.degreeDepartment,
      graduation_year: pref.graduationYear,
      skills: pref.skills,
      experience_level: pref.experienceLevel,
      preferred_roles: pref.preferredRoles,
      preferred_locations: pref.preferredLocations,
      expected_salary_min: pref.expectedSalaryMin,
      sector_preference: pref.sectorPreference,
      employment_type_preference: pref.employmentTypePreference,
      job_alerts_enabled: pref.jobAlertsEnabled,
      email_alerts_enabled: pref.emailAlertsEnabled,
      push_alerts_enabled: pref.pushAlertsEnabled
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load preferences" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("user_id") || "1");
    const body = await request.json();

    let pref = dbStore.studentJobPreferences.find((p: any) => p.userId === userId);
    if (!pref) {
      pref = {
        id: dbStore.studentJobPreferences.length + 1,
        userId,
        ...body
      };
      dbStore.studentJobPreferences.push(pref);
    } else {
      if (body.qualification !== undefined) pref.qualification = body.qualification;
      if (body.degree_department !== undefined) pref.degreeDepartment = body.degree_department;
      if (body.graduation_year !== undefined) pref.graduationYear = body.graduation_year;
      if (body.skills !== undefined) pref.skills = body.skills;
      if (body.experience_level !== undefined) pref.experienceLevel = body.experience_level;
      if (body.preferred_roles !== undefined) pref.preferredRoles = body.preferred_roles;
      if (body.preferred_locations !== undefined) pref.preferredLocations = body.preferred_locations;
      if (body.expected_salary_min !== undefined) pref.expectedSalaryMin = body.expected_salary_min;
      if (body.sector_preference !== undefined) pref.sectorPreference = body.sector_preference;
      if (body.employment_type_preference !== undefined) pref.employmentTypePreference = body.employment_type_preference;
      if (body.job_alerts_enabled !== undefined) pref.jobAlertsEnabled = body.job_alerts_enabled;
      if (body.email_alerts_enabled !== undefined) pref.emailAlertsEnabled = body.email_alerts_enabled;
    }

    return NextResponse.json({ success: true, message: "Career preferences updated successfully!" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}
