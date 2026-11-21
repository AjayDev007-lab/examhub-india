/**
 * ExamHub India — Centralized Examination Directory, Application Portal & Countdown Data
 * Complete database models, mock datasets, and tracking state.
 */

export interface ExamApplication {
  id: number;
  slug: string;
  name: string;
  conducting_authority: string;
  authority_code: string;
  category: "CENTRAL_GOVERNMENT" | "STATE_GOVERNMENT" | "RAILWAY" | "BANKING" | "DEFENCE" | "ENTRANCE" | "UNIVERSITY" | "ENGINEERING" | "MEDICAL" | "TEACHING" | "PROFESSIONAL";
  category_label: string;
  state_name: string;
  state_code?: string;
  eligibility: string;
  qualification: string;
  age_limit: string;
  age_relaxation: string;
  application_fee: string;
  application_start_date: string;
  application_end_date: string;
  exam_date: string;
  exam_date_display: string;
  admit_card_date: string;
  result_date: string;
  result_status: "CONFIRMED_OFFICIAL" | "EXPECTED_UNOFFICIAL" | "NOT_ANNOUNCED" | "PUBLISHED" | "DELAYED";
  required_documents: string[];
  official_notification_pdf: string;
  official_application_url: string;
  source_website_url: string;
  status: "APPLICATION_OPEN" | "CLOSING_SOON" | "UPCOMING" | "NOTIFICATION_RELEASED";
  vacancies: string;
  selection_process: string[];
  syllabus_summary: string;
  apply_clicks: number;
  last_verified_at: string;
  is_featured?: boolean;
}

export interface StudentApplicationRecord {
  id: number;
  user_id: number;
  exam_id: number;
  exam_slug: string;
  exam_name: string;
  authority_code: string;
  conducting_authority: string;
  application_number?: string;
  roll_number?: string;
  status: 
    | "INTERESTED"
    | "NOT_STARTED"
    | "APPLICATION_STARTED"
    | "PAYMENT_PENDING"
    | "SUBMITTED"
    | "CONFIRMATION_RECEIVED"
    | "ADMIT_CARD_RELEASED"
    | "EXAM_COMPLETED"
    | "RESULT_PUBLISHED"
    | "CANCELLED";
  submission_date?: string;
  exam_date?: string;
  admit_card_url?: string;
  scorecard_url?: string;
  private_notes?: string;
  reminders_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CountdownEvent {
  id: number;
  title: string;
  exam_name: string;
  authority_code: string;
  event_type: "EXAM_DATE" | "APPLICATION_DEADLINE" | "RESULT_ANNOUNCEMENT" | "ADMIT_CARD_RELEASE";
  target_date: string; // ISO 8601
  official_source: string;
  verification_status: "VERIFIED" | "TENTATIVE" | "CONFIRMED_OFFICIAL";
  result_status?: "CONFIRMED_OFFICIAL" | "EXPECTED_UNOFFICIAL" | "NOT_ANNOUNCED" | "PUBLISHED" | "DELAYED";
  exam_slug: string;
  official_portal_url: string;
}

export const initialExamApplications: ExamApplication[] = [
  // 1. UPSC Civil Services
  {
    id: 1,
    slug: "upsc-cse-2026",
    name: "Civil Services (Preliminary) Examination 2026",
    conducting_authority: "Union Public Service Commission",
    authority_code: "UPSC",
    category: "CENTRAL_GOVERNMENT",
    category_label: "Central Government",
    state_name: "All India",
    eligibility: "Bachelor's Degree in any discipline from a recognized University",
    qualification: "Graduate / Final Year Appearing",
    age_limit: "21 to 32 years as on 1st August 2026",
    age_relaxation: "OBC: 3 years, SC/ST: 5 years, PwBD: 10 years",
    application_fee: "₹100 (Female, SC, ST & PwBD candidates are exempted)",
    application_start_date: "2026-02-11T09:00:00Z",
    application_end_date: "2026-03-05T18:00:00Z",
    exam_date: "2026-05-24T09:30:00Z",
    exam_date_display: "May 24, 2026 (Sunday)",
    admit_card_date: "May 10, 2026",
    result_date: "June 25, 2026",
    result_status: "EXPECTED_UNOFFICIAL",
    required_documents: ["Scanned Photograph (JPEG)", "Signature (JPEG)", "Valid Photo ID Proof (Aadhaar / Voter ID / Passport)", "Degree Certificate / Marksheet"],
    official_notification_pdf: "https://upsc.gov.in/sites/default/files/ExamNotice_CSE_2026.pdf",
    official_application_url: "https://upsconline.nic.in/upsc/OTRP/",
    source_website_url: "https://upsc.gov.in",
    status: "APPLICATION_OPEN",
    vacancies: "1,056 Posts (IAS, IPS, IFS, IRS, Central Group A & B)",
    selection_process: ["Preliminary Exam (Objective)", "Main Exam (Written Descriptive)", "Personality Test (Interview)"],
    syllabus_summary: "General Studies Paper I (Current Events, History, Polity, Geography, Economy, Ecology) & CSAT Paper II (Comprehension, Reasoning, Aptitude - Qualifying 33%).",
    apply_clicks: 14200,
    last_verified_at: "2026-02-15T10:00:00Z",
    is_featured: true
  },

  // 2. SSC CGL
  {
    id: 2,
    slug: "ssc-cgl-2026",
    name: "Combined Graduate Level Examination (CGL) 2026",
    conducting_authority: "Staff Selection Commission",
    authority_code: "SSC",
    category: "CENTRAL_GOVERNMENT",
    category_label: "Central Government",
    state_name: "All India",
    eligibility: "Bachelor's Degree from a recognized University or equivalent",
    qualification: "Graduation (Any Stream)",
    age_limit: "18 to 32 years (post-wise variation)",
    age_relaxation: "OBC: 3 years, SC/ST: 5 years, Ex-Servicemen: 3 years",
    application_fee: "₹100 (Women, SC, ST, PwBD, ESM Exempted)",
    application_start_date: "2026-06-11T10:00:00Z",
    application_end_date: "2026-07-10T23:00:00Z",
    exam_date: "2026-09-15T09:00:00Z",
    exam_date_display: "September 15 - 26, 2026",
    admit_card_date: "September 05, 2026",
    result_date: "November 20, 2026",
    result_status: "NOT_ANNOUNCED",
    required_documents: ["Matriculation Certificate for DOB", "Degree Certificate", "Recent Passport Photo with Date", "Signature in Black Ink"],
    official_notification_pdf: "https://ssc.gov.in/api/announcement/notice_cgl_2026.pdf",
    official_application_url: "https://ssc.gov.in/login",
    source_website_url: "https://ssc.gov.in",
    status: "UPCOMING",
    vacancies: "17,727 Posts (Inspector CGST, Income Tax, ASO in CSS, MEA, Sub-Inspector CBI)",
    selection_process: ["Tier I Computer Based Test (CBT)", "Tier II CBT (Paper I & II + Data Entry Speed Test)"],
    syllabus_summary: "General Intelligence & Reasoning, General Awareness, Quantitative Aptitude, English Comprehension, Computer Knowledge, Data Entry.",
    apply_clicks: 22800,
    last_verified_at: "2026-02-18T14:30:00Z",
    is_featured: true
  },

  // 3. RRB NTPC
  {
    id: 3,
    slug: "rrb-ntpc-2026",
    name: "Non-Technical Popular Categories (NTPC Graduate & Undergraduate)",
    conducting_authority: "Railway Recruitment Control Board",
    authority_code: "RRB",
    category: "RAILWAY",
    category_label: "Railway Recruitment",
    state_name: "All India",
    eligibility: "12th Pass for Undergraduate Posts / Graduate for Level 5 & 6 Posts",
    qualification: "10+2 / Bachelor's Degree",
    age_limit: "18 to 33 years (Undergraduate) / 18 to 36 years (Graduate)",
    age_relaxation: "OBC: 3 years, SC/ST: 5 years",
    application_fee: "₹500 (₹400 refunded after appearing in CBT-1); SC/ST/Women: ₹250 (Full Refund)",
    application_start_date: "2026-01-14T00:00:00Z",
    application_end_date: "2026-02-28T23:59:00Z",
    exam_date: "2026-04-18T09:00:00Z",
    exam_date_display: "April 18 - May 10, 2026",
    admit_card_date: "April 10, 2026",
    result_date: "July 15, 2026",
    result_status: "NOT_ANNOUNCED",
    required_documents: ["Aadhaar Card", "10th/12th/Degree Certificates", "Community Certificate (SC/ST/OBC-NCL)", "Passport Size Color Photo"],
    official_notification_pdf: "https://www.rrbchennai.gov.in/downloads/CEN_01_2026_NTPC.pdf",
    official_application_url: "https://www.rrbapply.gov.in/#/auth/login",
    source_website_url: "https://www.rrbapply.gov.in",
    status: "CLOSING_SOON",
    vacancies: "11,558 Posts (Station Master, Goods Train Manager, Junior Clerk cum Typist)",
    selection_process: ["1st Stage CBT", "2nd Stage CBT", "Computer Based Aptitude Test (CBAT/TST)", "Document Verification & Medical Exam"],
    syllabus_summary: "Mathematics (30 Marks), General Intelligence & Reasoning (30 Marks), General Awareness (40 Marks). Total 100 Marks in 90 Minutes.",
    apply_clicks: 34100,
    last_verified_at: "2026-02-19T08:00:00Z",
    is_featured: true
  },

  // 4. NEET UG 2026
  {
    id: 4,
    slug: "neet-ug-2026",
    name: "National Eligibility cum Entrance Test (UG) 2026",
    conducting_authority: "National Testing Agency",
    authority_code: "NTA",
    category: "MEDICAL",
    category_label: "Medical Entrance",
    state_name: "All India",
    eligibility: "Physics, Chemistry, Biology/Biotechnology and English at 10+2 level",
    qualification: "10+2 with PCB (Minimum 50% for General, 40% for SC/ST/OBC)",
    age_limit: "Minimum 17 years completed as on 31st December 2026 (No upper age limit)",
    age_relaxation: "No upper age limit as per National Medical Commission guidelines",
    application_fee: "General: ₹1,700 | General-EWS/OBC-NCL: ₹1,600 | SC/ST/PwBD/Third Gender: ₹1,000",
    application_start_date: "2026-02-09T10:00:00Z",
    application_end_date: "2026-03-16T21:00:00Z",
    exam_date: "2026-05-03T14:00:00Z",
    exam_date_display: "May 03, 2026 (Sunday, 02:00 PM - 05:20 PM)",
    admit_card_date: "April 28, 2026",
    result_date: "June 14, 2026",
    result_status: "CONFIRMED_OFFICIAL",
    required_documents: ["Passport Photograph (White background)", "Postcard Size Photo (4x6)", "Left & Right Thumb & Finger Impressions", "Signature", "Class 10 Pass Certificate"],
    official_notification_pdf: "https://neet.nta.nic.in/resources/information-bulletin-neet-ug-2026.pdf",
    official_application_url: "https://exams.nta.ac.in/NEET/",
    source_website_url: "https://exams.nta.ac.in/NEET",
    status: "APPLICATION_OPEN",
    vacancies: "Admissions to MBBS, BDS, BAMS, BHMS, BUMS, BSMS & BSc Nursing across India",
    selection_process: ["Pen & Paper OMR Based Examination", "MCC All-India Counseling (15% AIQ)", "State Medical Counseling (85% State Quota)"],
    syllabus_summary: "Physics (35+15 questions), Chemistry (35+15 questions), Botany (35+15 questions), Zoology (35+15 questions). Total 720 Marks.",
    apply_clicks: 48900,
    last_verified_at: "2026-02-18T16:00:00Z",
    is_featured: true
  },

  // 5. JEE Main 2026
  {
    id: 5,
    slug: "jee-main-2026",
    name: "Joint Entrance Examination (Main) 2026 Session 2",
    conducting_authority: "National Testing Agency",
    authority_code: "NTA",
    category: "ENGINEERING",
    category_label: "Engineering Entrance",
    state_name: "All India",
    eligibility: "Passed Class 12th or equivalent with Physics, Mathematics and Chemistry/Bio",
    qualification: "10+2 with PCM",
    age_limit: "No age limit for candidates appearing in JEE (Main)",
    age_relaxation: "N/A",
    application_fee: "Male (Gen/EWS/OBC): ₹1,000 | Female / SC / ST / PwD: ₹800",
    application_start_date: "2026-02-02T10:00:00Z",
    application_end_date: "2026-03-02T23:00:00Z",
    exam_date: "2026-04-01T09:00:00Z",
    exam_date_display: "April 01 - 08, 2026",
    admit_card_date: "March 26, 2026",
    result_date: "April 22, 2026",
    result_status: "CONFIRMED_OFFICIAL",
    required_documents: ["Recent Photograph with 80% face coverage", "Signature", "Category Certificate (SC/ST/OBC-NCL/GEN-EWS)", "PwD Certificate if applicable"],
    official_notification_pdf: "https://jeemain.nta.nic.in/public-notice-jee-main-2026-session-2.pdf",
    official_application_url: "https://jeemain.nta.nic.in/",
    source_website_url: "https://jeemain.nta.nic.in",
    status: "APPLICATION_OPEN",
    vacancies: "Admissions to NITs, IIITs, CFTIs & Qualifying exam for JEE (Advanced) IITs",
    selection_process: ["Computer Based Test (CBT)", "JoSAA / CSAB Centralized Counseling"],
    syllabus_summary: "Mathematics, Physics, Chemistry (20 MCQs + 5 Numerical Value Questions each section). Total 300 Marks.",
    apply_clicks: 39500,
    last_verified_at: "2026-02-17T11:00:00Z",
    is_featured: true
  },

  // 6. IBPS PO 2026
  {
    id: 6,
    slug: "ibps-po-2026",
    name: "Common Recruitment Process for Probationary Officers (CRP PO/MT-XVI)",
    conducting_authority: "Institute of Banking Personnel Selection",
    authority_code: "IBPS",
    category: "BANKING",
    category_label: "Banking Recruitment",
    state_name: "All India",
    eligibility: "Graduation degree in any discipline from a recognized University",
    qualification: "Degree (Any Stream)",
    age_limit: "20 to 30 years",
    age_relaxation: "OBC: 3 years, SC/ST: 5 years, PwBD: 10 years",
    application_fee: "₹850 (General/EWS/OBC) | ₹175 (SC/ST/PwBD)",
    application_start_date: "2026-08-01T00:00:00Z",
    application_end_date: "2026-08-28T23:59:00Z",
    exam_date: "2026-10-18T09:00:00Z",
    exam_date_display: "October 18 & 19, 2026 (Prelims)",
    admit_card_date: "October 08, 2026",
    result_date: "November 10, 2026",
    result_status: "NOT_ANNOUNCED",
    required_documents: ["Passport Photograph", "Signature", "Left Thumb Impression", "Handwritten Declaration"],
    official_notification_pdf: "https://www.ibps.in/crp-po-mt-xvi-advertisement.pdf",
    official_application_url: "https://ibpsonline.ibps.in/crppoaug26/",
    source_website_url: "https://www.ibps.in",
    status: "UPCOMING",
    vacancies: "4,450 Posts across 11 Public Sector Participating Banks",
    selection_process: ["Preliminary Exam (CBT)", "Main Exam (Objective + Descriptive)", "Common Interview"],
    syllabus_summary: "English Language, Quantitative Aptitude, Reasoning Ability, General/Banking Awareness, Computer Aptitude.",
    apply_clicks: 18400,
    last_verified_at: "2026-02-14T09:00:00Z"
  },

  // 7. TNPSC Group 4 2026
  {
    id: 7,
    slug: "tnpsc-group-4-2026",
    name: "Combined Civil Services Examination IV (Group IV & VAO)",
    conducting_authority: "Tamil Nadu Public Service Commission",
    authority_code: "TNPSC",
    category: "STATE_GOVERNMENT",
    category_label: "State PSC (Tamil Nadu)",
    state_name: "Tamil Nadu",
    state_code: "TN",
    eligibility: "SSLC / 10th Standard pass from recognized board with knowledge of Tamil",
    qualification: "10th Standard (SSLC Pass)",
    age_limit: "21 to 32 years (General); Up to 37/42 years for BC/MBC/SC/ST",
    age_relaxation: "BC/BCM/MBC: Up to 34/37 years, SC/ST: Up to 37/42 years",
    application_fee: "₹100 (Exempted for SC/ST/Differently Abled/Destitute Widows)",
    application_start_date: "2026-01-30T10:00:00Z",
    application_end_date: "2026-02-28T23:59:00Z",
    exam_date: "2026-06-07T09:30:00Z",
    exam_date_display: "June 07, 2026 (Sunday, 09:30 AM - 12:30 PM)",
    admit_card_date: "May 25, 2026",
    result_date: "September 15, 2026",
    result_status: "NOT_ANNOUNCED",
    required_documents: ["SSLC Marksheet", "Community Certificate", "OTR Login ID", "Photo & Signature as per TNPSC specs", "PSTM Certificate if claiming Tamil Medium"],
    official_notification_pdf: "https://www.tnpsc.gov.in/Document/english/01_2026_Group4_Eng.pdf",
    official_application_url: "https://apply.tnpscexams.in/apply-now?edition=NDI=",
    source_website_url: "https://www.tnpsc.gov.in",
    status: "CLOSING_SOON",
    vacancies: "8,932 Posts (Village Administrative Officer, Junior Assistant, Typist, Bill Collector)",
    selection_process: ["Single Stage Written Examination (Objective Type OMR)", "Document Verification & Counseling"],
    syllabus_summary: "Part A: Tamil Eligibility & Scoring Test (100 Questions) + Part B: General Studies (75 Questions) & Aptitude Mental Ability (25 Questions). Total 300 Marks.",
    apply_clicks: 29700,
    last_verified_at: "2026-02-20T11:00:00Z",
    is_featured: true
  },

  // 8. NDA & NA Examination (I) 2026
  {
    id: 8,
    slug: "nda-na-2026",
    name: "National Defence Academy & Naval Academy Examination (I) 2026",
    conducting_authority: "Union Public Service Commission",
    authority_code: "UPSC",
    category: "DEFENCE",
    category_label: "Defence Services",
    state_name: "All India",
    eligibility: "12th Class pass (Army Wing) / 12th with Physics, Chemistry & Math (Air Force & Navy)",
    qualification: "10+2 Passed or Appearing (Unmarried Male & Female)",
    age_limit: "Born not earlier than 2nd July 2007 and not later than 1st July 2010",
    age_relaxation: "No age relaxation is admissible for NDA",
    application_fee: "₹100 (Female / SC / ST candidates exempted)",
    application_start_date: "2025-12-20T10:00:00Z",
    application_end_date: "2026-01-14T18:00:00Z",
    exam_date: "2026-04-12T09:00:00Z",
    exam_date_display: "April 12, 2026 (Sunday)",
    admit_card_date: "March 28, 2026",
    result_date: "May 20, 2026",
    result_status: "EXPECTED_UNOFFICIAL",
    required_documents: ["Class 10th Certificate for DOB", "Class 12th Marksheet/Admit Card", "Aadhaar Card", "Scanned Photograph & Signature"],
    official_notification_pdf: "https://upsc.gov.in/sites/default/files/Notice-NDA-I-2026-Engl.pdf",
    official_application_url: "https://upsconline.nic.in/upsc/OTRP/",
    source_website_url: "https://upsc.gov.in",
    status: "NOTIFICATION_RELEASED",
    vacancies: "400 Seats (208 Army, 42 Navy, 120 Air Force, 30 Naval Academy)",
    selection_process: ["Written Examination (Mathematics 300 + GAT 600 = 900 Marks)", "SSB Interview (5-Day Psychological & Ground Testing - 900 Marks)", "Medical Examination"],
    syllabus_summary: "Mathematics: Algebra, Matrices, Trigonometry, Calculus, Vector, Statistics & Probability. GAT: English (200) & General Knowledge (400).",
    apply_clicks: 16500,
    last_verified_at: "2026-02-12T12:00:00Z"
  },

  // 9. CUET UG 2026
  {
    id: 9,
    slug: "cuet-ug-2026",
    name: "Common University Entrance Test (CUET UG) 2026",
    conducting_authority: "National Testing Agency",
    authority_code: "NTA",
    category: "UNIVERSITY",
    category_label: "University Admissions",
    state_name: "All India",
    eligibility: "Students who have passed or appearing in Class 12 / equivalent examination",
    qualification: "10+2 in Any Stream",
    age_limit: "No age limit for candidates appearing in CUET (UG)",
    age_relaxation: "N/A",
    application_fee: "Up to 3 subjects: ₹1,000 (Gen), ₹900 (OBC/EWS), ₹800 (SC/ST/PwBD)",
    application_start_date: "2026-02-27T10:00:00Z",
    application_end_date: "2026-03-31T23:50:00Z",
    exam_date: "2026-05-18T09:00:00Z",
    exam_date_display: "May 18 - 31, 2026 (Hybrid OMR & CBT)",
    admit_card_date: "May 12, 2026",
    result_date: "June 30, 2026",
    result_status: "CONFIRMED_OFFICIAL",
    required_documents: ["Recent Photograph with white background", "Signature", "Class 10th and 12th Marksheets", "Category/Disability certificate"],
    official_notification_pdf: "https://exams.nta.ac.in/CUET-UG/info-bulletin-2026.pdf",
    official_application_url: "https://cuetug.ntaonline.in/",
    source_website_url: "https://exams.nta.ac.in/CUET-UG",
    status: "APPLICATION_OPEN",
    vacancies: "Undergraduate admissions across 250+ Central, State, Deemed & Private Universities (DU, BHU, JNU, AMU, AU)",
    selection_process: ["Hybrid Mode Examination (OMR / Computer Based)", "Individual University Merit List & CSAS Counseling"],
    syllabus_summary: "Section IA & IB: Languages | Section II: Domain Specific Subjects (NCERT Class 12) | Section III: General Test.",
    apply_clicks: 31200,
    last_verified_at: "2026-02-19T13:00:00Z",
    is_featured: true
  },

  // 10. UGC NET June 2026
  {
    id: 10,
    slug: "ugc-net-2026",
    name: "UGC National Eligibility Test (NET) June 2026",
    conducting_authority: "National Testing Agency",
    authority_code: "NTA",
    category: "TEACHING",
    category_label: "Teaching & Lectureship",
    state_name: "All India",
    eligibility: "Master's Degree with at least 55% marks (50% for reserved categories)",
    qualification: "Postgraduate Degree (Master's)",
    age_limit: "JRF: Not more than 30 years | Assistant Professor & PhD: No upper age limit",
    age_relaxation: "OBC/SC/ST/Women candidates: 5 years relaxation for JRF",
    application_fee: "General: ₹1,150 | Gen-EWS/OBC-NCL: ₹600 | SC/ST/PwD: ₹325",
    application_start_date: "2026-04-15T10:00:00Z",
    application_end_date: "2026-05-12T23:59:00Z",
    exam_date: "2026-06-15T09:00:00Z",
    exam_date_display: "June 15 - 28, 2026",
    admit_card_date: "June 08, 2026",
    result_date: "July 25, 2026",
    result_status: "NOT_ANNOUNCED",
    required_documents: ["PG Degree/Mark Certificate", "Passport Photo & Signature", "Government ID Proof", "Category Certificate"],
    official_notification_pdf: "https://ugcnet.nta.ac.in/notice_ugc_net_june_2026.pdf",
    official_application_url: "https://ugcnet.ntaonline.in/",
    source_website_url: "https://ugcnet.nta.ac.in",
    status: "UPCOMING",
    vacancies: "Award of Junior Research Fellowship (JRF) & Eligibility for Assistant Professor in 83 Subjects",
    selection_process: ["Computer Based Test (Paper 1: 50 Questions (100 Marks) + Paper 2 Subject: 100 Questions (200 Marks))"],
    syllabus_summary: "Paper 1: Teaching Aptitude, Research Aptitude, Reading Comprehension, Communication, Mathematical Reasoning, Data Interpretation, Higher Education System. Paper 2: Chosen PG Subject.",
    apply_clicks: 14700,
    last_verified_at: "2026-02-16T15:00:00Z"
  },

  // 11. GATE 2026 / 2027
  {
    id: 11,
    slug: "gate-2026",
    name: "Graduate Aptitude Test in Engineering (GATE 2026)",
    conducting_authority: "Indian Institute of Technology / IISc",
    authority_code: "GATE",
    category: "ENGINEERING",
    category_label: "Engineering & PSU",
    state_name: "All India",
    eligibility: "Currently studying in 3rd or higher year of undergraduate degree in Engg/Tech/Science/Commerce",
    qualification: "B.E. / B.Tech / B.Arch / B.Sc / M.Sc / MCA",
    age_limit: "No age limit",
    age_relaxation: "N/A",
    application_fee: "Female / SC / ST / PwD: ₹900 | All other candidates: ₹1,800",
    application_start_date: "2025-08-28T10:00:00Z",
    application_end_date: "2025-10-05T23:59:00Z",
    exam_date: "2026-02-07T09:30:00Z",
    exam_date_display: "February 07, 08, 14, 15, 2026",
    admit_card_date: "January 04, 2026",
    result_date: "2026-03-19T10:00:00Z",
    result_status: "CONFIRMED_OFFICIAL",
    required_documents: ["Degree/Provisional/Course Completion Certificate", "Photo & Signature", "Valid ID Proof"],
    official_notification_pdf: "https://gate2026.iitr.ac.in/brochure.pdf",
    official_application_url: "https://goaps.gate2026.iitr.ac.in/",
    source_website_url: "https://gate2026.iitr.ac.in",
    status: "NOTIFICATION_RELEASED",
    vacancies: "M.Tech / PhD Admissions in IITs, IISc & Executive Trainee recruitment across 40+ PSUs (IOCL, NTPC, ONGC, BHEL, DRDO)",
    selection_process: ["Computer Based Test (CBT) across 30 disciplines", "COAP / CCMT Counseling for M.Tech", "Direct PSU Interviews based on GATE Score"],
    syllabus_summary: "General Aptitude (15 Marks) + Engineering Mathematics (13 Marks) + Subject Specification (72 Marks). Total 100 Marks.",
    apply_clicks: 28400,
    last_verified_at: "2026-02-18T17:00:00Z"
  },

  // 12. SBI PO 2026
  {
    id: 12,
    slug: "sbi-po-2026",
    name: "State Bank of India Probationary Officers (PO) 2026",
    conducting_authority: "State Bank of India",
    authority_code: "SBI",
    category: "BANKING",
    category_label: "Banking Recruitment",
    state_name: "All India",
    eligibility: "Graduation in any discipline from a recognized University or equivalent",
    qualification: "Bachelor's Degree (Any Discipline)",
    age_limit: "21 to 30 years",
    age_relaxation: "OBC: 3 years, SC/ST: 5 years, PwD: 10 to 15 years",
    application_fee: "General/EWS/OBC: ₹750 | SC/ST/PwD: Nil",
    application_start_date: "2026-09-05T00:00:00Z",
    application_end_date: "2026-09-27T23:59:00Z",
    exam_date: "2026-11-14T09:00:00Z",
    exam_date_display: "November 14 - 21, 2026",
    admit_card_date: "November 04, 2026",
    result_date: "December 15, 2026",
    result_status: "NOT_ANNOUNCED",
    required_documents: ["Degree Certificate", "Passport Photo with White Backdrop", "Left Thumb Impression", "Signature"],
    official_notification_pdf: "https://sbi.co.in/documents/77530/recruitment-po-2026.pdf",
    official_application_url: "https://ibpsonline.ibps.in/sbipo2026/",
    source_website_url: "https://sbi.co.in/web/careers",
    status: "UPCOMING",
    vacancies: "2,000 Posts of Probationary Officers across SBI Branches nationwide",
    selection_process: ["Phase-I: Preliminary Exam", "Phase-II: Main Exam (Objective + Descriptive Test)", "Phase-III: Psychometric Test, Group Exercise & Interview"],
    syllabus_summary: "Prelims: English (30), Quantitative Aptitude (35), Reasoning (35). Mains: Data Analysis, General/Economy/Banking, Reasoning, English.",
    apply_clicks: 19800,
    last_verified_at: "2026-02-15T12:00:00Z"
  }
];

export const initialStudentApplications: StudentApplicationRecord[] = [
  {
    id: 1,
    user_id: 1,
    exam_id: 1,
    exam_slug: "upsc-cse-2026",
    exam_name: "Civil Services (Preliminary) Examination 2026",
    authority_code: "UPSC",
    conducting_authority: "Union Public Service Commission",
    application_number: "UPSC-2026-89410294",
    roll_number: "0841920",
    status: "SUBMITTED",
    submission_date: "2026-02-14T11:20:00Z",
    exam_date: "2026-05-24T09:30:00Z",
    admit_card_url: "https://examhub-india.vercel.app/hall-tickets?exam_id=1",
    scorecard_url: "https://examhub-india.vercel.app/results?exam_id=1",
    private_notes: "Center: New Delhi Central. Optional subject: Political Science & International Relations.",
    reminders_active: true,
    created_at: "2026-02-14T11:25:00Z",
    updated_at: "2026-02-14T11:25:00Z"
  },
  {
    id: 2,
    user_id: 1,
    exam_id: 4,
    exam_slug: "neet-ug-2026",
    exam_name: "National Eligibility cum Entrance Test (UG) 2026",
    authority_code: "NTA",
    conducting_authority: "National Testing Agency",
    application_number: "260410884920",
    roll_number: "4401029481",
    status: "CONFIRMATION_RECEIVED",
    submission_date: "2026-02-16T15:40:00Z",
    exam_date: "2026-05-03T14:00:00Z",
    admit_card_url: "https://examhub-india.vercel.app/hall-tickets?exam_id=2",
    private_notes: "Medium chosen: English. Exam Center: Chennai Zone.",
    reminders_active: true,
    created_at: "2026-02-16T15:45:00Z",
    updated_at: "2026-02-16T15:45:00Z"
  },
  {
    id: 3,
    user_id: 1,
    exam_id: 3,
    exam_slug: "rrb-ntpc-2026",
    exam_name: "Non-Technical Popular Categories (NTPC)",
    authority_code: "RRB",
    conducting_authority: "Railway Recruitment Control Board",
    status: "APPLICATION_STARTED",
    exam_date: "2026-04-18T09:00:00Z",
    private_notes: "Need to upload updated OBC-NCL certificate and finalize payment before Feb 28.",
    reminders_active: true,
    created_at: "2026-02-18T09:10:00Z",
    updated_at: "2026-02-18T09:10:00Z"
  }
];

export const initialCountdowns: CountdownEvent[] = [
  {
    id: 1,
    title: "NEET UG 2026 Examination",
    exam_name: "National Eligibility cum Entrance Test (UG) 2026",
    authority_code: "NTA",
    event_type: "EXAM_DATE",
    target_date: "2026-05-03T14:00:00Z",
    official_source: "NTA Official Examination Calendar 2026",
    verification_status: "CONFIRMED_OFFICIAL",
    exam_slug: "neet-ug-2026",
    official_portal_url: "https://exams.nta.ac.in/NEET"
  },
  {
    id: 2,
    title: "UPSC CSE Prelims 2026",
    exam_name: "Civil Services (Preliminary) Examination 2026",
    authority_code: "UPSC",
    event_type: "EXAM_DATE",
    target_date: "2026-05-24T09:30:00Z",
    official_source: "UPSC Annual Calendar Gazette",
    verification_status: "CONFIRMED_OFFICIAL",
    exam_slug: "upsc-cse-2026",
    official_portal_url: "https://upsconline.nic.in"
  },
  {
    id: 3,
    title: "RRB NTPC Application Closing Deadline",
    exam_name: "RRB NTPC Graduate & Undergraduate CEN 01/2026",
    authority_code: "RRB",
    event_type: "APPLICATION_DEADLINE",
    target_date: "2026-02-28T23:59:00Z",
    official_source: "Railway Recruitment Control Board Central Notice",
    verification_status: "CONFIRMED_OFFICIAL",
    exam_slug: "rrb-ntpc-2026",
    official_portal_url: "https://www.rrbapply.gov.in"
  },
  {
    id: 4,
    title: "GATE 2026 Official Result Declaration",
    exam_name: "Graduate Aptitude Test in Engineering 2026",
    authority_code: "GATE",
    event_type: "RESULT_ANNOUNCEMENT",
    target_date: "2026-03-19T10:00:00Z",
    official_source: "IIT Roorkee GATE Organizing Committee Notice",
    verification_status: "CONFIRMED_OFFICIAL",
    result_status: "CONFIRMED_OFFICIAL",
    exam_slug: "gate-2026",
    official_portal_url: "https://gate2026.iitr.ac.in"
  },
  {
    id: 5,
    title: "JEE Main 2026 Session 2 Examination",
    exam_name: "Joint Entrance Examination (Main) 2026 Session 2",
    authority_code: "NTA",
    event_type: "EXAM_DATE",
    target_date: "2026-04-01T09:00:00Z",
    official_source: "NTA Examination Schedule 2026",
    verification_status: "CONFIRMED_OFFICIAL",
    exam_slug: "jee-main-2026",
    official_portal_url: "https://jeemain.nta.nic.in"
  },
  {
    id: 6,
    title: "TNPSC Group 4 Written Exam",
    exam_name: "Combined Civil Services Examination IV (Group 4)",
    authority_code: "TNPSC",
    event_type: "EXAM_DATE",
    target_date: "2026-06-07T09:30:00Z",
    official_source: "TNPSC Annual Planner 2026",
    verification_status: "CONFIRMED_OFFICIAL",
    exam_slug: "tnpsc-group-4-2026",
    official_portal_url: "https://www.tnpsc.gov.in"
  },
  {
    id: 7,
    title: "NEET UG 2026 Result Declaration",
    exam_name: "National Eligibility cum Entrance Test (UG) 2026",
    authority_code: "NTA",
    event_type: "RESULT_ANNOUNCEMENT",
    target_date: "2026-06-14T12:00:00Z",
    official_source: "NTA Information Bulletin Schedule",
    verification_status: "CONFIRMED_OFFICIAL",
    result_status: "CONFIRMED_OFFICIAL",
    exam_slug: "neet-ug-2026",
    official_portal_url: "https://exams.nta.ac.in/NEET"
  },
  {
    id: 8,
    title: "UPSC CSE Prelims 2026 Result (Expected)",
    exam_name: "Civil Services (Preliminary) Examination 2026",
    authority_code: "UPSC",
    event_type: "RESULT_ANNOUNCEMENT",
    target_date: "2026-06-25T14:00:00Z",
    official_source: "Tentative Commission Cycle Pattern",
    verification_status: "TENTATIVE",
    result_status: "EXPECTED_UNOFFICIAL",
    exam_slug: "upsc-cse-2026",
    official_portal_url: "https://upsc.gov.in"
  }
];
