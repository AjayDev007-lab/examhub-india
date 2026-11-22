// ============================================================================
// EXAMHUB INDIA — WHATSAPP JOB NOTIFICATION ENGINE
// Formats, deduplicates, and manages WhatsApp Channel and Admin dispatches
// ============================================================================

export interface JobWhatsAppPayload {
  id?: number | string;
  title: string;
  slug?: string;
  organization_name?: string;
  location?: string;
  qualification?: string;
  vacancies_count?: number | string;
  total_vacancies?: number | string;
  application_end_date?: string;
  last_date_to_apply?: string;
  salary_range?: string;
  pay_scale?: string;
  official_application_url?: string;
  official_apply_url?: string;
  category?: string;
  sector?: string;
  status?: string;
  whatsapp_status?: "PENDING" | "GENERATED" | "READY_TO_POST" | "SENT_TO_ADMIN" | "FAILED";
  whatsapp_message?: string | null;
  whatsapp_generated_at?: string | null;
  whatsapp_sent_at?: string | null;
}

export const EXAMHUB_WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029VbA1ZLpJENy3wwL6VC0s";
export const EXAMHUB_BASE_URL = "https://examhub-india.vercel.app";

/**
 * Generate a clean, attractive, professional WhatsApp notification
 * perfectly formatted for WhatsApp Channel broadcasts and Admin alerts.
 */
export function generateJobWhatsAppMessage(job: JobWhatsAppPayload): string {
  const title = job.title?.trim() || "New Job Recruitment Notification";
  const organization = job.organization_name?.trim() || "Official Examination Board";
  const location = job.location?.trim() || "All India";
  const qualification = job.qualification?.trim() || "Graduate / Check Official Gazette";

  const rawVacancies = job.vacancies_count ?? job.total_vacancies;
  const vacancyStr =
    rawVacancies !== undefined && rawVacancies !== null && Number(rawVacancies) > 0
      ? `${Number(rawVacancies).toLocaleString("en-IN")} Posts`
      : "Multiple Posts (Refer Notice)";

  const salary =
    job.salary_range?.trim() ||
    job.pay_scale?.trim() ||
    "As per 7th CPC / State Pay Matrix / Industry Norms";

  // Parse and format deadline
  const rawDeadline = job.application_end_date || job.last_date_to_apply;
  let deadlineStr = "Refer Official Notification";
  if (rawDeadline) {
    try {
      const d = new Date(rawDeadline);
      if (!isNaN(d.getTime())) {
        deadlineStr = d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric"
        });
      } else {
        deadlineStr = String(rawDeadline);
      }
    } catch {
      deadlineStr = String(rawDeadline);
    }
  }

  const applyUrl =
    job.official_application_url?.trim() ||
    job.official_apply_url?.trim() ||
    `${EXAMHUB_BASE_URL}/jobs`;

  const portalUrl = job.slug
    ? `${EXAMHUB_BASE_URL}/jobs/${job.slug}`
    : `${EXAMHUB_BASE_URL}/jobs`;

  return `📢 *NEW JOB ALERT — EXAMHUB INDIA* 🇮🇳
━━━━━━━━━━━━━━━━━━━━━━
💼 *Post Name:* ${title}
🏛️ *Department:* ${organization}
📍 *Job Location:* ${location}
🎓 *Qualification:* ${qualification}
👥 *Total Vacancies:* ${vacancyStr}
💰 *Pay Scale / Salary:* ${salary}
⏳ *Last Date to Apply:* ${deadlineStr}
━━━━━━━━━━━━━━━━━━━━━━
🔗 *Official Apply Link:*
${applyUrl}

🌐 *Full Details & Syllabus on ExamHub:*
${portalUrl}
━━━━━━━━━━━━━━━━━━━━━━
📲 *Join ExamHub India Official WhatsApp Channel:*
${EXAMHUB_WHATSAPP_CHANNEL_URL}
_Get instant exam dates, admit cards, result alerts & verified jobs directly on WhatsApp!_`;
}

/**
 * Builds a direct WhatsApp Web / App share URL
 */
export function buildWhatsAppShareUrl(message: string, phoneNumber?: string): string {
  const encodedText = encodeURIComponent(message);
  if (phoneNumber) {
    const cleanNumber = phoneNumber.replace(/[^\d]/g, "");
    return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}
