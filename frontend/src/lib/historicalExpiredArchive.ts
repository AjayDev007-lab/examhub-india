// ============================================================================
// EXAMHUB INDIA — HISTORICAL EXPIRED ARCHIVE & QUARANTINED OPPORTUNITIES
// Server-side library module containing audited opportunities
// Segregated outside Next.js route handlers to maintain strict App Router compliance
// ============================================================================

export interface HistoricalOpportunity {
  id: string;
  title: string;
  organization_name: string;
  sector: string;
  category: string;
  location: string;
  qualification: string;
  experience_required: string;
  salary_range: string;
  application_start_date: string;
  application_end_date: string | null;
  vacancies_count?: number | null;
  status: "OPEN" | "EXPIRED" | "UPCOMING" | "UNVERIFIABLE";
  is_expired: boolean;
  application_action_disabled: boolean;
  is_eligible_for_publishing: boolean;
  quarantine_reason?: string;
  official_notification_pdf: string | null;
  official_application_url: string;
  source_website_url: string;
  archive_notes?: string;
}

// ----------------------------------------------------------------------------
// PHASE 1: PRESERVED HISTORICAL EXPIRED ARCHIVE (Never Enqueued to Active Queue)
// Current System Date: 25 November 2026
// ----------------------------------------------------------------------------
export const HISTORICAL_EXPIRED_ARCHIVE: HistoricalOpportunity[] = [
  {
    id: "upsc-cds-1-2026-expired",
    title: "UPSC Combined Defence Services Examination (CDS I) 2026",
    organization_name: "Union Public Service Commission (UPSC)",
    sector: "DEFENCE",
    category: "GOVERNMENT",
    location: "All India",
    qualification: "Degree of a recognized University or equivalent / Engineering Degree for IAF/Navy",
    experience_required: "Fresher / Unmarried Male & Female",
    salary_range: "Level 10 (Rs. 56,100 - Rs. 1,77,500)",
    application_start_date: "2025-12-10T00:00:00+05:30",
    application_end_date: "2026-01-09T18:00:00+05:30", // EXPIRED: Closed 9 Jan 2026
    status: "EXPIRED",
    is_expired: true,
    application_action_disabled: true,
    is_eligible_for_publishing: false,
    official_notification_pdf: "https://upsc.gov.in/sites/default/files/Notice-CDSI-2026.pdf",
    official_application_url: "https://upsconline.nic.in",
    source_website_url: "https://upsc.gov.in",
    archive_notes: "Application window closed on 9 January 2026 (18:00 IST). Historical archive record."
  },
  {
    id: "ssc-chsl-2026-expired",
    title: "SSC Combined Higher Secondary Level (CHSL) Examination 2026",
    organization_name: "Staff Selection Commission (SSC)",
    sector: "CENTRAL_GOVT",
    category: "GOVERNMENT",
    location: "All India",
    qualification: "12th Standard or equivalent examination from a recognized Board or University",
    experience_required: "Fresher",
    salary_range: "Pay Level-2 to Pay Level-5 (Rs. 19,900 - Rs. 92,300)",
    application_start_date: "2026-04-02T00:00:00+05:30",
    application_end_date: "2026-05-18T23:00:00+05:30", // EXPIRED: Closed 18 May 2026
    status: "EXPIRED",
    is_expired: true,
    application_action_disabled: true,
    is_eligible_for_publishing: false,
    official_notification_pdf: "https://ssc.gov.in/notice-chsl-2026.pdf",
    official_application_url: "https://ssc.gov.in",
    source_website_url: "https://ssc.gov.in",
    archive_notes: "Application window closed on 18 May 2026 (23:00 IST). Current portal notices concern Tier-II examination/admit card release, NOT open applications. Historical archive record."
  }
];

// ----------------------------------------------------------------------------
// QUARANTINED OPPORTUNITIES (Held Back from Public Broadcasting)
// ----------------------------------------------------------------------------
export const QUARANTINED_OPPORTUNITIES: HistoricalOpportunity[] = [
  {
    id: "upsc-cds-1-2027-upcoming",
    title: "UPSC Combined Defence Services Examination (CDSE I) 2027",
    organization_name: "Union Public Service Commission (UPSC)",
    sector: "CENTRAL_GOVT",
    category: "GOVERNMENT",
    location: "All India",
    qualification: "Degree of a recognized University (or B.E. for Air Force / Navy)",
    experience_required: "Fresher / Unmarried Candidates",
    salary_range: "Level 10 (Rs. 56,100 - Rs. 1,77,500)",
    application_start_date: "2026-12-02T10:00:00+05:30", // Official notification release date
    application_end_date: "2026-12-22T18:00:00+05:30", // Scheduled closing date per UPSC Calendar
    vacancies_count: null, // To be notified in official Gazette on 02/12/2026
    status: "UPCOMING",
    is_expired: false,
    application_action_disabled: true,
    is_eligible_for_publishing: false,
    quarantine_reason: "UPSC Annual Examination Calendar lists Notification Date as 02/12/2026 and Closing Date as 22/12/2026. As of 25/11/2026, the official notification is not yet released and application window is closed. Strictly blocked from public publishing until notification is officially released.",
    official_notification_pdf: null,
    official_application_url: "https://upsconline.nic.in",
    source_website_url: "https://upsc.gov.in",
    archive_notes: "Scheduled in UPSC Annual Calendar. Notification expected on 02/12/2026."
  },
  {
    id: "zoho-sde-chennai-2026-quarantined",
    title: "Zoho Corporation Junior Software Development Engineer",
    organization_name: "Zoho Corporation",
    sector: "IT_SOFTWARE",
    category: "PRIVATE",
    location: "Chennai, Tamil Nadu",
    qualification: "B.E / B.Tech / MCA / M.Sc in Computer Science or related IT stream",
    experience_required: "0 - 2 Years",
    salary_range: "As per company standards",
    application_start_date: "2026-01-01T00:00:00+05:30",
    application_end_date: null, // Not specified by official Zoho Careers portal
    vacancies_count: null, // Not specified by official Zoho Careers portal
    status: "UNVERIFIABLE",
    is_expired: false,
    application_action_disabled: false,
    is_eligible_for_publishing: false,
    quarantine_reason: "Official Zoho Careers portal conducts ongoing rolling hiring without specifying a fixed application deadline or vacancy count. In compliance with ExamHub 5-Pillar safety rules, missing deadlines must not be assumed, and the record is held back from public automated publishing.",
    official_notification_pdf: null,
    official_application_url: "https://www.zoho.com/careers/",
    source_website_url: "https://www.zoho.com/careers/",
    archive_notes: "Active rolling recruitment portal. Excluded from Telegram automated dispatch due to unspecified deadline."
  },
  {
    id: "infosys-dse-2026-quarantined",
    title: "Infosys Digital Specialist Engineer & Specialist Programmer",
    organization_name: "Infosys Limited",
    sector: "IT_SOFTWARE",
    category: "PRIVATE",
    location: "Remote / Hybrid (All India)",
    qualification: "B.E / B.Tech / M.E / M.Tech in CS/IT/ECE/EE with min 65% aggregate",
    experience_required: "Fresher / 2025-2026 Batch",
    salary_range: "As per company standards",
    application_start_date: "2026-01-15T00:00:00+05:30",
    application_end_date: null, // Not specified by official Infosys portal
    vacancies_count: null, // Not specified by official Infosys portal
    status: "UNVERIFIABLE",
    is_expired: false,
    application_action_disabled: false,
    is_eligible_for_publishing: false,
    quarantine_reason: "Official Infosys talent portal conducts continuous registration drives without an explicit application deadline or public vacancy quota. In compliance with ExamHub 5-Pillar safety rules, missing deadlines must not be assumed, and the record is held back from public automated publishing.",
    official_notification_pdf: null,
    official_application_url: "https://career.infosys.com",
    source_website_url: "https://www.infosys.com/careers",
    archive_notes: "Continuous registration portal. Excluded from Telegram automated dispatch due to unspecified deadline."
  }
];

// ----------------------------------------------------------------------------
// PHASE 1 & 6: ACTIVE VERIFIED OPPORTUNITIES (Strictly Verified, Open & Eligible)
// When 0 opportunities meet the strict active criteria, this array is empty,
// ensuring zero questionable jobs can ever be enqueued to Telegram queue.
// ----------------------------------------------------------------------------
export const ACTIVE_VERIFIED_OPPORTUNITIES: HistoricalOpportunity[] = [];
