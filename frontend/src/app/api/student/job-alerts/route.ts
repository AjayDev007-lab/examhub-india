import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("user_id") || "1");

    const subs = (dbStore.jobAlertSubscriptions || []).filter((s: any) => s.userId === userId && s.isActive);
    const jobs = (dbStore.jobs || []).filter((j: any) => j.status === "PUBLISHED");

    const alerts = jobs.slice(0, 20).map((j: any) => {
      const lastDate = j.application_end_date || j.last_date_to_apply;
      let isClosingSoon = false;
      if (lastDate) {
        const diffDays = Math.ceil((new Date(lastDate).getTime() - Date.now()) / (1000 * 3600 * 24));
        if (diffDays >= 0 && diffDays <= 4) isClosingSoon = true;
      }

      return {
        id: `alert-${j.id}`,
        job_id: j.id,
        title: isClosingSoon ? `Closing Soon: ${j.title}` : `New Opening: ${j.title}`,
        organization_name: j.organization_name,
        slug: j.slug,
        alert_type: isClosingSoon ? "DEADLINE_CLOSING" : "NEW_VACANCY",
        sector: j.sector,
        category: j.category,
        vacancies_count: j.total_vacancies || j.vacancies_count,
        last_date_to_apply: lastDate,
        official_apply_url: j.official_application_url || j.official_apply_url,
        is_closing_soon: isClosingSoon
      };
    });

    return NextResponse.json({
      total_alerts: alerts.length,
      alerts,
      subscriptions: subs
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load job alerts" }, { status: 500 });
  }
}
