export interface WebsiteHealthComponent {
  id: number;
  name: string;
  route: string;
  status: "HEALTHY" | "WARNING" | "CRITICAL" | "UNKNOWN";
  latency_ms: number;
  http_status: number;
  last_checked: string;
}

export interface BrokenLinkItem {
  id: number;
  website_id?: number;
  title: string;
  target_url: string;
  source_page: string;
  reported_issue: "HTTP_404" | "TIMEOUT" | "REDIRECT_WRONG" | "SSL_ERROR" | "SLOW_UNRESPONSIVE";
  details: string;
  status: "PENDING" | "VERIFIED" | "RESOLVED" | "REJECTED";
  created_at: string;
}

export interface MaintenanceTaskItem {
  id: number;
  title: string;
  description: string;
  category: "BROKEN_LINK" | "SECURITY_ISSUE" | "WEBSITE_BUG" | "PERFORMANCE_ISSUE" | "CONTENT_UPDATE" | "DATABASE_ISSUE" | "API_ISSUE" | "DESIGN_ISSUE" | "USER_REPORTED_ISSUE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "AWAITING_REVIEW" | "RESOLVED" | "CLOSED";
  reported_by: string;
  resolution_notes?: string;
  deadline?: string;
  resolved_at?: string;
  created_at: string;
}

export interface BackupRecordItem {
  id: number;
  backup_type: "DAILY" | "WEEKLY" | "MONTHLY" | "MANUAL";
  file_name: string;
  file_size_kb: number;
  status: "SUCCESS" | "FAILED" | "VERIFYING" | "RESTORED";
  integrity_checksum: string;
  storage_path: string;
  retention_days: number;
  last_verified_at?: string;
  created_at: string;
}

export interface ApplicationErrorItem {
  id: number;
  error_type: "FRONTEND_EXCEPTION" | "BACKEND_EXCEPTION" | "API_FAILURE" | "DB_ERROR" | "TASK_FAILURE" | "NOTIFICATION_FAILURE";
  service: "API" | "FRONTEND" | "SCHEDULER" | "AUTH" | "STORAGE";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  stack_trace?: string;
  endpoint?: string;
  status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "IGNORED";
  frequency_count: number;
  first_seen_at: string;
  last_seen_at: string;
}

export interface Daily20PointReport {
  report_date: string;
  generated_at: string;
  summary_20_points: {
    "1_sources_checked": number;
    "2_new_govt_jobs": number;
    "3_new_private_jobs": number;
    "4_new_exam_notices": number;
    "5_new_results_announced": number;
    "6_school_results_updated": number;
    "7_new_admit_cards": number;
    "8_scholarships_updated": number;
    "9_deadlines_updated": number;
    "10_broken_links_found": number;
    "11_failed_sources_count": number;
    "12_pending_verifications": number;
    "13_failed_notifications": number;
    "14_website_health_status": string;
    "15_api_health_status": string;
    "16_db_health_status": string;
    "17_backup_status": string;
    "18_security_alerts_count": number;
    "19_maintenance_tasks_completed": number;
    "20_outstanding_issues_count": number;
  };
}

export const INITIAL_HEALTH_COMPONENTS: WebsiteHealthComponent[] = [
  { id: 1, name: "Homepage Portal", route: "/", status: "HEALTHY", latency_ms: 42.5, http_status: 200, last_checked: new Date().toISOString() },
  { id: 2, name: "Examinations Directory", route: "/apply", status: "HEALTHY", latency_ms: 68.2, http_status: 200, last_checked: new Date().toISOString() },
  { id: 3, name: "Job Alerts Hub", route: "/jobs", status: "HEALTHY", latency_ms: 54.1, http_status: 200, last_checked: new Date().toISOString() },
  { id: 4, name: "Results Gateway", route: "/results", status: "HEALTHY", latency_ms: 39.8, http_status: 200, last_checked: new Date().toISOString() },
  { id: 5, name: "School Education Portal", route: "/school", status: "HEALTHY", latency_ms: 48.6, http_status: 200, last_checked: new Date().toISOString() },
  { id: 6, name: "Student Dashboard", route: "/dashboard", status: "HEALTHY", latency_ms: 61.0, http_status: 200, last_checked: new Date().toISOString() },
  { id: 7, name: "Admin Operations Console", route: "/admin/dashboard", status: "HEALTHY", latency_ms: 75.3, http_status: 200, last_checked: new Date().toISOString() },
  { id: 8, name: "Backend API Gateway", route: "/api/health", status: "HEALTHY", latency_ms: 12.4, http_status: 200, last_checked: new Date().toISOString() },
  { id: 9, name: "Authentication Service", route: "/api/auth/login", status: "HEALTHY", latency_ms: 28.7, http_status: 200, last_checked: new Date().toISOString() },
  { id: 10, name: "Primary Database Connection", route: "sqlite:///examhub.db", status: "HEALTHY", latency_ms: 3.2, http_status: 200, last_checked: new Date().toISOString() }
];

export const INITIAL_BROKEN_LINKS: BrokenLinkItem[] = [
  {
    id: 1,
    title: "TNPSC OTR Gateway Redirection Latency",
    target_url: "https://apply.tnpscexams.in",
    source_page: "/jobs/tnpsc-group-4-2026",
    reported_issue: "SLOW_UNRESPONSIVE",
    details: "High traffic during evening hours resulted in occasional 4500ms delay during One-Time-Registration forwarding.",
    status: "PENDING",
    created_at: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 2,
    title: "Regional RRB Gorakhpur Scorecard Mirror",
    target_url: "https://rrbgkp.gov.in/scorecard",
    source_page: "/results/rrb-group-d",
    reported_issue: "HTTP_404",
    details: "Server migrated to centralized national portal. Official link updated in database to official rrcb.gov.in directory.",
    status: "RESOLVED",
    created_at: new Date(Date.now() - 3600000 * 20).toISOString()
  }
];

export const INITIAL_MAINTENANCE_TASKS: MaintenanceTaskItem[] = [
  {
    id: 1,
    title: "Verify TNPSC Group 4 One-Time Registration Gateway Response",
    description: "Ensure redirected OTR links to apply.tnpscexams.in respond within 3000ms during peak application deadlines.",
    category: "BROKEN_LINK",
    priority: "HIGH",
    status: "IN_PROGRESS",
    reported_by: "AUTOMATED_MONITOR",
    deadline: "2026-02-28T18:00:00Z",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 2,
    title: "Audit Content Freshness for Expired State Police Jobs",
    description: "Scan recruitment database and archive notifications whose application closing date was before February 15, 2026.",
    category: "CONTENT_UPDATE",
    priority: "MEDIUM",
    status: "RESOLVED",
    reported_by: "SUPER_ADMIN",
    resolution_notes: "Archived 4 expired police recruitment notices automatically.",
    resolved_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 3,
    title: "Verify CSP & Security Headers Compliance across All School Routes",
    description: "Check Content-Security-Policy headers on /school/books/reader to guarantee sandboxed iframe protections.",
    category: "SECURITY_ISSUE",
    priority: "URGENT",
    status: "RESOLVED",
    reported_by: "SECURITY_AUDIT",
    resolution_notes: "Confirmed X-Frame-Options: DENY and strict referrer policies active.",
    resolved_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 10).toISOString()
  }
];

export const INITIAL_BACKUPS: BackupRecordItem[] = [
  {
    id: 1,
    backup_type: "DAILY",
    file_name: "examhub_backup_20260220_020000.sql.gz",
    file_size_kb: 14280,
    status: "SUCCESS",
    integrity_checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    storage_path: "/var/backups/examhub/daily/examhub_backup_20260220.sql.gz",
    retention_days: 30,
    last_verified_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 3600000 * 16).toISOString()
  },
  {
    id: 2,
    backup_type: "WEEKLY",
    file_name: "examhub_backup_week07_2026.sql.gz",
    file_size_kb: 13920,
    status: "SUCCESS",
    integrity_checksum: "ca978112ca1bbdcafac231b39a23dc4da7860814416067137f828062ec85a218",
    storage_path: "/var/backups/examhub/weekly/examhub_backup_week07_2026.sql.gz",
    retention_days: 90,
    last_verified_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 3600000 * 72).toISOString()
  }
];

export const INITIAL_ERRORS: ApplicationErrorItem[] = [
  {
    id: 1,
    error_type: "API_FAILURE",
    service: "API",
    severity: "LOW",
    message: "External timeout probing State Board secondary gazette mirror",
    endpoint: "/api/school/results",
    status: "RESOLVED",
    frequency_count: 2,
    first_seen_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    last_seen_at: new Date(Date.now() - 3600000 * 28).toISOString()
  }
];
