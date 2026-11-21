export interface MonitoringSource {
  id: number;
  name: string;
  organization_code: string;
  organization_name: string;
  category: "GOVT_JOB" | "PRIVATE_JOB" | "EXAM" | "RESULT" | "SCHOOL_RESULT" | "ADMIT_CARD" | "SCHOLARSHIP" | "ADMISSION";
  state_code: string;
  source_type: "OFFICIAL_GOVT" | "EMPLOYER_CAREER" | "EDUCATION_BOARD" | "TESTING_AGENCY";
  official_website_url: string;
  notification_url: string;
  verification_status: "VERIFIED" | "PENDING" | "NEEDS_REVIEW" | "BROKEN" | "REDIRECT_CHANGED" | "SUSPICIOUS" | "DISABLED";
  check_frequency: "6_HOURS" | "DAILY" | "TWICE_DAILY";
  is_enabled: boolean;
  priority: number;
  last_checked_at: string;
  last_successful_check_at: string;
}

export interface MonitoringSchedule {
  id: number;
  slot_name: string;
  time_slot: string; // "06:00", "12:00", "18:00", "22:00"
  timezone: string; // "Asia/Kolkata"
  is_active: boolean;
  category_scope: string;
}

export interface DetectedUpdate {
  id: number;
  title: string;
  organization: string;
  category: "GOVT_JOB" | "PRIVATE_JOB" | "EXAM" | "RESULT" | "SCHOOL_RESULT" | "ADMIT_CARD" | "SCHOLARSHIP" | "ADMISSION";
  state: string;
  description: string;
  qualification?: string;
  vacancies_count?: number;
  official_notification_url?: string;
  application_url?: string;
  source_url: string;
  important_dates: {
    application_start?: string;
    application_end?: string;
    exam_date?: string;
    result_date?: string;
    admit_card_date?: string;
  };
  publication_date?: string;
  detection_date: string;
  verification_status: "DETECTED" | "PROCESSING" | "PENDING_VERIFICATION" | "APPROVED" | "PUBLISHED" | "REJECTED" | "ARCHIVED";
  change_type: "NEW" | "UPDATED" | "DUPLICATE" | "EXPIRED" | "CANCELLED" | "DATE_CHANGED" | "BROKEN_LINK";
  is_officially_verified: boolean;
  verification_badge: "OFFICIALLY_VERIFIED" | "THIRD_PARTY" | "EXPECTED_UNOFFICIAL" | "AWAITING_VERIFICATION";
  is_featured?: boolean;
  is_closing_soon?: boolean;
  published_at?: string;
}

export const INITIAL_MONITORING_SOURCES: MonitoringSource[] = [
  {
    id: 1,
    name: "Union Public Service Commission (UPSC) Recruitment & Notices",
    organization_code: "UPSC",
    organization_name: "Union Public Service Commission",
    category: "GOVT_JOB",
    state_code: "ALL",
    source_type: "OFFICIAL_GOVT",
    official_website_url: "https://upsc.gov.in",
    notification_url: "https://upsc.gov.in/examinations/active-examinations",
    verification_status: "VERIFIED",
    check_frequency: "DAILY",
    is_enabled: true,
    priority: 1,
    last_checked_at: new Date().toISOString(),
    last_successful_check_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Staff Selection Commission (SSC) Examination Portal",
    organization_code: "SSC",
    organization_name: "Staff Selection Commission",
    category: "GOVT_JOB",
    state_code: "ALL",
    source_type: "OFFICIAL_GOVT",
    official_website_url: "https://ssc.gov.in",
    notification_url: "https://ssc.gov.in/candidate-portal/notices",
    verification_status: "VERIFIED",
    check_frequency: "DAILY",
    is_enabled: true,
    priority: 1,
    last_checked_at: new Date().toISOString(),
    last_successful_check_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Railway Recruitment Control Board (RRCB)",
    organization_code: "RRB",
    organization_name: "Railway Recruitment Control Board",
    category: "GOVT_JOB",
    state_code: "ALL",
    source_type: "OFFICIAL_GOVT",
    official_website_url: "https://indianrailways.gov.in",
    notification_url: "https://rrcb.gov.in/recruitment.html",
    verification_status: "VERIFIED",
    check_frequency: "DAILY",
    is_enabled: true,
    priority: 1,
    last_checked_at: new Date().toISOString(),
    last_successful_check_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Institute of Banking Personnel Selection (IBPS)",
    organization_code: "IBPS",
    organization_name: "Institute of Banking Personnel Selection",
    category: "GOVT_JOB",
    state_code: "ALL",
    source_type: "OFFICIAL_GOVT",
    official_website_url: "https://www.ibps.in",
    notification_url: "https://www.ibps.in/current-vacancies",
    verification_status: "VERIFIED",
    check_frequency: "DAILY",
    is_enabled: true,
    priority: 1,
    last_checked_at: new Date().toISOString(),
    last_successful_check_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: "Tamil Nadu Public Service Commission (TNPSC)",
    organization_code: "TNPSC",
    organization_name: "Tamil Nadu Public Service Commission",
    category: "GOVT_JOB",
    state_code: "TN",
    source_type: "OFFICIAL_GOVT",
    official_website_url: "https://www.tnpsc.gov.in",
    notification_url: "https://www.tnpsc.gov.in/english/notifications.aspx",
    verification_status: "VERIFIED",
    check_frequency: "DAILY",
    is_enabled: true,
    priority: 2,
    last_checked_at: new Date().toISOString(),
    last_successful_check_at: new Date().toISOString(),
  },
  {
    id: 6,
    name: "Central Board of Secondary Education (CBSE) Results Portal",
    organization_code: "CBSE",
    organization_name: "Central Board of Secondary Education",
    category: "SCHOOL_RESULT",
    state_code: "ALL",
    source_type: "EDUCATION_BOARD",
    official_website_url: "https://cbse.gov.in",
    notification_url: "https://cbseresults.nic.in",
    verification_status: "VERIFIED",
    check_frequency: "DAILY",
    is_enabled: true,
    priority: 1,
    last_checked_at: new Date().toISOString(),
    last_successful_check_at: new Date().toISOString(),
  },
  {
    id: 7,
    name: "National Institute of Open Schooling (NIOS)",
    organization_code: "NIOS",
    organization_name: "National Institute of Open Schooling",
    category: "SCHOOL_RESULT",
    state_code: "ALL",
    source_type: "EDUCATION_BOARD",
    official_website_url: "https://nios.ac.in",
    notification_url: "https://results.nios.ac.in",
    verification_status: "VERIFIED",
    check_frequency: "DAILY",
    is_enabled: true,
    priority: 1,
    last_checked_at: new Date().toISOString(),
    last_successful_check_at: new Date().toISOString(),
  },
  {
    id: 8,
    name: "National Scholarship Portal (NSP)",
    organization_code: "NSP",
    organization_name: "Ministry of Electronics and Information Technology",
    category: "SCHOLARSHIP",
    state_code: "ALL",
    source_type: "OFFICIAL_GOVT",
    official_website_url: "https://scholarships.gov.in",
    notification_url: "https://scholarships.gov.in/public/schemeGuidelines",
    verification_status: "VERIFIED",
    check_frequency: "DAILY",
    is_enabled: true,
    priority: 1,
    last_checked_at: new Date().toISOString(),
    last_successful_check_at: new Date().toISOString(),
  },
  {
    id: 9,
    name: "Joint Seat Allocation Authority (JoSAA)",
    organization_code: "JOSAA",
    organization_name: "Ministry of Education (MoE)",
    category: "ADMISSION",
    state_code: "ALL",
    source_type: "OFFICIAL_GOVT",
    official_website_url: "https://josaa.nic.in",
    notification_url: "https://josaa.nic.in/counselling-schedule",
    verification_status: "VERIFIED",
    check_frequency: "DAILY",
    is_enabled: true,
    priority: 1,
    last_checked_at: new Date().toISOString(),
    last_successful_check_at: new Date().toISOString(),
  },
  {
    id: 10,
    name: "Infosys Careers Official Talent Portal",
    organization_code: "INFOSYS",
    organization_name: "Infosys Limited",
    category: "PRIVATE_JOB",
    state_code: "ALL",
    source_type: "EMPLOYER_CAREER",
    official_website_url: "https://www.infosys.com",
    notification_url: "https://career.infosys.com/joblist",
    verification_status: "VERIFIED",
    check_frequency: "DAILY",
    is_enabled: true,
    priority: 3,
    last_checked_at: new Date().toISOString(),
    last_successful_check_at: new Date().toISOString(),
  }
];

export const INITIAL_SCHEDULES: MonitoringSchedule[] = [
  { id: 1, slot_name: "Morning Source Check", time_slot: "06:00", timezone: "Asia/Kolkata", is_active: true, category_scope: "ALL" },
  { id: 2, slot_name: "Midday Source Check", time_slot: "12:00", timezone: "Asia/Kolkata", is_active: true, category_scope: "ALL" },
  { id: 3, slot_name: "Evening Source Check", time_slot: "18:00", timezone: "Asia/Kolkata", is_active: true, category_scope: "ALL" },
  { id: 4, slot_name: "Nightly Verification & Summary", time_slot: "22:00", timezone: "Asia/Kolkata", is_active: true, category_scope: "ALL" },
];

export const INITIAL_DETECTED_UPDATES: DetectedUpdate[] = [
  {
    id: 101,
    title: "UPSC Civil Services (Preliminary) Examination 2026 Notification Released",
    organization: "Union Public Service Commission",
    category: "EXAM",
    state: "All India",
    description: "UPSC has published official notification for Civil Services Examination (CSE) 2026 and Indian Forest Service (IFS) 2026 for approximately 1,100 administrative vacancies across India.",
    qualification: "Bachelor's Degree in any discipline from a recognized University",
    vacancies_count: 1100,
    official_notification_url: "https://upsc.gov.in/examinations/active-examinations",
    application_url: "https://upsconline.nic.in",
    source_url: "https://upsc.gov.in",
    important_dates: {
      application_start: "2026-02-14",
      application_end: "2026-03-05",
      exam_date: "2026-05-24",
      result_date: "Date Not Announced",
    },
    publication_date: "2026-02-14T10:00:00Z",
    detection_date: new Date(Date.now() - 3600000 * 2).toISOString(),
    verification_status: "PUBLISHED",
    change_type: "NEW",
    is_officially_verified: true,
    verification_badge: "OFFICIALLY_VERIFIED",
    is_featured: true,
    is_closing_soon: false,
    published_at: new Date().toISOString(),
  },
  {
    id: 102,
    title: "SSC Combined Graduate Level (CGL) 2026 Tier-1 Exam Dates Announced",
    organization: "Staff Selection Commission",
    category: "EXAM",
    state: "All India",
    description: "Staff Selection Commission has announced the schedule for CGL 2026 Computer Based Examination Tier-1. Admit cards will be released 4 days prior to exam dates on regional portals.",
    qualification: "Graduation Degree",
    vacancies_count: 14500,
    official_notification_url: "https://ssc.gov.in",
    application_url: "https://ssc.gov.in",
    source_url: "https://ssc.gov.in",
    important_dates: {
      exam_date: "2026-09-12",
      result_date: "Date Not Announced",
    },
    publication_date: "2026-02-18T12:00:00Z",
    detection_date: new Date(Date.now() - 3600000 * 5).toISOString(),
    verification_status: "PUBLISHED",
    change_type: "DATE_CHANGED",
    is_officially_verified: true,
    verification_badge: "OFFICIALLY_VERIFIED",
    is_featured: true,
    published_at: new Date().toISOString(),
  },
  {
    id: 103,
    title: "RRB Group D CEN 02/2024 Final Scorecard & Cutoff Marks Notice",
    organization: "Railway Recruitment Control Board",
    category: "RESULT",
    state: "All India",
    description: "Railway Recruitment Boards across 21 zones have issued notice regarding normalisation formula and CEN 02/2024 Level 1 final scorecards. Students can access verified scorecards solely on official RRB regional portals.",
    qualification: "10th Pass / ITI",
    vacancies_count: 103769,
    official_notification_url: "https://indianrailways.gov.in",
    application_url: "https://rrcb.gov.in",
    source_url: "https://indianrailways.gov.in",
    important_dates: {
      result_date: "2026-02-28 (Expected - Official Confirmation Pending)",
    },
    publication_date: "2026-02-19T14:00:00Z",
    detection_date: new Date(Date.now() - 3600000 * 8).toISOString(),
    verification_status: "PUBLISHED",
    change_type: "UPDATED",
    is_officially_verified: true,
    verification_badge: "EXPECTED_UNOFFICIAL",
    published_at: new Date().toISOString(),
  },
  {
    id: 104,
    title: "CBSE Class 10 & 12 Board Results 2026 – Official Verification Portal Readiness",
    organization: "Central Board of Secondary Education",
    category: "SCHOOL_RESULT",
    state: "All India",
    description: "CBSE has issued security circular instructing schools regarding DigiLocker security PIN distribution for Class 10 and 12 results. Official result release date has not yet been declared by the Controller of Examinations.",
    qualification: "Class 10 / Class 12 Appearing",
    official_notification_url: "https://cbse.gov.in",
    application_url: "https://cbseresults.nic.in",
    source_url: "https://cbse.gov.in",
    important_dates: {
      result_date: "Date Not Announced",
    },
    publication_date: "2026-02-20T11:00:00Z",
    detection_date: new Date(Date.now() - 3600000 * 12).toISOString(),
    verification_status: "PUBLISHED",
    change_type: "UPDATED",
    is_officially_verified: true,
    verification_badge: "OFFICIALLY_VERIFIED",
    published_at: new Date().toISOString(),
  },
  {
    id: 105,
    title: "TNPSC Combined Civil Services Examination - IV (Group 4) 2026 Notification",
    organization: "Tamil Nadu Public Service Commission",
    category: "GOVT_JOB",
    state: "Tamil Nadu",
    description: "Direct recruitment to Village Administrative Officer (VAO), Junior Assistant, Bill Collector, Typist, and Steno-Typist posts under Tamil Nadu Ministerial & Judicial Services.",
    qualification: "SSLC (10th Standard) Passed with Tamil as one of the subjects",
    vacancies_count: 7382,
    official_notification_url: "https://www.tnpsc.gov.in",
    application_url: "https://apply.tnpscexams.in",
    source_url: "https://www.tnpsc.gov.in",
    important_dates: {
      application_start: "2026-01-30",
      application_end: "2026-02-28",
      exam_date: "2026-06-09",
    },
    publication_date: "2026-01-30T09:00:00Z",
    detection_date: new Date(Date.now() - 3600000 * 24).toISOString(),
    verification_status: "PUBLISHED",
    change_type: "NEW",
    is_officially_verified: true,
    verification_badge: "OFFICIALLY_VERIFIED",
    is_closing_soon: true,
    published_at: new Date().toISOString(),
  },
  {
    id: 106,
    title: "Infosys Specialist Programmer & Digital Specialist Engineer 2026 Batch",
    organization: "Infosys Limited",
    category: "PRIVATE_JOB",
    state: "All India",
    description: "Off-campus recruitment drive for 2025 and 2026 batch engineering graduates. Hands-on coding assessment in Data Structures, Algorithms, and System Design.",
    qualification: "B.E. / B.Tech / M.E. / M.Tech / MCA / M.Sc (Computer Science / IT)",
    vacancies_count: 2500,
    official_notification_url: "https://career.infosys.com",
    application_url: "https://career.infosys.com/joblist",
    source_url: "https://career.infosys.com",
    important_dates: {
      application_end: "2026-03-15",
    },
    publication_date: "2026-02-10T15:00:00Z",
    detection_date: new Date(Date.now() - 3600000 * 30).toISOString(),
    verification_status: "PUBLISHED",
    change_type: "NEW",
    is_officially_verified: true,
    verification_badge: "THIRD_PARTY",
    published_at: new Date().toISOString(),
  },
  {
    id: 107,
    title: "NSP National Means-cum-Merit Scholarship Scheme (NMMSS) 2026 Renewal",
    organization: "Department of School Education & Literacy, MoE",
    category: "SCHOLARSHIP",
    state: "All India",
    description: "National Scholarship Portal has opened renewal applications for Class 10, 11, and 12 eligible students under NMMSS scheme offering INR 12,000 per annum financial grant.",
    qualification: "Class 9 to 12 students with minimum 55% aggregate",
    official_notification_url: "https://scholarships.gov.in",
    application_url: "https://scholarships.gov.in",
    source_url: "https://scholarships.gov.in",
    important_dates: {
      application_end: "2026-03-31",
    },
    publication_date: "2026-02-01T10:00:00Z",
    detection_date: new Date(Date.now() - 3600000 * 48).toISOString(),
    verification_status: "PUBLISHED",
    change_type: "NEW",
    is_officially_verified: true,
    verification_badge: "OFFICIALLY_VERIFIED",
    published_at: new Date().toISOString(),
  },
  {
    id: 108,
    title: "JEE Main Session 2 Examination City Intimation Slip Release Notice",
    organization: "National Testing Agency (NTA)",
    category: "ADMIT_CARD",
    state: "All India",
    description: "NTA will release exam city advance allotment slips for JEE Main Session 2 on the official exam portal. Admit cards with roll numbers and venue addresses will follow 3 days prior.",
    qualification: "Class 12 / Appearing with PCM",
    official_notification_url: "https://jeemain.nta.ac.in",
    application_url: "https://jeemain.nta.ac.in",
    source_url: "https://jeemain.nta.ac.in",
    important_dates: {
      exam_date: "2026-04-04",
    },
    publication_date: "2026-02-21T09:30:00Z",
    detection_date: new Date(Date.now() - 3600000 * 1).toISOString(),
    verification_status: "PUBLISHED",
    change_type: "NEW",
    is_officially_verified: true,
    verification_badge: "OFFICIALLY_VERIFIED",
    published_at: new Date().toISOString(),
  },
  {
    id: 109,
    title: "JoSAA Centralized Engineering Admissions 2026 Schedule & Seat Matrix Review",
    organization: "Joint Seat Allocation Authority",
    category: "ADMISSION",
    state: "All India",
    description: "Official schedule for online counselling and seat allocation across 23 IITs, 32 NITs, 26 IIITs, and 38 Other-Government Funded Technical Institutes (GFTIs) for academic year 2026-27.",
    qualification: "JEE Main / JEE Advanced 2026 Qualified",
    official_notification_url: "https://josaa.nic.in",
    application_url: "https://josaa.nic.in",
    source_url: "https://josaa.nic.in",
    important_dates: {
      application_start: "2026-06-10",
      application_end: "2026-06-25",
    },
    publication_date: "2026-02-15T10:00:00Z",
    detection_date: new Date(Date.now() - 3600000 * 50).toISOString(),
    verification_status: "PUBLISHED",
    change_type: "NEW",
    is_officially_verified: true,
    verification_badge: "OFFICIALLY_VERIFIED",
    published_at: new Date().toISOString(),
  }
];

export const CATEGORY_LABELS: Record<string, string> = {
  ALL: "All Updates",
  GOVT_JOB: "Government Jobs",
  PRIVATE_JOB: "Private Jobs",
  EXAM: "Examinations",
  RESULT: "Exam Results",
  SCHOOL_RESULT: "School Board Results",
  ADMIT_CARD: "Admit Cards",
  SCHOLARSHIP: "Scholarships",
  ADMISSION: "Admissions",
};
