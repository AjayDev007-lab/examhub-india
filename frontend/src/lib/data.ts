// Comprehensive shared data store for Vercel deployment and local Next.js API route handlers

export interface OrganizationItem {
  id: number;
  name: string;
  code: string;
  category_id: number;
  state_id: number | null;
  official_website: string;
  result_portal_url?: string;
  hall_ticket_portal_url?: string;
  id_card_portal_url?: string;
  contact_email?: string;
  contact_phone?: string;
  integration_methods: string[];
  verification_status: string;
  supports_results: boolean;
  supports_hall_tickets: boolean;
  supports_id_cards: boolean;
  results_retrieval_mode: string;
  hall_tickets_retrieval_mode: string;
  id_cards_retrieval_mode: string;
  approval_status: string;
  approved_by?: number | null;
  approved_at?: string | null;
  api_endpoint_url?: string;
  auth_method: string;
  has_api_credentials: boolean;
  masked_credentials?: string | null;
  health_status: string;
  last_latency_ms: number;
  last_tested_at?: string | null;
  error_count: number;
  is_active: boolean;
}

export const initialCategories = [
  { id: 1, code: "CENTRAL_GOVT", name: "Central Government Board", description: "All India central boards and commissions" },
  { id: 2, code: "STATE_GOVT", name: "State Public Service Commission", description: "State level civil service and departmental recruitment" },
  { id: 3, code: "ENTRANCE_BOARD", name: "National Entrance Testing Board", description: "National Testing Agency and autonomous entrance councils" },
  { id: 4, code: "RECRUITMENT_BOARD", name: "Recruitment Board", description: "Railways, Banking and Specialized Recruitment Boards" },
  { id: 5, code: "CENTRAL_UNIVERSITY", name: "Central University", description: "Universities established by an Act of Parliament" },
  { id: 6, code: "STATE_UNIVERSITY", name: "State University", description: "State government universities with affiliated colleges" },
  { id: 7, code: "AUTONOMOUS_COLLEGE", name: "Autonomous & Affiliated College", description: "Autonomous degree colleges and state affiliate colleges" },
  { id: 8, code: "PRIVATE_UNIVERSITY", name: "Private & Deemed University", description: "Recognized private universities and institutes of eminence" }
];

export const initialStates = [
  { id: 1, code: "DL", name: "Delhi", type: "UT" },
  { id: 2, code: "MH", name: "Maharashtra", type: "STATE" },
  { id: 3, code: "KA", name: "Karnataka", type: "STATE" },
  { id: 4, code: "TN", name: "Tamil Nadu", type: "STATE" },
  { id: 5, code: "UP", name: "Uttar Pradesh", type: "STATE" },
  { id: 6, code: "KL", name: "Kerala", type: "STATE" },
  { id: 7, code: "WB", name: "West Bengal", type: "STATE" },
  { id: 8, code: "TS", name: "Telangana", type: "STATE" },
  { id: 9, code: "AP", name: "Andhra Pradesh", type: "STATE" },
  { id: 10, code: "GJ", name: "Gujarat", type: "STATE" },
  { id: 11, code: "RJ", name: "Rajasthan", type: "STATE" },
  { id: 12, code: "MP", name: "Madhya Pradesh", type: "STATE" },
  { id: 13, code: "BR", name: "Bihar", type: "STATE" },
  { id: 14, code: "PB", name: "Punjab", type: "STATE" },
  { id: 15, code: "HR", name: "Haryana", type: "STATE" }
];

export const initialOrganizations: OrganizationItem[] = [
  {
    id: 1,
    name: "Union Public Service Commission",
    code: "UPSC",
    category_id: 1,
    state_id: 1,
    official_website: "https://upsc.gov.in",
    result_portal_url: "https://upsc.gov.in/examinations/active-examinations",
    hall_ticket_portal_url: "https://upsconline.nic.in/eadmitcard",
    id_card_portal_url: undefined,
    contact_email: "feedback-upsc@gov.in",
    contact_phone: "011-23385271",
    integration_methods: ["OFFICIAL_REDIRECT"],
    verification_status: "VERIFIED",
    supports_results: true,
    supports_hall_tickets: true,
    supports_id_cards: false,
    results_retrieval_mode: "OFFICIAL_REDIRECT",
    hall_tickets_retrieval_mode: "OFFICIAL_REDIRECT",
    id_cards_retrieval_mode: "MANUAL_UPLOAD",
    approval_status: "APPROVED",
    approved_by: 1,
    approved_at: new Date().toISOString(),
    api_endpoint_url: "https://upsc.gov.in/api/v1/auth",
    auth_method: "API_KEY",
    has_api_credentials: true,
    masked_credentials: "upsc••••••••2026",
    health_status: "HEALTHY",
    last_latency_ms: 48,
    last_tested_at: new Date().toISOString(),
    error_count: 0,
    is_active: true
  },
  {
    id: 2,
    name: "National Testing Agency",
    code: "NTA",
    category_id: 3,
    state_id: 1,
    official_website: "https://nta.ac.in",
    result_portal_url: "https://ntaresults.nic.in",
    hall_ticket_portal_url: "https://examinationservices.nic.in",
    id_card_portal_url: undefined,
    contact_email: "genadmin@nta.ac.in",
    contact_phone: "011-40759000",
    integration_methods: ["OFFICIAL_REDIRECT"],
    verification_status: "VERIFIED",
    supports_results: true,
    supports_hall_tickets: true,
    supports_id_cards: false,
    results_retrieval_mode: "OFFICIAL_REDIRECT",
    hall_tickets_retrieval_mode: "OFFICIAL_REDIRECT",
    id_cards_retrieval_mode: "MANUAL_UPLOAD",
    approval_status: "APPROVED",
    approved_by: 1,
    approved_at: new Date().toISOString(),
    api_endpoint_url: "https://ntaresults.nic.in/api/verify",
    auth_method: "BEARER_TOKEN",
    has_api_credentials: true,
    masked_credentials: "nta_••••••••9941",
    health_status: "HEALTHY",
    last_latency_ms: 36,
    last_tested_at: new Date().toISOString(),
    error_count: 0,
    is_active: true
  },
  {
    id: 3,
    name: "Staff Selection Commission",
    code: "SSC",
    category_id: 1,
    state_id: 1,
    official_website: "https://ssc.gov.in",
    result_portal_url: "https://ssc.gov.in/results",
    hall_ticket_portal_url: "https://ssc.gov.in/admit-card",
    id_card_portal_url: undefined,
    contact_email: "enquiry-ssc@nic.in",
    contact_phone: "011-24363343",
    integration_methods: ["OFFICIAL_REDIRECT"],
    verification_status: "VERIFIED",
    supports_results: true,
    supports_hall_tickets: true,
    supports_id_cards: false,
    results_retrieval_mode: "OFFICIAL_REDIRECT",
    hall_tickets_retrieval_mode: "OFFICIAL_REDIRECT",
    id_cards_retrieval_mode: "MANUAL_UPLOAD",
    approval_status: "APPROVED",
    approved_by: 1,
    approved_at: new Date().toISOString(),
    auth_method: "NONE",
    has_api_credentials: false,
    health_status: "HEALTHY",
    last_latency_ms: 62,
    last_tested_at: new Date().toISOString(),
    error_count: 0,
    is_active: true
  },
  {
    id: 4,
    name: "Railway Recruitment Control Board",
    code: "RRB",
    category_id: 4,
    state_id: 1,
    official_website: "https://rrbcdg.gov.in",
    result_portal_url: "https://rrbcdg.gov.in/results",
    hall_ticket_portal_url: "https://rrbcdg.gov.in/admitcard",
    id_card_portal_url: undefined,
    contact_email: "rrb-hq@rb.railnet.gov.in",
    contact_phone: "0172-2730093",
    integration_methods: ["OFFICIAL_REDIRECT"],
    verification_status: "VERIFIED",
    supports_results: true,
    supports_hall_tickets: true,
    supports_id_cards: false,
    results_retrieval_mode: "OFFICIAL_REDIRECT",
    hall_tickets_retrieval_mode: "OFFICIAL_REDIRECT",
    id_cards_retrieval_mode: "MANUAL_UPLOAD",
    approval_status: "APPROVED",
    approved_by: 1,
    approved_at: new Date().toISOString(),
    auth_method: "NONE",
    has_api_credentials: false,
    health_status: "HEALTHY",
    last_latency_ms: 71,
    last_tested_at: new Date().toISOString(),
    error_count: 0,
    is_active: true
  },
  {
    id: 5,
    name: "Karnataka Examination Authority",
    code: "KEA-KARNATAKA",
    category_id: 2,
    state_id: 3,
    official_website: "https://cetonline.karnataka.gov.in",
    result_portal_url: "https://cetonline.karnataka.gov.in/kearesults",
    hall_ticket_portal_url: "https://cetonline.karnataka.gov.in/keaadmit",
    id_card_portal_url: undefined,
    contact_email: "keaauthority-ka@nic.in",
    contact_phone: "080-23460460",
    integration_methods: ["OFFICIAL_API", "OFFICIAL_REDIRECT"],
    verification_status: "VERIFIED",
    supports_results: true,
    supports_hall_tickets: true,
    supports_id_cards: false,
    results_retrieval_mode: "OFFICIAL_API",
    hall_tickets_retrieval_mode: "OFFICIAL_REDIRECT",
    id_cards_retrieval_mode: "MANUAL_UPLOAD",
    approval_status: "APPROVED",
    approved_by: 1,
    approved_at: new Date().toISOString(),
    api_endpoint_url: "https://cetonline.karnataka.gov.in/api/v1/auth",
    auth_method: "API_KEY",
    has_api_credentials: true,
    masked_credentials: "kea_••••••••8819",
    health_status: "HEALTHY",
    last_latency_ms: 42,
    last_tested_at: new Date().toISOString(),
    error_count: 0,
    is_active: true
  },
  {
    id: 6,
    name: "Tamil Nadu Public Service Commission",
    code: "TNPSC",
    category_id: 2,
    state_id: 4,
    official_website: "https://tnpsc.gov.in",
    result_portal_url: "https://tnpsc.gov.in/results.html",
    hall_ticket_portal_url: "https://tnpscexams.in",
    id_card_portal_url: undefined,
    contact_email: "contacttnpsc@gmail.com",
    contact_phone: "044-25300300",
    integration_methods: ["OFFICIAL_REDIRECT"],
    verification_status: "VERIFIED",
    supports_results: true,
    supports_hall_tickets: true,
    supports_id_cards: false,
    results_retrieval_mode: "OFFICIAL_REDIRECT",
    hall_tickets_retrieval_mode: "OFFICIAL_REDIRECT",
    id_cards_retrieval_mode: "MANUAL_UPLOAD",
    approval_status: "APPROVED",
    approved_by: 1,
    approved_at: new Date().toISOString(),
    auth_method: "NONE",
    has_api_credentials: false,
    health_status: "HEALTHY",
    last_latency_ms: 55,
    last_tested_at: new Date().toISOString(),
    error_count: 0,
    is_active: true
  },
  {
    id: 7,
    name: "University of Delhi",
    code: "DU",
    category_id: 5,
    state_id: 1,
    official_website: "https://du.ac.in",
    result_portal_url: "https://exam.du.ac.in/result.html",
    hall_ticket_portal_url: "https://exam.du.ac.in/admitcard.html",
    id_card_portal_url: "https://slc.uod.ac.in",
    contact_email: "dean_exam@du.ac.in",
    contact_phone: "011-27667725",
    integration_methods: ["OFFICIAL_REDIRECT", "INSTITUTION_INTEGRATION"],
    verification_status: "VERIFIED",
    supports_results: true,
    supports_hall_tickets: true,
    supports_id_cards: true,
    results_retrieval_mode: "OFFICIAL_REDIRECT",
    hall_tickets_retrieval_mode: "OFFICIAL_REDIRECT",
    id_cards_retrieval_mode: "INSTITUTION_INTEGRATION",
    approval_status: "APPROVED",
    approved_by: 1,
    approved_at: new Date().toISOString(),
    api_endpoint_url: "https://slc.uod.ac.in/api/v2/student",
    auth_method: "OAUTH2",
    has_api_credentials: true,
    masked_credentials: "du_s••••••••3311",
    health_status: "HEALTHY",
    last_latency_ms: 39,
    last_tested_at: new Date().toISOString(),
    error_count: 0,
    is_active: true
  },
  {
    id: 8,
    name: "Visvesvaraya Technological University",
    code: "VTU",
    category_id: 6,
    state_id: 3,
    official_website: "https://vtu.ac.in",
    result_portal_url: "https://results.vtu.ac.in",
    hall_ticket_portal_url: "https://prexam.vtu.ac.in",
    id_card_portal_url: "https://vtu.ac.in/student-portal",
    contact_email: "registrar@vtu.ac.in",
    contact_phone: "0831-2498100",
    integration_methods: ["OFFICIAL_REDIRECT"],
    verification_status: "VERIFIED",
    supports_results: true,
    supports_hall_tickets: true,
    supports_id_cards: true,
    results_retrieval_mode: "OFFICIAL_REDIRECT",
    hall_tickets_retrieval_mode: "OFFICIAL_REDIRECT",
    id_cards_retrieval_mode: "INSTITUTION_INTEGRATION",
    approval_status: "APPROVED",
    approved_by: 1,
    approved_at: new Date().toISOString(),
    auth_method: "NONE",
    has_api_credentials: false,
    health_status: "HEALTHY",
    last_latency_ms: 45,
    last_tested_at: new Date().toISOString(),
    error_count: 0,
    is_active: true
  }
];

export const initialExams = [
  {
    id: 1,
    organization_id: 1,
    organization_name: "Union Public Service Commission",
    organization_code: "UPSC",
    name: "Civil Services (Preliminary) Examination",
    code: "UPSC-CSE-PRE-2026",
    exam_type: "GOVERNMENT",
    description: "All India civil services preliminary screening examination",
    year: 2026,
    cycle: "Annual",
    requires_dob: true,
    requires_captcha: true,
    is_active: true
  },
  {
    id: 2,
    organization_id: 2,
    organization_name: "National Testing Agency",
    organization_code: "NTA",
    name: "National Eligibility cum Entrance Test (NEET UG)",
    code: "NEET-UG-2026",
    exam_type: "ENTRANCE",
    description: "National medical undergraduate admissions entrance examination",
    year: 2026,
    cycle: "Annual",
    requires_dob: true,
    requires_captcha: false,
    is_active: true
  },
  {
    id: 3,
    organization_id: 2,
    organization_name: "National Testing Agency",
    organization_code: "NTA",
    name: "Joint Entrance Examination (JEE Main)",
    code: "JEE-MAIN-2026",
    exam_type: "ENTRANCE",
    description: "Engineering undergraduate admissions assessment",
    year: 2026,
    cycle: "Session 1",
    requires_dob: true,
    requires_captcha: false,
    is_active: true
  },
  {
    id: 4,
    organization_id: 3,
    organization_name: "Staff Selection Commission",
    organization_code: "SSC",
    name: "Combined Graduate Level (CGL) Examination",
    code: "SSC-CGL-2026",
    exam_type: "GOVERNMENT",
    description: "Group B and C officers recruitment for Ministries of India",
    year: 2026,
    cycle: "Tier 1",
    requires_dob: true,
    requires_captcha: false,
    is_active: true
  },
  {
    id: 5,
    organization_id: 5,
    organization_name: "Karnataka Examination Authority",
    organization_code: "KEA-KARNATAKA",
    name: "Karnataka Common Entrance Test (KCET)",
    code: "KCET-2026",
    exam_type: "ENTRANCE",
    description: "Professional undergraduate courses entrance for Karnataka",
    year: 2026,
    cycle: "Annual",
    requires_dob: true,
    requires_captcha: false,
    is_active: true
  }
];

export const initialStudents = [
  {
    id: 1,
    full_name: "Aditya Sharma",
    email: "student@examhub.in",
    mobile: "9876543210",
    is_active: true,
    is_verified: true,
    mobile_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    full_name: "Priya Sundaram",
    email: "priya.s@gmail.com",
    mobile: "9841029384",
    is_active: true,
    is_verified: true,
    mobile_verified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    full_name: "Rahul Verma",
    email: "rahul.v@outlook.com",
    mobile: "9123456780",
    is_active: true,
    is_verified: true,
    mobile_verified: false,
    created_at: new Date().toISOString()
  }
];

export const initialAuditLogs = [
  {
    id: 1,
    actor_type: "SYSTEM",
    actor_id: 1,
    action: "INTEGRATION_SYNC_VERIFIED",
    target_type: "ORGANIZATION",
    target_id: 1,
    ip_address: "127.0.0.1",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    actor_type: "ADMIN",
    actor_id: 1,
    action: "ADMIN_LOGIN",
    target_type: "ADMIN_USER",
    target_id: 1,
    ip_address: "127.0.0.1",
    created_at: new Date().toISOString()
  }
];

export const initialSupportTickets = [
  {
    id: 101,
    subject: "NEET UG 2026 Scorecard verification query",
    message: "Candidate roll number 2604108821 scorecard QR code verification confirmed on testing portal.",
    status: "RESOLVED",
    admin_response: "Official verification confirmed against published NTA merit dataset.",
    created_at: new Date().toISOString()
  }
];

export const initialSystemSettings = [
  { id: 1, setting_key: "STUDENT_DATA_ISOLATION", setting_value: "STRICT_ROW_LEVEL", description: "Enforces cryptographic tenant boundary between student records" },
  { id: 2, setting_key: "CREDENTIAL_ENCRYPTION", setting_value: "AES_256_FERNET", description: "Storage encryption standard for authorized integration keys" },
  { id: 3, setting_key: "SESSION_MAX_AGE_HOURS", setting_value: "24", description: "Bearer token expiration time limit" },
  { id: 4, setting_key: "PROBE_TIMEOUT_SECONDS", setting_value: "10", description: "Timeout threshold for institution website & API health pings" }
];

// Global in-memory mutable store for serverless Next.js runtime
declare global {
  // eslint-disable-next-line no-var
  var __examhubStore: {
    organizations: OrganizationItem[];
    categories: typeof initialCategories;
    states: typeof initialStates;
    exams: typeof initialExams;
    students: typeof initialStudents;
    auditLogs: typeof initialAuditLogs;
    tickets: typeof initialSupportTickets;
    settings: typeof initialSystemSettings;
    logs: any[];
  } | undefined;
}

if (!global.__examhubStore) {
  global.__examhubStore = {
    organizations: [...initialOrganizations],
    categories: [...initialCategories],
    states: [...initialStates],
    exams: [...initialExams],
    students: [...initialStudents],
    auditLogs: [...initialAuditLogs],
    tickets: [...initialSupportTickets],
    settings: [...initialSystemSettings],
    logs: [
      {
        id: 1,
        organization_id: 1,
        action: "CONNECTIVITY_TEST",
        tested_url: "https://upsc.gov.in",
        status_code: 200,
        is_success: true,
        message: "Connection verified. HTTP 200 in 48ms",
        duration_ms: 48,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        organization_id: 2,
        action: "CONNECTIVITY_TEST",
        tested_url: "https://nta.ac.in",
        status_code: 200,
        is_success: true,
        message: "Connection verified. HTTP 200 in 36ms",
        duration_ms: 36,
        created_at: new Date().toISOString()
      }
    ]
  };
}

export const dbStore = global.__examhubStore;
