import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const lines = [
      "ExamHub India Platform Analytics Export",
      `Generated At (UTC),${new Date().toISOString()}`,
      "",
      "Metric Category,Indicator,Value",
      `Students,Total Registered Students,${dbStore.students.length}`,
      `Examinations,Total Examinations,${dbStore.exams.length}`,
      `Registrations,Total Exam Registrations,${dbStore.studentExamRegistrations.length}`,
      `Jobs,Total Recruitment Notices,${dbStore.jobs.length}`,
      `Directory,Official Government Websites,${dbStore.officialWebsites.length}`,
      "",
      "Top Published Recruitment Notices",
      "Job Title,Organization,Vacancies,Status"
    ];

    for (const j of dbStore.jobs.slice(0, 20)) {
      lines.push(`"${j.title}","${j.organization_name}",${j.total_vacancies || j.vacancies_count || 0},${j.status}`);
    }

    const csvContent = lines.join("\r\n");
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=examhub_analytics_${new Date().toISOString().split("T")[0]}.csv`
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 });
  }
}
