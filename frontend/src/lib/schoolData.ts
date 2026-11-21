/**
 * ExamHub India — Complete School Education, Board Results, Textbooks & Study Materials Data Module
 * Covers Classes 10, 11, and 12 across National (CBSE, CISCE, NIOS) and State Boards.
 * 100% Free & Open-Access Legal Textbook Directory (NCERT, State SCERTs, Open Educational Resources).
 */

export interface SchoolBoard {
  id: number;
  code: string;
  name: string;
  short_name: string;
  type: "NATIONAL" | "STATE";
  state_name: string;
  official_website: string;
  results_portal_url: string;
  textbooks_portal_url: string;
  syllabus_portal_url: string;
  academic_calendar_url: string;
  helpline_contact: string;
  classes_supported: ("10" | "11" | "12")[];
  verification_status: "VERIFIED_OFFICIAL";
  last_verified_at: string;
}

export interface SchoolResultAnnouncement {
  id: number;
  slug: string;
  board_id: number;
  board_code: string;
  board_name: string;
  class_level: "10" | "11" | "12";
  exam_name: string;
  academic_year: string;
  result_date: string; // ISO or date
  result_date_display: string;
  status: "CONFIRMED_OFFICIAL" | "EXPECTED_UNOFFICIAL" | "PUBLISHED" | "DELAYED" | "NOT_ANNOUNCED";
  official_result_url: string;
  official_press_note_url?: string;
  is_school_level?: boolean; // For Class 11 internal school results
  required_credentials: string[];
  last_verified_at: string;
}

export interface SchoolTextbook {
  id: number;
  slug: string;
  title: string;
  board_code: string;
  board_name: string;
  class_level: "10" | "11" | "12";
  stream?: "GENERAL" | "SCIENCE" | "COMMERCE" | "HUMANITIES";
  subject: string;
  language: string;
  edition: string;
  academic_year: string;
  publisher: string;
  cover_image: string;
  official_download_pdf_url: string;
  online_reader_url?: string;
  is_official: boolean;
  file_size_mb: number;
  chapters: { chapter_no: number; title: string; pdf_url?: string }[];
  description: string;
}

export interface SchoolSyllabus {
  id: number;
  board_code: string;
  class_level: "10" | "11" | "12";
  stream?: "GENERAL" | "SCIENCE" | "COMMERCE" | "HUMANITIES";
  subject: string;
  academic_year: string;
  official_pdf_url: string;
  revision_status: "CURRENT" | "REVISED" | "ARCHIVED";
  chapter_topics: { chapter: string; topics: string[] }[];
}

export interface SchoolQuestionPaper {
  id: number;
  board_code: string;
  class_level: "10" | "11" | "12";
  subject: string;
  year: number;
  exam_type: "ANNUAL_MAIN" | "COMPARTMENT_SUPPLEMENTARY" | "MODEL_SAMPLE";
  paper_pdf_url: string;
  answer_key_pdf_url?: string;
  marking_scheme_url?: string;
}

// -------------------------------------------------------------
// 1. ALL-INDIA SCHOOL BOARDS DIRECTORY (NATIONAL & STATE)
// -------------------------------------------------------------
export const schoolBoardsData: SchoolBoard[] = [
  {
    id: 1,
    code: "CBSE",
    name: "Central Board of Secondary Education",
    short_name: "CBSE",
    type: "NATIONAL",
    state_name: "All India (National)",
    official_website: "https://www.cbse.gov.in",
    results_portal_url: "https://results.cbse.nic.in",
    textbooks_portal_url: "https://ncert.nic.in/textbook.php",
    syllabus_portal_url: "https://cbseacademic.nic.in/curriculum.html",
    academic_calendar_url: "https://www.cbse.gov.in/cbsenew/calendar.html",
    helpline_contact: "1800-11-8002",
    classes_supported: ["10", "11", "12"],
    verification_status: "VERIFIED_OFFICIAL",
    last_verified_at: "2026-02-15T10:00:00Z"
  },
  {
    id: 2,
    code: "CISCE_ICSE",
    name: "Council for the Indian School Certificate Examinations (ICSE Class 10)",
    short_name: "ICSE",
    type: "NATIONAL",
    state_name: "All India (National)",
    official_website: "https://cisce.org",
    results_portal_url: "https://results.cisce.org",
    textbooks_portal_url: "https://cisce.org/publications/",
    syllabus_portal_url: "https://cisce.org/icse-syllabus/",
    academic_calendar_url: "https://cisce.org",
    helpline_contact: "011-26413820",
    classes_supported: ["10"],
    verification_status: "VERIFIED_OFFICIAL",
    last_verified_at: "2026-02-15T10:00:00Z"
  },
  {
    id: 3,
    code: "CISCE_ISC",
    name: "Council for the Indian School Certificate Examinations (ISC Class 11 & 12)",
    short_name: "ISC",
    type: "NATIONAL",
    state_name: "All India (National)",
    official_website: "https://cisce.org",
    results_portal_url: "https://results.cisce.org",
    textbooks_portal_url: "https://cisce.org/publications/",
    syllabus_portal_url: "https://cisce.org/isc-syllabus/",
    academic_calendar_url: "https://cisce.org",
    helpline_contact: "011-26413820",
    classes_supported: ["11", "12"],
    verification_status: "VERIFIED_OFFICIAL",
    last_verified_at: "2026-02-15T10:00:00Z"
  },
  {
    id: 4,
    code: "NIOS",
    name: "National Institute of Open Schooling",
    short_name: "NIOS",
    type: "NATIONAL",
    state_name: "All India (National Open)",
    official_website: "https://www.nios.ac.in",
    results_portal_url: "https://results.nios.ac.in",
    textbooks_portal_url: "https://www.nios.ac.in/online-course-material.aspx",
    syllabus_portal_url: "https://www.nios.ac.in/student-information-section/syllabus.aspx",
    academic_calendar_url: "https://www.nios.ac.in",
    helpline_contact: "1800-180-9393",
    classes_supported: ["10", "12"],
    verification_status: "VERIFIED_OFFICIAL",
    last_verified_at: "2026-02-15T10:00:00Z"
  },
  {
    id: 5,
    code: "TNDGE",
    name: "Tamil Nadu Directorate of Government Examinations (Samacheer Kalvi)",
    short_name: "Tamil Nadu Board",
    type: "STATE",
    state_name: "Tamil Nadu",
    official_website: "https://dge.tn.gov.in",
    results_portal_url: "https://tnresults.nic.in",
    textbooks_portal_url: "https://textbooksonline.tn.nic.in",
    syllabus_portal_url: "https://scert.tn.gov.in",
    academic_calendar_url: "https://dge.tn.gov.in",
    helpline_contact: "044-28275998",
    classes_supported: ["10", "11", "12"],
    verification_status: "VERIFIED_OFFICIAL",
    last_verified_at: "2026-02-15T10:00:00Z"
  },
  {
    id: 6,
    code: "KBPE_DHSE",
    name: "Kerala Board of Public Examinations & Directorate of Higher Secondary Education",
    short_name: "Kerala Board",
    type: "STATE",
    state_name: "Kerala",
    official_website: "https://dhsekerala.gov.in",
    results_portal_url: "https://keralaresults.nic.in",
    textbooks_portal_url: "https://samagra.kite.kerala.gov.in",
    syllabus_portal_url: "https://scert.kerala.gov.in",
    academic_calendar_url: "https://dhsekerala.gov.in",
    helpline_contact: "0471-2320714",
    classes_supported: ["10", "11", "12"],
    verification_status: "VERIFIED_OFFICIAL",
    last_verified_at: "2026-02-15T10:00:00Z"
  },
  {
    id: 7,
    code: "KSEAB",
    name: "Karnataka School Examination and Assessment Board",
    short_name: "Karnataka Board",
    type: "STATE",
    state_name: "Karnataka",
    official_website: "https://kseab.karnataka.gov.in",
    results_portal_url: "https://karresults.nic.in",
    textbooks_portal_url: "https://ktbs.kar.nic.in",
    syllabus_portal_url: "https://dsert.karnataka.gov.in",
    academic_calendar_url: "https://kseab.karnataka.gov.in",
    helpline_contact: "080-23349454",
    classes_supported: ["10", "11", "12"],
    verification_status: "VERIFIED_OFFICIAL",
    last_verified_at: "2026-02-15T10:00:00Z"
  },
  {
    id: 8,
    code: "MSBSHSE",
    name: "Maharashtra State Board of Secondary and Higher Secondary Education",
    short_name: "Maharashtra Board",
    type: "STATE",
    state_name: "Maharashtra",
    official_website: "https://mahahsscboard.in",
    results_portal_url: "https://mahresult.nic.in",
    textbooks_portal_url: "https://ebalbharati.in",
    syllabus_portal_url: "https://maa.ac.in",
    academic_calendar_url: "https://mahahsscboard.in",
    helpline_contact: "020-25705301",
    classes_supported: ["10", "11", "12"],
    verification_status: "VERIFIED_OFFICIAL",
    last_verified_at: "2026-02-15T10:00:00Z"
  },
  {
    id: 9,
    code: "UPMSP",
    name: "Uttar Pradesh Madhyamik Shiksha Parishad (Prayagraj)",
    short_name: "UP Board",
    type: "STATE",
    state_name: "Uttar Pradesh",
    official_website: "https://upmsp.edu.in",
    results_portal_url: "https://upresults.nic.in",
    textbooks_portal_url: "https://upmsp.edu.in/ModelPaper.html",
    syllabus_portal_url: "https://upmsp.edu.in/Syllabus.html",
    academic_calendar_url: "https://upmsp.edu.in",
    helpline_contact: "1800-180-5310",
    classes_supported: ["10", "11", "12"],
    verification_status: "VERIFIED_OFFICIAL",
    last_verified_at: "2026-02-15T10:00:00Z"
  },
  {
    id: 10,
    code: "BSEB",
    name: "Bihar School Examination Board (Patna)",
    short_name: "Bihar Board",
    type: "STATE",
    state_name: "Bihar",
    official_website: "https://biharboardonline.bihar.gov.in",
    results_portal_url: "https://results.biharboardonline.com",
    textbooks_portal_url: "https://scert.bihar.gov.in",
    syllabus_portal_url: "https://biharboardonline.bihar.gov.in",
    academic_calendar_url: "https://biharboardonline.bihar.gov.in",
    helpline_contact: "0612-2232074",
    classes_supported: ["10", "11", "12"],
    verification_status: "VERIFIED_OFFICIAL",
    last_verified_at: "2026-02-15T10:00:00Z"
  },
  {
    id: 11,
    code: "WBBSE_WBCHSE",
    name: "West Bengal Boards of Secondary & Higher Secondary Education",
    short_name: "West Bengal Board",
    type: "STATE",
    state_name: "West Bengal",
    official_website: "https://wbbse.wb.gov.in",
    results_portal_url: "https://wbresults.nic.in",
    textbooks_portal_url: "https://banglarshiksha.gov.in",
    syllabus_portal_url: "https://wbchse.wb.gov.in",
    academic_calendar_url: "https://wbchse.wb.gov.in",
    helpline_contact: "033-23213844",
    classes_supported: ["10", "11", "12"],
    verification_status: "VERIFIED_OFFICIAL",
    last_verified_at: "2026-02-15T10:00:00Z"
  },
  {
    id: 12,
    code: "BIEAP_BSEAP",
    name: "Andhra Pradesh Board of Secondary Education & Board of Intermediate Education",
    short_name: "Andhra Pradesh Board",
    type: "STATE",
    state_name: "Andhra Pradesh",
    official_website: "https://bie.ap.gov.in",
    results_portal_url: "https://resultsbie.ap.gov.in",
    textbooks_portal_url: "https://cse.ap.gov.in",
    syllabus_portal_url: "https://bie.ap.gov.in/syllabus.do",
    academic_calendar_url: "https://bie.ap.gov.in",
    helpline_contact: "1800-425-7635",
    classes_supported: ["10", "11", "12"],
    verification_status: "VERIFIED_OFFICIAL",
    last_verified_at: "2026-02-15T10:00:00Z"
  },
  {
    id: 13,
    code: "TSBIE_BSETG",
    name: "Telangana State Board of Intermediate Education & Directorate of School Education",
    short_name: "Telangana Board",
    type: "STATE",
    state_name: "Telangana",
    official_website: "https://tsbie.cgg.gov.in",
    results_portal_url: "https://results.cgg.gov.in",
    textbooks_portal_url: "https://scert.telangana.gov.in",
    syllabus_portal_url: "https://tsbie.cgg.gov.in",
    academic_calendar_url: "https://tsbie.cgg.gov.in",
    helpline_contact: "040-24601010",
    classes_supported: ["10", "11", "12"],
    verification_status: "VERIFIED_OFFICIAL",
    last_verified_at: "2026-02-15T10:00:00Z"
  },
  {
    id: 14,
    code: "RBSE",
    name: "Rajasthan Board of Secondary Education (Ajmer)",
    short_name: "Rajasthan Board",
    type: "STATE",
    state_name: "Rajasthan",
    official_website: "https://rajeduboard.rajasthan.gov.in",
    results_portal_url: "https://rajresults.nic.in",
    textbooks_portal_url: "https://rajeduboard.rajasthan.gov.in/books/",
    syllabus_portal_url: "https://rajeduboard.rajasthan.gov.in",
    academic_calendar_url: "https://rajeduboard.rajasthan.gov.in",
    helpline_contact: "0145-2632866",
    classes_supported: ["10", "11", "12"],
    verification_status: "VERIFIED_OFFICIAL",
    last_verified_at: "2026-02-15T10:00:00Z"
  },
  {
    id: 15,
    code: "MPBSE",
    name: "Madhya Pradesh Board of Secondary Education (Bhopal)",
    short_name: "MP Board",
    type: "STATE",
    state_name: "Madhya Pradesh",
    official_website: "https://mpbse.nic.in",
    results_portal_url: "https://mpresults.nic.in",
    textbooks_portal_url: "https://mptbc.nic.in",
    syllabus_portal_url: "https://mpbse.nic.in",
    academic_calendar_url: "https://mpbse.nic.in",
    helpline_contact: "1800-233-0175",
    classes_supported: ["10", "11", "12"],
    verification_status: "VERIFIED_OFFICIAL",
    last_verified_at: "2026-02-15T10:00:00Z"
  },
  {
    id: 16,
    code: "GSHSEB",
    name: "Gujarat Secondary and Higher Secondary Education Board (Gandhinagar)",
    short_name: "Gujarat Board",
    type: "STATE",
    state_name: "Gujarat",
    official_website: "https://www.gseb.org",
    results_portal_url: "https://www.gseb.org",
    textbooks_portal_url: "https://gsbstdc.gujarat.gov.in",
    syllabus_portal_url: "https://www.gseb.org",
    academic_calendar_url: "https://www.gseb.org",
    helpline_contact: "1800-233-5500",
    classes_supported: ["10", "11", "12"],
    verification_status: "VERIFIED_OFFICIAL",
    last_verified_at: "2026-02-15T10:00:00Z"
  },
  {
    id: 17,
    code: "PSEB",
    name: "Punjab School Education Board (Mohali)",
    short_name: "Punjab Board",
    type: "STATE",
    state_name: "Punjab",
    official_website: "https://www.pseb.ac.in",
    results_portal_url: "https://www.pseb.ac.in/results",
    textbooks_portal_url: "https://www.pseb.ac.in/books",
    syllabus_portal_url: "https://www.pseb.ac.in/syllabus",
    academic_calendar_url: "https://www.pseb.ac.in",
    helpline_contact: "0172-5227423",
    classes_supported: ["10", "11", "12"],
    verification_status: "VERIFIED_OFFICIAL",
    last_verified_at: "2026-02-15T10:00:00Z"
  },
  {
    id: 18,
    code: "BSE_ODISHA",
    name: "Board of Secondary Education & Council of Higher Secondary Education, Odisha",
    short_name: "Odisha Board",
    type: "STATE",
    state_name: "Odisha",
    official_website: "https://bseodisha.ac.in",
    results_portal_url: "https://orissaresults.nic.in",
    textbooks_portal_url: "https://scertodisha.nic.in",
    syllabus_portal_url: "https://chseodisha.nic.in",
    academic_calendar_url: "https://bseodisha.ac.in",
    helpline_contact: "0671-2415460",
    classes_supported: ["10", "11", "12"],
    verification_status: "VERIFIED_OFFICIAL",
    last_verified_at: "2026-02-15T10:00:00Z"
  }
];

// -------------------------------------------------------------
// 2. CLASS 10, 11 & 12 BOARD RESULT ANNOUNCEMENTS
// -------------------------------------------------------------
export const schoolResultsData: SchoolResultAnnouncement[] = [
  {
    id: 1,
    slug: "cbse-class-10-results-2026",
    board_id: 1,
    board_code: "CBSE",
    board_name: "Central Board of Secondary Education",
    class_level: "10",
    exam_name: "Secondary School Examination (Class X) 2026",
    academic_year: "2025-2026",
    result_date: "2026-05-12T11:00:00Z",
    result_date_display: "May 12, 2026 (Tentative 11:00 AM)",
    status: "EXPECTED_UNOFFICIAL",
    official_result_url: "https://results.cbse.nic.in",
    official_press_note_url: "https://www.cbse.gov.in/cbsenew/press_release.html",
    required_credentials: ["Roll Number", "School Number", "Date of Birth", "Admit Card ID"],
    last_verified_at: "2026-02-18T10:00:00Z"
  },
  {
    id: 2,
    slug: "cbse-class-12-results-2026",
    board_id: 1,
    board_code: "CBSE",
    board_name: "Central Board of Secondary Education",
    class_level: "12",
    exam_name: "Senior School Certificate Examination (Class XII) 2026",
    academic_year: "2025-2026",
    result_date: "2026-05-12T13:00:00Z",
    result_date_display: "May 12, 2026 (Tentative 1:00 PM)",
    status: "EXPECTED_UNOFFICIAL",
    official_result_url: "https://results.cbse.nic.in",
    official_press_note_url: "https://www.cbse.gov.in/cbsenew/press_release.html",
    required_credentials: ["Roll Number", "School Number", "Admit Card ID"],
    last_verified_at: "2026-02-18T10:00:00Z"
  },
  {
    id: 3,
    slug: "icse-class-10-results-2026",
    board_id: 2,
    board_code: "CISCE_ICSE",
    board_name: "Council for the Indian School Certificate Examinations",
    class_level: "10",
    exam_name: "Indian Certificate of Secondary Education (ICSE Class X) 2026",
    academic_year: "2025-2026",
    result_date: "2026-05-06T15:00:00Z",
    result_date_display: "May 06, 2026 (Tentative 3:00 PM)",
    status: "EXPECTED_UNOFFICIAL",
    official_result_url: "https://results.cisce.org",
    required_credentials: ["Unique ID (UID)", "Index Number", "CAPTCHA"],
    last_verified_at: "2026-02-18T10:00:00Z"
  },
  {
    id: 4,
    slug: "isc-class-12-results-2026",
    board_id: 3,
    board_code: "CISCE_ISC",
    board_name: "Council for the Indian School Certificate Examinations",
    class_level: "12",
    exam_name: "Indian School Certificate (ISC Class XII) 2026",
    academic_year: "2025-2026",
    result_date: "2026-05-06T15:00:00Z",
    result_date_display: "May 06, 2026 (Tentative 3:00 PM)",
    status: "EXPECTED_UNOFFICIAL",
    official_result_url: "https://results.cisce.org",
    required_credentials: ["Unique ID (UID)", "Index Number", "CAPTCHA"],
    last_verified_at: "2026-02-18T10:00:00Z"
  },
  {
    id: 5,
    slug: "tn-sslc-class-10-results-2026",
    board_id: 5,
    board_code: "TNDGE",
    board_name: "Tamil Nadu Directorate of Government Examinations",
    class_level: "10",
    exam_name: "SSLC Examination (Class 10) 2026",
    academic_year: "2025-2026",
    result_date: "2026-05-10T09:30:00Z",
    result_date_display: "May 10, 2026 (Confirmed 9:30 AM)",
    status: "CONFIRMED_OFFICIAL",
    official_result_url: "https://tnresults.nic.in",
    official_press_note_url: "https://dge.tn.gov.in/press_release",
    required_credentials: ["Registration Number", "Date of Birth (DD/MM/YYYY)"],
    last_verified_at: "2026-02-18T10:00:00Z"
  },
  {
    id: 6,
    slug: "tn-plus-two-class-12-results-2026",
    board_id: 5,
    board_code: "TNDGE",
    board_name: "Tamil Nadu Directorate of Government Examinations",
    class_level: "12",
    exam_name: "Higher Secondary (+2) Examination 2026",
    academic_year: "2025-2026",
    result_date: "2026-05-08T09:30:00Z",
    result_date_display: "May 08, 2026 (Confirmed 9:30 AM)",
    status: "CONFIRMED_OFFICIAL",
    official_result_url: "https://tnresults.nic.in",
    official_press_note_url: "https://dge.tn.gov.in/press_release",
    required_credentials: ["Registration Number", "Date of Birth (DD/MM/YYYY)"],
    last_verified_at: "2026-02-18T10:00:00Z"
  },
  {
    id: 7,
    slug: "tn-plus-one-class-11-results-2026",
    board_id: 5,
    board_code: "TNDGE",
    board_name: "Tamil Nadu Directorate of Government Examinations",
    class_level: "11",
    exam_name: "Higher Secondary (+1) Public Examination 2026",
    academic_year: "2025-2026",
    result_date: "2026-05-14T09:30:00Z",
    result_date_display: "May 14, 2026 (Official Board Evaluation)",
    status: "CONFIRMED_OFFICIAL",
    official_result_url: "https://tnresults.nic.in",
    is_school_level: false,
    required_credentials: ["Registration Number", "Date of Birth (DD/MM/YYYY)"],
    last_verified_at: "2026-02-18T10:00:00Z"
  },
  {
    id: 8,
    slug: "cbse-class-11-annual-results-2026",
    board_id: 1,
    board_code: "CBSE",
    board_name: "Central Board of Secondary Education (Affiliated Schools)",
    class_level: "11",
    exam_name: "Class XI Annual Home / School Examinations 2026",
    academic_year: "2025-2026",
    result_date: "2026-03-25T10:00:00Z",
    result_date_display: "Late March 2026 (School-Level)",
    status: "PUBLISHED",
    official_result_url: "https://www.cbse.gov.in",
    is_school_level: true, // School-level internal result
    required_credentials: ["Contact your school administration or student portal"],
    last_verified_at: "2026-02-18T10:00:00Z"
  },
  {
    id: 9,
    slug: "kerala-sslc-class-10-results-2026",
    board_id: 6,
    board_code: "KBPE_DHSE",
    board_name: "Kerala Board of Public Examinations",
    class_level: "10",
    exam_name: "SSLC Examination Kerala 2026",
    academic_year: "2025-2026",
    result_date: "2026-05-09T14:00:00Z",
    result_date_display: "May 09, 2026 (Tentative 2:00 PM)",
    status: "EXPECTED_UNOFFICIAL",
    official_result_url: "https://keralaresults.nic.in",
    required_credentials: ["Register Number", "Date of Birth"],
    last_verified_at: "2026-02-18T10:00:00Z"
  },
  {
    id: 10,
    slug: "kerala-dhse-class-12-results-2026",
    board_id: 6,
    board_code: "KBPE_DHSE",
    board_name: "Kerala Directorate of Higher Secondary Education",
    class_level: "12",
    exam_name: "DHSE / VHSE Plus Two Examination 2026",
    academic_year: "2025-2026",
    result_date: "2026-05-15T15:00:00Z",
    result_date_display: "May 15, 2026 (Tentative 3:00 PM)",
    status: "EXPECTED_UNOFFICIAL",
    official_result_url: "https://keralaresults.nic.in",
    required_credentials: ["Registration Number", "Date of Birth"],
    last_verified_at: "2026-02-18T10:00:00Z"
  },
  {
    id: 11,
    slug: "karnataka-sslc-class-10-results-2026",
    board_id: 7,
    board_code: "KSEAB",
    board_name: "Karnataka School Examination and Assessment Board",
    class_level: "10",
    exam_name: "Karnataka SSLC Exam 1 2026",
    academic_year: "2025-2026",
    result_date: "2026-05-07T11:00:00Z",
    result_date_display: "May 07, 2026 (Tentative 11:00 AM)",
    status: "EXPECTED_UNOFFICIAL",
    official_result_url: "https://karresults.nic.in",
    required_credentials: ["Registration Number", "Date of Birth"],
    last_verified_at: "2026-02-18T10:00:00Z"
  },
  {
    id: 12,
    slug: "karnataka-puc-class-12-results-2026",
    board_id: 7,
    board_code: "KSEAB",
    board_name: "Karnataka School Examination and Assessment Board",
    class_level: "12",
    exam_name: "Karnataka 2nd PUC Exam 1 2026",
    academic_year: "2025-2026",
    result_date: "2026-04-20T10:00:00Z",
    result_date_display: "April 20, 2026 (Tentative 10:00 AM)",
    status: "EXPECTED_UNOFFICIAL",
    official_result_url: "https://karresults.nic.in",
    required_credentials: ["Registration Number", "Subject Combination / Stream"],
    last_verified_at: "2026-02-18T10:00:00Z"
  },
  {
    id: 13,
    slug: "up-board-highschool-class-10-results-2026",
    board_id: 9,
    board_code: "UPMSP",
    board_name: "Uttar Pradesh Madhyamik Shiksha Parishad",
    class_level: "10",
    exam_name: "High School (Class 10) Examination 2026",
    academic_year: "2025-2026",
    result_date: "2026-04-25T13:30:00Z",
    result_date_display: "April 25, 2026 (Tentative 1:30 PM)",
    status: "EXPECTED_UNOFFICIAL",
    official_result_url: "https://upresults.nic.in",
    required_credentials: ["Roll Number", "School Code"],
    last_verified_at: "2026-02-18T10:00:00Z"
  },
  {
    id: 14,
    slug: "up-board-intermediate-class-12-results-2026",
    board_id: 9,
    board_code: "UPMSP",
    board_name: "Uttar Pradesh Madhyamik Shiksha Parishad",
    class_level: "12",
    exam_name: "Intermediate (Class 12) Examination 2026",
    academic_year: "2025-2026",
    result_date: "2026-04-25T14:00:00Z",
    result_date_display: "April 25, 2026 (Tentative 2:00 PM)",
    status: "EXPECTED_UNOFFICIAL",
    official_result_url: "https://upresults.nic.in",
    required_credentials: ["Roll Number", "School Code"],
    last_verified_at: "2026-02-18T10:00:00Z"
  },
  {
    id: 15,
    slug: "maharashtra-ssc-class-10-results-2026",
    board_id: 8,
    board_code: "MSBSHSE",
    board_name: "Maharashtra State Board of Secondary and Higher Secondary Education",
    class_level: "10",
    exam_name: "SSC (Class 10) Examination 2026",
    academic_year: "2025-2026",
    result_date: "2026-05-28T13:00:00Z",
    result_date_display: "May 28, 2026 (Tentative 1:00 PM)",
    status: "EXPECTED_UNOFFICIAL",
    official_result_url: "https://mahresult.nic.in",
    required_credentials: ["Roll Number", "Mother's First Name"],
    last_verified_at: "2026-02-18T10:00:00Z"
  },
  {
    id: 16,
    slug: "maharashtra-hsc-class-12-results-2026",
    board_id: 8,
    board_code: "MSBSHSE",
    board_name: "Maharashtra State Board of Secondary and Higher Secondary Education",
    class_level: "12",
    exam_name: "HSC (Class 12) Examination 2026",
    academic_year: "2025-2026",
    result_date: "2026-05-21T13:00:00Z",
    result_date_display: "May 21, 2026 (Tentative 1:00 PM)",
    status: "EXPECTED_UNOFFICIAL",
    official_result_url: "https://mahresult.nic.in",
    required_credentials: ["Roll Number", "Mother's First Name"],
    last_verified_at: "2026-02-18T10:00:00Z"
  }
];

// -------------------------------------------------------------
// 3. SCHOOL TEXTBOOKS LIBRARY (LEGAL OPEN EDUCATIONAL ACCESS)
// -------------------------------------------------------------
export const schoolTextbooksData: SchoolTextbook[] = [
  // CLASS 10 (NCERT / CBSE / STATE)
  {
    id: 1,
    slug: "ncert-class-10-mathematics",
    title: "Mathematics (Class X)",
    board_code: "CBSE",
    board_name: "Central Board of Secondary Education / NCERT",
    class_level: "10",
    stream: "GENERAL",
    subject: "Mathematics",
    language: "English",
    edition: "Latest National Curriculum Framework 2025-2026",
    academic_year: "2025-2026",
    publisher: "NCERT (National Council of Educational Research and Training)",
    cover_image: "https://ncert.nic.in/textbook/pdf/jemh1cc.jpg",
    official_download_pdf_url: "https://ncert.nic.in/textbook.php?jemh1=0-14",
    online_reader_url: "https://ncert.nic.in/textbook.php?jemh1=1-14",
    is_official: true,
    file_size_mb: 18.4,
    description: "Standard Class 10 NCERT Mathematics textbook covering Real Numbers, Polynomials, Linear Equations, Quadratic Equations, Triangles, Coordinate Geometry, Trigonometry, Circles, and Statistics.",
    chapters: [
      { chapter_no: 1, title: "Real Numbers" },
      { chapter_no: 2, title: "Polynomials" },
      { chapter_no: 3, title: "Pair of Linear Equations in Two Variables" },
      { chapter_no: 4, title: "Quadratic Equations" },
      { chapter_no: 5, title: "Arithmetic Progressions" },
      { chapter_no: 6, title: "Triangles" },
      { chapter_no: 7, title: "Coordinate Geometry" },
      { chapter_no: 8, title: "Introduction to Trigonometry" },
      { chapter_no: 9, title: "Some Applications of Trigonometry" },
      { chapter_no: 10, title: "Circles" },
      { chapter_no: 11, title: "Areas Related to Circles" },
      { chapter_no: 12, title: "Surface Areas and Volumes" },
      { chapter_no: 13, title: "Statistics" },
      { chapter_no: 14, title: "Probability" }
    ]
  },
  {
    id: 2,
    slug: "ncert-class-10-science",
    title: "Science (Class X)",
    board_code: "CBSE",
    board_name: "Central Board of Secondary Education / NCERT",
    class_level: "10",
    stream: "GENERAL",
    subject: "Science",
    language: "English",
    edition: "Rationalized NCF Edition 2025-2026",
    academic_year: "2025-2026",
    publisher: "NCERT",
    cover_image: "https://ncert.nic.in/textbook/pdf/jesc1cc.jpg",
    official_download_pdf_url: "https://ncert.nic.in/textbook.php?jesc1=0-13",
    online_reader_url: "https://ncert.nic.in/textbook.php?jesc1=1-13",
    is_official: true,
    file_size_mb: 22.8,
    description: "Official NCERT Science textbook integrating Physics, Chemistry, and Biology fundamentals for Class 10 Board Examinations.",
    chapters: [
      { chapter_no: 1, title: "Chemical Reactions and Equations" },
      { chapter_no: 2, title: "Acids, Bases and Salts" },
      { chapter_no: 3, title: "Metals and Non-metals" },
      { chapter_no: 4, title: "Carbon and its Compounds" },
      { chapter_no: 5, title: "Life Processes" },
      { chapter_no: 6, title: "Control and Coordination" },
      { chapter_no: 7, title: "How do Organisms Reproduce?" },
      { chapter_no: 8, title: "Heredity and Evolution" },
      { chapter_no: 9, title: "Light – Reflection and Refraction" },
      { chapter_no: 10, title: "The Human Eye and the Colourful World" },
      { chapter_no: 11, title: "Electricity" },
      { chapter_no: 12, title: "Magnetic Effects of Electric Current" },
      { chapter_no: 13, title: "Our Environment" }
    ]
  },
  {
    id: 3,
    slug: "ncert-class-10-social-science-democratic-politics",
    title: "Democratic Politics – II (Civics Class X)",
    board_code: "CBSE",
    board_name: "Central Board of Secondary Education / NCERT",
    class_level: "10",
    stream: "GENERAL",
    subject: "Social Science",
    language: "English",
    edition: "2025-2026 Edition",
    academic_year: "2025-2026",
    publisher: "NCERT",
    cover_image: "https://ncert.nic.in/textbook/pdf/jess4cc.jpg",
    official_download_pdf_url: "https://ncert.nic.in/textbook.php?jess4=0-5",
    online_reader_url: "https://ncert.nic.in/textbook.php?jess4=1-5",
    is_official: true,
    file_size_mb: 12.1,
    description: "NCERT textbook on Political Science covering Power Sharing, Federalism, Gender, Religion and Caste, Political Parties, and Outcomes of Democracy.",
    chapters: [
      { chapter_no: 1, title: "Power-sharing" },
      { chapter_no: 2, title: "Federalism" },
      { chapter_no: 3, title: "Gender, Religion and Caste" },
      { chapter_no: 4, title: "Political Parties" },
      { chapter_no: 5, title: "Outcomes of Democracy" }
    ]
  },
  {
    id: 4,
    slug: "tn-scert-class-10-mathematics",
    title: "Mathematics Class 10 (Samacheer Kalvi)",
    board_code: "TNDGE",
    board_name: "State Council of Educational Research and Training, Tamil Nadu",
    class_level: "10",
    stream: "GENERAL",
    subject: "Mathematics",
    language: "English",
    edition: "Revised Curriculum 2025-2026",
    academic_year: "2025-2026",
    publisher: "Tamil Nadu Textbook and Educational Services Corporation",
    cover_image: "https://textbooksonline.tn.nic.in/books/10_EM_Maths.jpg",
    official_download_pdf_url: "https://textbooksonline.tn.nic.in",
    is_official: true,
    file_size_mb: 24.5,
    description: "Official Tamil Nadu State Board Class 10 Mathematics textbook covering Relations and Functions, Numbers and Sequences, Algebra, Geometry, Coordinate Geometry, Trigonometry, and Mensuration.",
    chapters: [
      { chapter_no: 1, title: "Relations and Functions" },
      { chapter_no: 2, title: "Numbers and Sequences" },
      { chapter_no: 3, title: "Algebra" },
      { chapter_no: 4, title: "Geometry" },
      { chapter_no: 5, title: "Coordinate Geometry" },
      { chapter_no: 6, title: "Trigonometry" },
      { chapter_no: 7, title: "Mensuration" },
      { chapter_no: 8, title: "Statistics and Probability" }
    ]
  },

  // CLASS 11 SCIENCE STREAM
  {
    id: 5,
    slug: "ncert-class-11-physics-part-1",
    title: "Physics Part I (Class XI)",
    board_code: "CBSE",
    board_name: "Central Board of Secondary Education / NCERT",
    class_level: "11",
    stream: "SCIENCE",
    subject: "Physics",
    language: "English",
    edition: "2025-2026 Revised Edition",
    academic_year: "2025-2026",
    publisher: "NCERT",
    cover_image: "https://ncert.nic.in/textbook/pdf/keph1cc.jpg",
    official_download_pdf_url: "https://ncert.nic.in/textbook.php?keph1=0-7",
    online_reader_url: "https://ncert.nic.in/textbook.php?keph1=1-7",
    is_official: true,
    file_size_mb: 26.2,
    description: "Class 11 Physics covering Units and Measurements, Motion in a Straight Line, Motion in a Plane, Laws of Motion, Work, Energy and Power, System of Particles and Rotational Motion, and Gravitation.",
    chapters: [
      { chapter_no: 1, title: "Units and Measurements" },
      { chapter_no: 2, title: "Motion in a Straight Line" },
      { chapter_no: 3, title: "Motion in a Plane" },
      { chapter_no: 4, title: "Laws of Motion" },
      { chapter_no: 5, title: "Work, Energy and Power" },
      { chapter_no: 6, title: "System of Particles and Rotational Motion" },
      { chapter_no: 7, title: "Gravitation" }
    ]
  },
  {
    id: 6,
    slug: "ncert-class-11-chemistry-part-1",
    title: "Chemistry Part I (Class XI)",
    board_code: "CBSE",
    board_name: "Central Board of Secondary Education / NCERT",
    class_level: "11",
    stream: "SCIENCE",
    subject: "Chemistry",
    language: "English",
    edition: "2025-2026 Revised Edition",
    academic_year: "2025-2026",
    publisher: "NCERT",
    cover_image: "https://ncert.nic.in/textbook/pdf/kech1cc.jpg",
    official_download_pdf_url: "https://ncert.nic.in/textbook.php?kech1=0-6",
    online_reader_url: "https://ncert.nic.in/textbook.php?kech1=1-6",
    is_official: true,
    file_size_mb: 21.0,
    description: "Class 11 Chemistry covering Some Basic Concepts of Chemistry, Structure of Atom, Classification of Elements, Chemical Bonding, Thermodynamics, and Equilibrium.",
    chapters: [
      { chapter_no: 1, title: "Some Basic Concepts of Chemistry" },
      { chapter_no: 2, title: "Structure of Atom" },
      { chapter_no: 3, title: "Classification of Elements and Periodicity in Properties" },
      { chapter_no: 4, title: "Chemical Bonding and Molecular Structure" },
      { chapter_no: 5, title: "Thermodynamics" },
      { chapter_no: 6, title: "Equilibrium" }
    ]
  },
  {
    id: 7,
    slug: "ncert-class-11-biology",
    title: "Biology (Class XI)",
    board_code: "CBSE",
    board_name: "Central Board of Secondary Education / NCERT",
    class_level: "11",
    stream: "SCIENCE",
    subject: "Biology",
    language: "English",
    edition: "2025-2026 Revised Edition",
    academic_year: "2025-2026",
    publisher: "NCERT",
    cover_image: "https://ncert.nic.in/textbook/pdf/kebo1cc.jpg",
    official_download_pdf_url: "https://ncert.nic.in/textbook.php?kebo1=0-19",
    online_reader_url: "https://ncert.nic.in/textbook.php?kebo1=1-19",
    is_official: true,
    file_size_mb: 34.1,
    description: "Class 11 NCERT Biology textbook covering Diversity in the Living World, Structural Organisation in Animals and Plants, Cell Structure and Functions, Plant Physiology, and Human Physiology.",
    chapters: [
      { chapter_no: 1, title: "The Living World" },
      { chapter_no: 2, title: "Biological Classification" },
      { chapter_no: 3, title: "Plant Kingdom" },
      { chapter_no: 4, title: "Animal Kingdom" },
      { chapter_no: 5, title: "Morphology of Flowering Plants" },
      { chapter_no: 6, title: "Anatomy of Flowering Plants" },
      { chapter_no: 7, title: "Structural Organisation in Animals" },
      { chapter_no: 8, title: "Cell: The Unit of Life" },
      { chapter_no: 9, title: "Biomolecules" },
      { chapter_no: 10, title: "Cell Cycle and Cell Division" }
    ]
  },

  // CLASS 11 COMMERCE STREAM
  {
    id: 8,
    slug: "ncert-class-11-financial-accounting-1",
    title: "Financial Accounting – I (Class XI)",
    board_code: "CBSE",
    board_name: "Central Board of Secondary Education / NCERT",
    class_level: "11",
    stream: "COMMERCE",
    subject: "Accountancy",
    language: "English",
    edition: "2025-2026 Edition",
    academic_year: "2025-2026",
    publisher: "NCERT",
    cover_image: "https://ncert.nic.in/textbook/pdf/keac1cc.jpg",
    official_download_pdf_url: "https://ncert.nic.in/textbook.php?keac1=0-8",
    online_reader_url: "https://ncert.nic.in/textbook.php?keac1=1-8",
    is_official: true,
    file_size_mb: 16.5,
    description: "Fundamental Accountancy textbook for Class 11 Commerce covering Introduction to Accounting, Theory Base, Recording of Transactions, Bank Reconciliation Statement, Trial Balance, and Depreciation.",
    chapters: [
      { chapter_no: 1, title: "Introduction to Accounting" },
      { chapter_no: 2, title: "Theory Base of Accounting" },
      { chapter_no: 3, title: "Recording of Transactions – I" },
      { chapter_no: 4, title: "Recording of Transactions – II" },
      { chapter_no: 5, title: "Bank Reconciliation Statement" },
      { chapter_no: 6, title: "Trial Balance and Rectification of Errors" },
      { chapter_no: 7, title: "Depreciation, Provisions and Reserves" }
    ]
  },
  {
    id: 9,
    slug: "ncert-class-11-business-studies",
    title: "Business Studies (Class XI)",
    board_code: "CBSE",
    board_name: "Central Board of Secondary Education / NCERT",
    class_level: "11",
    stream: "COMMERCE",
    subject: "Business Studies",
    language: "English",
    edition: "2025-2026 Edition",
    academic_year: "2025-2026",
    publisher: "NCERT",
    cover_image: "https://ncert.nic.in/textbook/pdf/kebs1cc.jpg",
    official_download_pdf_url: "https://ncert.nic.in/textbook.php?kebs1=0-11",
    online_reader_url: "https://ncert.nic.in/textbook.php?kebs1=1-11",
    is_official: true,
    file_size_mb: 19.3,
    description: "Foundational Business Studies textbook covering Nature and Purpose of Business, Forms of Business Organisation, Public and Private Enterprises, Business Services, and Sources of Business Finance.",
    chapters: [
      { chapter_no: 1, title: "Business, Trade and Commerce" },
      { chapter_no: 2, title: "Forms of Business Organisation" },
      { chapter_no: 3, title: "Private, Public and Global Enterprises" },
      { chapter_no: 4, title: "Business Services" },
      { chapter_no: 5, title: "Emerging Modes of Business" },
      { chapter_no: 6, title: "Social Responsibilities of Business and Business Ethics" }
    ]
  },

  // CLASS 11 HUMANITIES STREAM
  {
    id: 10,
    slug: "ncert-class-11-themes-in-world-history",
    title: "Themes in World History (Class XI)",
    board_code: "CBSE",
    board_name: "Central Board of Secondary Education / NCERT",
    class_level: "11",
    stream: "HUMANITIES",
    subject: "History",
    language: "English",
    edition: "2025-2026 Edition",
    academic_year: "2025-2026",
    publisher: "NCERT",
    cover_image: "https://ncert.nic.in/textbook/pdf/kehy1cc.jpg",
    official_download_pdf_url: "https://ncert.nic.in/textbook.php?kehy1=0-7",
    online_reader_url: "https://ncert.nic.in/textbook.php?kehy1=1-7",
    is_official: true,
    file_size_mb: 28.4,
    description: "World History textbook exploring Early Societies, Nomadic Empires, Three Orders, Changing Cultural Traditions, Displacing Indigenous Peoples, and Paths to Modernisation.",
    chapters: [
      { chapter_no: 1, title: "Writing and City Life" },
      { chapter_no: 2, title: "An Empire Across Three Continents" },
      { chapter_no: 3, title: "Nomadic Empires" },
      { chapter_no: 4, title: "The Three Orders" },
      { chapter_no: 5, title: "Changing Cultural Traditions" },
      { chapter_no: 6, title: "Displacing Indigenous Peoples" },
      { chapter_no: 7, title: "Paths to Modernisation" }
    ]
  },

  // CLASS 12 SCIENCE STREAM
  {
    id: 11,
    slug: "ncert-class-12-physics-part-1",
    title: "Physics Part I (Class XII)",
    board_code: "CBSE",
    board_name: "Central Board of Secondary Education / NCERT",
    class_level: "12",
    stream: "SCIENCE",
    subject: "Physics",
    language: "English",
    edition: "2025-2026 Rationalized Edition",
    academic_year: "2025-2026",
    publisher: "NCERT",
    cover_image: "https://ncert.nic.in/textbook/pdf/leph1cc.jpg",
    official_download_pdf_url: "https://ncert.nic.in/textbook.php?leph1=0-8",
    online_reader_url: "https://ncert.nic.in/textbook.php?leph1=1-8",
    is_official: true,
    file_size_mb: 29.8,
    description: "Class 12 Physics Part 1 covering Electric Charges and Fields, Electrostatic Potential and Capacitance, Current Electricity, Moving Charges and Magnetism, Magnetism and Matter, and Electromagnetic Induction.",
    chapters: [
      { chapter_no: 1, title: "Electric Charges and Fields" },
      { chapter_no: 2, title: "Electrostatic Potential and Capacitance" },
      { chapter_no: 3, title: "Current Electricity" },
      { chapter_no: 4, title: "Moving Charges and Magnetism" },
      { chapter_no: 5, title: "Magnetism and Matter" },
      { chapter_no: 6, title: "Electromagnetic Induction" },
      { chapter_no: 7, title: "Alternating Current" },
      { chapter_no: 8, title: "Electromagnetic Waves" }
    ]
  },
  {
    id: 12,
    slug: "ncert-class-12-mathematics-part-1",
    title: "Mathematics Part I (Class XII)",
    board_code: "CBSE",
    board_name: "Central Board of Secondary Education / NCERT",
    class_level: "12",
    stream: "SCIENCE",
    subject: "Mathematics",
    language: "English",
    edition: "2025-2026 Rationalized Edition",
    academic_year: "2025-2026",
    publisher: "NCERT",
    cover_image: "https://ncert.nic.in/textbook/pdf/lemh1cc.jpg",
    official_download_pdf_url: "https://ncert.nic.in/textbook.php?lemh1=0-6",
    online_reader_url: "https://ncert.nic.in/textbook.php?lemh1=1-6",
    is_official: true,
    file_size_mb: 17.6,
    description: "Class 12 Mathematics Part 1 textbook covering Relations and Functions, Inverse Trigonometric Functions, Matrices, Determinants, Continuity and Differentiability, and Application of Derivatives.",
    chapters: [
      { chapter_no: 1, title: "Relations and Functions" },
      { chapter_no: 2, title: "Inverse Trigonometric Functions" },
      { chapter_no: 3, title: "Matrices" },
      { chapter_no: 4, title: "Determinants" },
      { chapter_no: 5, title: "Continuity and Differentiability" },
      { chapter_no: 6, title: "Application of Derivatives" }
    ]
  },

  // CLASS 12 COMMERCE STREAM
  {
    id: 13,
    slug: "ncert-class-12-accountancy-company-accounts",
    title: "Accountancy: Company Accounts and Analysis of Financial Statements (Class XII)",
    board_code: "CBSE",
    board_name: "Central Board of Secondary Education / NCERT",
    class_level: "12",
    stream: "COMMERCE",
    subject: "Accountancy",
    language: "English",
    edition: "2025-2026 Edition",
    academic_year: "2025-2026",
    publisher: "NCERT",
    cover_image: "https://ncert.nic.in/textbook/pdf/leac2cc.jpg",
    official_download_pdf_url: "https://ncert.nic.in/textbook.php?leac2=0-5",
    online_reader_url: "https://ncert.nic.in/textbook.php?leac2=1-5",
    is_official: true,
    file_size_mb: 18.2,
    description: "Class 12 Accountancy Part 2 covering Accounting for Share Capital, Issue and Redemption of Debentures, Financial Statements of a Company, and Cash Flow Statement.",
    chapters: [
      { chapter_no: 1, title: "Accounting for Share Capital" },
      { chapter_no: 2, title: "Issue and Redemption of Debentures" },
      { chapter_no: 3, title: "Financial Statements of a Company" },
      { chapter_no: 4, title: "Analysis of Financial Statements" },
      { chapter_no: 5, title: "Accounting Ratios" },
      { chapter_no: 6, title: "Cash Flow Statement" }
    ]
  },

  // CLASS 12 HUMANITIES STREAM
  {
    id: 14,
    slug: "ncert-class-12-contemporary-world-politics",
    title: "Contemporary World Politics (Class XII)",
    board_code: "CBSE",
    board_name: "Central Board of Secondary Education / NCERT",
    class_level: "12",
    stream: "HUMANITIES",
    subject: "Political Science",
    language: "English",
    edition: "2025-2026 Edition",
    academic_year: "2025-2026",
    publisher: "NCERT",
    cover_image: "https://ncert.nic.in/textbook/pdf/leps1cc.jpg",
    official_download_pdf_url: "https://ncert.nic.in/textbook.php?leps1=0-7",
    online_reader_url: "https://ncert.nic.in/textbook.php?leps1=1-7",
    is_official: true,
    file_size_mb: 15.3,
    description: "Class 12 Political Science exploring The End of Bipolarity, Contemporary Centres of Power, Contemporary South Asia, International Organisations, Security in the Contemporary World, and Globalisation.",
    chapters: [
      { chapter_no: 1, title: "The End of Bipolarity" },
      { chapter_no: 2, title: "Contemporary Centres of Power" },
      { chapter_no: 3, title: "Contemporary South Asia" },
      { chapter_no: 4, title: "International Organisations" },
      { chapter_no: 5, title: "Security in the Contemporary World" },
      { chapter_no: 6, title: "Environment and Natural Resources" },
      { chapter_no: 7, title: "Globalisation" }
    ]
  }
];

// -------------------------------------------------------------
// 4. SYLLABUS DIRECTORY
// -------------------------------------------------------------
export const schoolSyllabusData: SchoolSyllabus[] = [
  {
    id: 1,
    board_code: "CBSE",
    class_level: "10",
    stream: "GENERAL",
    subject: "Mathematics",
    academic_year: "2025-2026",
    official_pdf_url: "https://cbseacademic.nic.in/web_material/CurriculumMain25/Sec/Maths_Sec_2025-26.pdf",
    revision_status: "CURRENT",
    chapter_topics: [
      { chapter: "Real Numbers", topics: ["Fundamental Theorem of Arithmetic", "Proofs of irrationality of √2, √3, √5"] },
      { chapter: "Polynomials", topics: ["Zeros of a polynomial", "Relationship between zeros and coefficients"] },
      { chapter: "Triangles", topics: ["Basic Proportionality Theorem", "Criteria for similarity of triangles"] }
    ]
  },
  {
    id: 2,
    board_code: "CBSE",
    class_level: "10",
    stream: "GENERAL",
    subject: "Science",
    academic_year: "2025-2026",
    official_pdf_url: "https://cbseacademic.nic.in/web_material/CurriculumMain25/Sec/Science_Sec_2025-26.pdf",
    revision_status: "CURRENT",
    chapter_topics: [
      { chapter: "Chemical Reactions", topics: ["Chemical equation", "Types of chemical reactions: combination, decomposition, displacement"] },
      { chapter: "Life Processes", topics: ["Basic concept of nutrition, respiration, transport and excretion in plants and animals"] },
      { chapter: "Electricity", topics: ["Ohm's law", "Resistance, Resistivity, series and parallel combination of resistors"] }
    ]
  },
  {
    id: 3,
    board_code: "CBSE",
    class_level: "12",
    stream: "SCIENCE",
    subject: "Physics",
    academic_year: "2025-2026",
    official_pdf_url: "https://cbseacademic.nic.in/web_material/CurriculumMain25/SrSec/Physics_SrSec_2025-26.pdf",
    revision_status: "CURRENT",
    chapter_topics: [
      { chapter: "Electrostatics", topics: ["Electric charges, Coulomb's law, Gauss's theorem applications", "Capacitors in series and parallel"] },
      { chapter: "Current Electricity", topics: ["Kirchhoff's rules, Wheatstone bridge", "Temperature dependence of resistance"] },
      { chapter: "Optics", topics: ["Refraction at spherical surfaces, lenses, lens maker's formula", "Wave optics, Young's double slit experiment"] }
    ]
  },
  {
    id: 4,
    board_code: "TNDGE",
    class_level: "10",
    stream: "GENERAL",
    subject: "Science",
    academic_year: "2025-2026",
    official_pdf_url: "https://scert.tn.gov.in/syllabus/10_Science_Syllabus.pdf",
    revision_status: "CURRENT",
    chapter_topics: [
      { chapter: "Laws of Motion", topics: ["Inertia", "Newton's laws of motion", "Mass and Weight"] },
      { chapter: "Optics", topics: ["Properties of light", "Refraction through glass prism", "Optical instruments"] }
    ]
  }
];

// -------------------------------------------------------------
// 5. PREVIOUS YEAR QUESTION PAPERS (PYQPs)
// -------------------------------------------------------------
export const schoolQuestionPapersData: SchoolQuestionPaper[] = [
  {
    id: 1,
    board_code: "CBSE",
    class_level: "10",
    subject: "Mathematics (Standard)",
    year: 2025,
    exam_type: "ANNUAL_MAIN",
    paper_pdf_url: "https://www.cbse.gov.in/cbsenew/question-paper/2025/ClassX/Mathematics_Standard.pdf",
    answer_key_pdf_url: "https://www.cbse.gov.in/cbsenew/marking-scheme/2025/ClassX/MS_Maths_Standard.pdf",
    marking_scheme_url: "https://www.cbse.gov.in/cbsenew/marking-scheme/2025/ClassX/MS_Maths_Standard.pdf"
  },
  {
    id: 2,
    board_code: "CBSE",
    class_level: "10",
    subject: "Science",
    year: 2025,
    exam_type: "ANNUAL_MAIN",
    paper_pdf_url: "https://www.cbse.gov.in/cbsenew/question-paper/2025/ClassX/Science.pdf",
    answer_key_pdf_url: "https://www.cbse.gov.in/cbsenew/marking-scheme/2025/ClassX/MS_Science.pdf"
  },
  {
    id: 3,
    board_code: "CBSE",
    class_level: "12",
    subject: "Physics",
    year: 2025,
    exam_type: "ANNUAL_MAIN",
    paper_pdf_url: "https://www.cbse.gov.in/cbsenew/question-paper/2025/ClassXII/Physics.pdf",
    answer_key_pdf_url: "https://www.cbse.gov.in/cbsenew/marking-scheme/2025/ClassXII/MS_Physics.pdf"
  },
  {
    id: 4,
    board_code: "CBSE",
    class_level: "12",
    subject: "Accountancy",
    year: 2025,
    exam_type: "ANNUAL_MAIN",
    paper_pdf_url: "https://www.cbse.gov.in/cbsenew/question-paper/2025/ClassXII/Accountancy.pdf",
    answer_key_pdf_url: "https://www.cbse.gov.in/cbsenew/marking-scheme/2025/ClassXII/MS_Accountancy.pdf"
  },
  {
    id: 5,
    board_code: "TNDGE",
    class_level: "10",
    subject: "Mathematics",
    year: 2024,
    exam_type: "ANNUAL_MAIN",
    paper_pdf_url: "https://dge.tn.gov.in/previous_year_papers/10_Maths_2024.pdf"
  },
  {
    id: 6,
    board_code: "TNDGE",
    class_level: "12",
    subject: "Physics",
    year: 2024,
    exam_type: "ANNUAL_MAIN",
    paper_pdf_url: "https://dge.tn.gov.in/previous_year_papers/12_Physics_2024.pdf"
  }
];

export interface StudentSchoolProfile {
  user_id: number;
  board_code: string;
  class_level: "10" | "11" | "12";
  stream?: "GENERAL" | "SCIENCE" | "COMMERCE" | "HUMANITIES";
  subjects: string[];
  saved_book_ids: number[];
  reading_progress: Record<number, number>; // bookId -> percentage
}

export const defaultStudentSchoolProfile: StudentSchoolProfile = {
  user_id: 1,
  board_code: "CBSE",
  class_level: "12",
  stream: "SCIENCE",
  subjects: ["Physics", "Chemistry", "Mathematics", "English"],
  saved_book_ids: [11, 12],
  reading_progress: { 11: 45, 12: 20 }
};
