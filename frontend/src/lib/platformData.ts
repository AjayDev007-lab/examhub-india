// ============================================================================
// EXAMHUB INDIA — COMPLETE PLATFORM DATA ENGINE
// Supports:
// 1. IT & Private Tech Jobs
// 2. College & University Previous Year Question Papers (All Degrees & Semesters)
// 3. School Learning (CBSE, State Boards, Classes 6-12, Notes, Videos & Quizzes)
// 4. AI Career Tools Evaluator
// 5. Unified Global Search Indexer
// ============================================================================

// ----------------------------------------------------------------------------
// 1. IT & PRIVATE JOBS INTERFACES & REPOSITORY
// ----------------------------------------------------------------------------

export interface ITJobItem {
  id: number;
  title: string;
  slug: string;
  company_name: string;
  company_logo_url: string;
  company_website: string;
  category: 
    | "SOFTWARE_DEV"
    | "WEB_DEV"
    | "FRONTEND"
    | "BACKEND"
    | "FULLSTACK"
    | "DATA_ANALYST"
    | "AI_ML"
    | "CYBERSECURITY"
    | "CLOUD_DEVOPS"
    | "UI_UX"
    | "IT_SUPPORT"
    | "INTERNSHIP";
  category_display: string;
  job_type: "FULL_TIME" | "INTERNSHIP" | "CONTRACT" | "PART_TIME";
  experience_level: "FRESHER" | "EXPERIENCED" | "INTERNSHIP";
  work_mode: "REMOTE" | "HYBRID" | "ON_SITE";
  location: string;
  salary_range: string;
  qualification: string;
  required_skills: string[];
  job_description: string;
  responsibilities: string[];
  official_apply_url: string;
  application_deadline: string;
  is_featured: boolean;
  view_count: number;
  apply_clicks_count: number;
  status: "PUBLISHED" | "CLOSED";
  published_at: string;
}

export const initialITJobs: ITJobItem[] = [
  {
    id: 101,
    title: "Junior Full Stack Developer (React & Node.js)",
    slug: "zoho-junior-full-stack-developer-2026",
    company_name: "Zoho Corporation",
    company_logo_url: "https://www.zohowebstatic.com/sites/zweb/images/zoho_general_pages/zoho-logo-web.png",
    company_website: "https://www.zoho.com/careers/",
    category: "FULLSTACK",
    category_display: "Full Stack Developer",
    job_type: "FULL_TIME",
    experience_level: "FRESHER",
    work_mode: "ON_SITE",
    location: "Chennai / Tenkasi / Salem, Tamil Nadu",
    salary_range: "₹5,50,000 - ₹8,50,000 P.A.",
    qualification: "B.E. / B.Tech / BCA / B.Sc / MCA / M.Sc (Any Graduate with good coding skills)",
    required_skills: ["JavaScript", "TypeScript", "React.js", "Node.js", "REST APIs", "SQL"],
    job_description: "Zoho is hiring passionate software engineers for product development teams across Chennai, Tenkasi, and Salem. You will design, develop, and maintain high-volume cloud applications powering millions of businesses worldwide.",
    responsibilities: [
      "Develop responsive and modern web interfaces using React.js and TypeScript.",
      "Design scalable server-side REST APIs using Node.js and Java.",
      "Write efficient database queries and optimize performance.",
      "Collaborate with product managers and UX designers to build intuitive customer workflows."
    ],
    official_apply_url: "https://www.zoho.com/careers/",
    application_deadline: "2026-12-31T23:59:00Z",
    is_featured: true,
    view_count: 14200,
    apply_clicks_count: 4210,
    status: "PUBLISHED",
    published_at: "2026-02-15T09:00:00Z"
  },
  {
    id: 102,
    title: "Graduate Software Engineer (Java & Cloud)",
    slug: "tcs-graduate-software-engineer-2026",
    company_name: "Tata Consultancy Services (TCS)",
    company_logo_url: "https://www.tcs.com/content/dam/global-tcs/en/images/home/tcs-logo-1.svg",
    company_website: "https://www.tcs.com/careers",
    category: "SOFTWARE_DEV",
    category_display: "Software Developer",
    job_type: "FULL_TIME",
    experience_level: "FRESHER",
    work_mode: "HYBRID",
    location: "Bengaluru / Hyderabad / Chennai / Pune",
    salary_range: "₹4,00,000 - ₹7,20,000 P.A. (Ninja / Digital / Prime)",
    qualification: "B.E. / B.Tech / M.E. / M.Tech / MCA (Batch 2025 & 2026)",
    required_skills: ["Java", "Spring Boot", "Data Structures", "Algorithms", "Git", "SQL"],
    job_description: "TCS National Qualifier Test (NQT) recruitment drive for Graduate Software Engineers. Build enterprise cloud platforms, banking microservices, and AI-enabled software systems.",
    responsibilities: [
      "Develop and test Java microservices using Spring Boot framework.",
      "Participate in agile sprints and code reviews.",
      "Implement automated unit and integration tests."
    ],
    official_apply_url: "https://nextstep.tcs.com/campus/",
    application_deadline: "2026-12-15T18:00:00Z",
    is_featured: true,
    view_count: 28900,
    apply_clicks_count: 8940,
    status: "PUBLISHED",
    published_at: "2026-02-10T08:30:00Z"
  },
  {
    id: 103,
    title: "Data Analyst & Business Intelligence Specialist",
    slug: "infosys-data-analyst-bi-specialist-2026",
    company_name: "Infosys",
    company_logo_url: "https://www.infosys.com/content/dam/infosys-web/en/global-resource/media-resources/infosys-logo-png.png",
    company_website: "https://www.infosys.com/careers.html",
    category: "DATA_ANALYST",
    category_display: "Data Analyst",
    job_type: "FULL_TIME",
    experience_level: "FRESHER",
    work_mode: "HYBRID",
    location: "Bengaluru / Chennai / Hyderabad / Mysuru",
    salary_range: "₹4,50,000 - ₹6,50,000 P.A.",
    qualification: "B.Sc (Maths/Stats/CS) / B.Com / B.E. / BCA / MBA (Analytics)",
    required_skills: ["Python", "SQL", "Power BI", "Tableau", "Excel", "Data Modeling"],
    job_description: "Extract insights from complex business datasets, create executive dashboards, and automate reporting pipelines for global banking and retail clients.",
    responsibilities: [
      "Query SQL data warehouses to extract and transform large-scale datasets.",
      "Build interactive visual dashboards using Power BI and Tableau.",
      "Perform exploratory data analysis using Python (Pandas, NumPy)."
    ],
    official_apply_url: "https://career.infosys.com/",
    application_deadline: "2026-12-20T23:59:00Z",
    is_featured: false,
    view_count: 9800,
    apply_clicks_count: 2450,
    status: "PUBLISHED",
    published_at: "2026-02-12T10:00:00Z"
  },
  {
    id: 104,
    title: "AI / Machine Learning Engineer (Python & PyTorch)",
    slug: "freshworks-ai-ml-engineer-2026",
    company_name: "Freshworks Inc.",
    company_logo_url: "https://assets.freshworks.com/static/brand-assets/freshworks-logo.png",
    company_website: "https://www.freshworks.com/company/careers/",
    category: "AI_ML",
    category_display: "Artificial Intelligence & ML",
    job_type: "FULL_TIME",
    experience_level: "EXPERIENCED",
    work_mode: "REMOTE",
    location: "Remote / Chennai, Tamil Nadu",
    salary_range: "₹12,00,000 - ₹20,00,000 P.A.",
    qualification: "B.E. / B.Tech / M.Tech in CS / AI / Data Science (1-3 yrs experience)",
    required_skills: ["Python", "PyTorch", "LLMs", "LangChain", "Vector Databases", "FastAPI"],
    job_description: "Build Freddy AI agents, generative AI summarization workflows, and customer engagement intelligence for Freshworks suite of SaaS products.",
    responsibilities: [
      "Fine-tune Large Language Models and build Retrieval-Augmented Generation (RAG) pipelines.",
      "Deploy low-latency AI inference endpoints using FastAPI and Docker on AWS.",
      "Implement model evaluation, safety guardrails, and latency optimization."
    ],
    official_apply_url: "https://www.freshworks.com/company/careers/",
    application_deadline: "2026-12-30T18:00:00Z",
    is_featured: true,
    view_count: 18400,
    apply_clicks_count: 5120,
    status: "PUBLISHED",
    published_at: "2026-02-18T11:00:00Z"
  },
  {
    id: 105,
    title: "Frontend Developer (Next.js & Tailwind CSS)",
    slug: "swiggy-frontend-engineer-nextjs-2026",
    company_name: "Swiggy",
    company_logo_url: "https://upload.wikimedia.org/wikipedia/en/thumb/1/12/Swiggy_logo.svg/1200px-Swiggy_logo.svg.png",
    company_website: "https://careers.swiggy.com/",
    category: "FRONTEND",
    category_display: "Frontend Developer",
    job_type: "FULL_TIME",
    experience_level: "FRESHER",
    work_mode: "HYBRID",
    location: "Bengaluru, Karnataka",
    salary_range: "₹8,00,000 - ₹14,00,000 P.A.",
    qualification: "Any Degree with strong JavaScript/React web portfolio",
    required_skills: ["React 19", "Next.js", "TypeScript", "Tailwind CSS", "Redux", "PWA"],
    job_description: "Craft high-performance consumer web applications serving over 50 million active users. Optimize Core Web Vitals, implement fluid animations, and support micro-frontend architectures.",
    responsibilities: [
      "Build pixel-perfect, accessible user interfaces using Next.js and Tailwind CSS.",
      "Optimize client-side bundle size, server-side rendering, and image delivery.",
      "Collaborate with mobile and backend engineers on real-time order tracking webviews."
    ],
    official_apply_url: "https://careers.swiggy.com/",
    application_deadline: "2026-12-25T18:00:00Z",
    is_featured: false,
    view_count: 11200,
    apply_clicks_count: 3670,
    status: "PUBLISHED",
    published_at: "2026-02-14T09:30:00Z"
  },
  {
    id: 106,
    title: "Software Engineering Intern (Summer 2026)",
    slug: "microsoft-india-software-engineering-intern-2026",
    company_name: "Microsoft India",
    company_logo_url: "https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31",
    company_website: "https://careers.microsoft.com/",
    category: "INTERNSHIP",
    category_display: "Internship",
    job_type: "INTERNSHIP",
    experience_level: "INTERNSHIP",
    work_mode: "HYBRID",
    location: "Hyderabad / Bengaluru / Noida",
    salary_range: "₹1,25,000 / Month Stipend + Accommodation",
    qualification: "Pre-final year B.Tech / B.E. / M.Tech / Dual Degree students (Graduating 2027)",
    required_skills: ["C++", "Java", "Python", "Data Structures", "Algorithms", "Problem Solving"],
    job_description: "Prestigious 2-month summer internship with Microsoft India Development Centers. Work on core Azure infrastructure, Office 365 services, and GitHub tools.",
    responsibilities: [
      "Solve real-world distributed systems problems with world-class engineering mentors.",
      "Present project demo to engineering leaders for Pre-Placement Offer (PPO) consideration."
    ],
    official_apply_url: "https://careers.microsoft.com/v2/global/en/home.html",
    application_deadline: "2026-12-10T23:59:00Z",
    is_featured: true,
    view_count: 34100,
    apply_clicks_count: 12400,
    status: "PUBLISHED",
    published_at: "2026-02-05T08:00:00Z"
  }
];

// ----------------------------------------------------------------------------
// 2. COLLEGE & UNIVERSITY QUESTION PAPERS INTERFACES & REPOSITORY
// ----------------------------------------------------------------------------

export interface UniversityItem {
  id: number;
  name: string;
  short_code: string;
  state: string;
  city: string;
  type: "STATE_GOVT" | "CENTRAL_GOVT" | "DEEMED" | "AUTONOMOUS";
  official_website: string;
  portal_url: string;
  logo_url: string;
  degrees_offered: string[];
  departments_count: number;
  papers_count: number;
}

export interface UniversityQuestionPaper {
  id: number;
  university_id: number;
  university_name: string;
  university_code: string;
  degree: string; // "B.E.", "B.Tech", "B.Sc", "B.Com", "BCA", "MBA", "MCA", etc.
  department: string; // "Computer Science and Engineering", "Commerce", etc.
  semester: number; // 1 to 8
  subject_name: string;
  subject_code: string;
  exam_year: number; // 2020 to 2025
  exam_session: "NOV_DEC" | "APR_MAY";
  exam_type: "REGULAR" | "SUPPLEMENTARY";
  regulation?: string; // "Regulation 2021", "Regulation 2017", etc.
  pdf_url: string;
  file_size_mb: number;
  download_count: number;
  description: string;
  uploaded_at: string;
}

export const initialUniversities: UniversityItem[] = [
  {
    id: 1,
    name: "Anna University",
    short_code: "ANNA_UNIV",
    state: "Tamil Nadu",
    city: "Chennai",
    type: "STATE_GOVT",
    official_website: "https://www.annauniv.edu",
    portal_url: "https://coe1.annauniv.edu",
    logo_url: "https://www.annauniv.edu/images/logo.png",
    degrees_offered: ["B.E.", "B.Tech.", "M.E.", "M.Tech.", "MBA", "MCA", "B.Arch."],
    departments_count: 34,
    papers_count: 420
  },
  {
    id: 2,
    name: "University of Madras",
    short_code: "UNIV_MADRAS",
    state: "Tamil Nadu",
    city: "Chennai",
    type: "STATE_GOVT",
    official_website: "https://www.unom.ac.in",
    portal_url: "https://egovernance.unom.ac.in",
    logo_url: "https://www.unom.ac.in/images/madras_logo.png",
    degrees_offered: ["B.Sc.", "B.Com.", "B.A.", "BCA", "BBA", "M.Sc.", "M.Com.", "M.A."],
    departments_count: 48,
    papers_count: 380
  },
  {
    id: 3,
    name: "Bharathiar University",
    short_code: "BHARATHIAR",
    state: "Tamil Nadu",
    city: "Coimbatore",
    type: "STATE_GOVT",
    official_website: "https://b-u.ac.in",
    portal_url: "https://b-u.ac.in/examinations",
    logo_url: "https://b-u.ac.in/sites/default/files/logo.png",
    degrees_offered: ["B.Sc.", "B.Com.", "B.A.", "BCA", "BBA", "MBA", "MCA"],
    departments_count: 38,
    papers_count: 260
  },
  {
    id: 4,
    name: "Bharathidasan University",
    short_code: "BHARATHIDASAN",
    state: "Tamil Nadu",
    city: "Tiruchirappalli",
    type: "STATE_GOVT",
    official_website: "https://www.bdu.ac.in",
    portal_url: "https://www.bdu.ac.in/examinations",
    logo_url: "https://www.bdu.ac.in/images/logo.png",
    degrees_offered: ["B.Sc.", "B.Com.", "B.A.", "BCA", "M.Sc.", "M.Com."],
    departments_count: 32,
    papers_count: 210
  },
  {
    id: 5,
    name: "Madurai Kamaraj University",
    short_code: "MKU",
    state: "Tamil Nadu",
    city: "Madurai",
    type: "STATE_GOVT",
    official_website: "https://mkuniversity.ac.in",
    portal_url: "https://mkuniversity.ac.in/exam/",
    logo_url: "https://mkuniversity.ac.in/images/mku_logo.png",
    degrees_offered: ["B.A.", "B.Sc.", "B.Com.", "BCA", "BBA", "M.A.", "M.Sc."],
    departments_count: 28,
    papers_count: 195
  },
  {
    id: 6,
    name: "Alagappa University",
    short_code: "ALAGAPPA",
    state: "Tamil Nadu",
    city: "Karaikudi",
    type: "STATE_GOVT",
    official_website: "https://alagappauniversity.ac.in",
    portal_url: "https://exam.alagappauniversity.ac.in",
    logo_url: "https://alagappauniversity.ac.in/images/logo.png",
    degrees_offered: ["B.Sc.", "B.Com.", "B.A.", "MBA", "MCA", "B.Ed."],
    departments_count: 26,
    papers_count: 175
  },
  {
    id: 7,
    name: "Manonmaniam Sundaranar University",
    short_code: "MSU",
    state: "Tamil Nadu",
    city: "Tirunelveli",
    type: "STATE_GOVT",
    official_website: "https://www.msuniv.ac.in",
    portal_url: "https://www.msuniv.ac.in/examinations",
    logo_url: "https://www.msuniv.ac.in/images/logo.png",
    degrees_offered: ["B.Sc.", "B.Com.", "B.A.", "BCA", "M.Sc.", "M.Com."],
    departments_count: 24,
    papers_count: 160
  },
  {
    id: 8,
    name: "Periyar University",
    short_code: "PERIYAR",
    state: "Tamil Nadu",
    city: "Salem",
    type: "STATE_GOVT",
    official_website: "https://www.periyaruniversity.ac.in",
    portal_url: "https://www.periyaruniversity.ac.in/coe.php",
    logo_url: "https://www.periyaruniversity.ac.in/images/logo.png",
    degrees_offered: ["B.Sc.", "B.Com.", "B.A.", "BCA", "BBA", "MBA", "MCA"],
    departments_count: 25,
    papers_count: 180
  },
  {
    id: 9,
    name: "University of Delhi",
    short_code: "DU",
    state: "Delhi",
    city: "New Delhi",
    type: "CENTRAL_GOVT",
    official_website: "https://www.du.ac.in",
    portal_url: "https://exam.du.ac.in",
    logo_url: "https://www.du.ac.in/logo.png",
    degrees_offered: ["B.A.", "B.Sc.", "B.Com.", "B.Tech.", "M.A.", "M.Sc.", "M.Com."],
    departments_count: 86,
    papers_count: 510
  },
  {
    id: 10,
    name: "Visvesvaraya Technological University",
    short_code: "VTU",
    state: "Karnataka",
    city: "Belagavi",
    type: "STATE_GOVT",
    official_website: "https://vtu.ac.in",
    portal_url: "https://results.vtu.ac.in",
    logo_url: "https://vtu.ac.in/images/logo.png",
    degrees_offered: ["B.E.", "B.Tech.", "M.Tech.", "MBA", "MCA"],
    departments_count: 42,
    papers_count: 460
  }
];

export const initialUniversityQuestionPapers: UniversityQuestionPaper[] = [
  {
    id: 201,
    university_id: 1,
    university_name: "Anna University",
    university_code: "ANNA_UNIV",
    degree: "B.E.",
    department: "Computer Science and Engineering",
    semester: 5,
    subject_name: "Computer Networks",
    subject_code: "CS8591",
    exam_year: 2025,
    exam_session: "NOV_DEC",
    exam_type: "REGULAR",
    regulation: "Regulation 2021",
    pdf_url: "https://archive.org/download/anna_univ_cs8591_2025/CS8591_NovDec2025.pdf",
    file_size_mb: 1.4,
    download_count: 1420,
    description: "Official Anna University End Semester Theory Question Paper. Covers OSI model, TCP/IP, Routing algorithms, and Transport layer.",
    uploaded_at: "2026-01-10T10:00:00Z"
  },
  {
    id: 202,
    university_id: 1,
    university_name: "Anna University",
    university_code: "ANNA_UNIV",
    degree: "B.E.",
    department: "Computer Science and Engineering",
    semester: 5,
    subject_name: "Theory of Computation",
    subject_code: "CS8501",
    exam_year: 2025,
    exam_session: "NOV_DEC",
    exam_type: "REGULAR",
    regulation: "Regulation 2021",
    pdf_url: "https://archive.org/download/anna_univ_cs8501_2025/CS8501_NovDec2025.pdf",
    file_size_mb: 1.8,
    download_count: 1650,
    description: "Finite Automata, Regular Expressions, Context-Free Grammars, Pushdown Automata, and Turing Machines.",
    uploaded_at: "2026-01-12T11:00:00Z"
  },
  {
    id: 203,
    university_id: 1,
    university_name: "Anna University",
    university_code: "ANNA_UNIV",
    degree: "B.E.",
    department: "Computer Science and Engineering",
    semester: 4,
    subject_name: "Design and Analysis of Algorithms",
    subject_code: "CS8451",
    exam_year: 2024,
    exam_session: "APR_MAY",
    exam_type: "REGULAR",
    regulation: "Regulation 2021",
    pdf_url: "https://archive.org/download/anna_univ_cs8451_2024/CS8451_AprMay2024.pdf",
    file_size_mb: 1.2,
    download_count: 2310,
    description: "Divide and Conquer, Dynamic Programming, Greedy Approach, Backtracking, and Branch and Bound.",
    uploaded_at: "2025-06-15T09:00:00Z"
  },
  {
    id: 204,
    university_id: 2,
    university_name: "University of Madras",
    university_code: "UNIV_MADRAS",
    degree: "B.Com.",
    department: "Commerce",
    semester: 3,
    subject_name: "Corporate Accounting",
    subject_code: "BCM301",
    exam_year: 2025,
    exam_session: "NOV_DEC",
    exam_type: "REGULAR",
    regulation: "CBCS Pattern",
    pdf_url: "https://archive.org/download/madras_univ_bcm301_2025/BCM301_NovDec2025.pdf",
    file_size_mb: 1.5,
    download_count: 1890,
    description: "Issue of shares, debentures, redemption of preference shares, company final accounts, and valuation of goodwill.",
    uploaded_at: "2026-01-15T14:00:00Z"
  },
  {
    id: 205,
    university_id: 2,
    university_name: "University of Madras",
    university_code: "UNIV_MADRAS",
    degree: "BCA",
    department: "Computer Applications",
    semester: 4,
    subject_name: "Database Management Systems",
    subject_code: "BCA402",
    exam_year: 2025,
    exam_session: "APR_MAY",
    exam_type: "REGULAR",
    regulation: "CBCS Pattern",
    pdf_url: "https://archive.org/download/madras_univ_bca402_2025/BCA402_AprMay2025.pdf",
    file_size_mb: 1.1,
    download_count: 1410,
    description: "Relational model, SQL queries, normalization, transactions, ACID properties, and indexing.",
    uploaded_at: "2025-06-20T10:00:00Z"
  },
  {
    id: 206,
    university_id: 3,
    university_name: "Bharathiar University",
    university_code: "BHARATHIAR",
    degree: "B.Sc.",
    department: "Computer Science",
    semester: 5,
    subject_name: "Python Programming & Applications",
    subject_code: "BSC504",
    exam_year: 2025,
    exam_session: "NOV_DEC",
    exam_type: "REGULAR",
    regulation: "Outcome Based Education (OBE)",
    pdf_url: "https://archive.org/download/bu_bsc504_2025/BSC504_NovDec2025.pdf",
    file_size_mb: 1.3,
    download_count: 980,
    description: "Control flow, OOP in Python, file I/O, NumPy, Pandas, and Tkinter GUI development.",
    uploaded_at: "2026-01-18T12:00:00Z"
  }
];

// ----------------------------------------------------------------------------
// 3. SCHOOL LEARNING SECTION INTERFACES & REPOSITORY
// ----------------------------------------------------------------------------

export interface SchoolChapterResource {
  id: string;
  board_code: string;
  board_name: string;
  class_level: string; // "6", "7", "8", "9", "10", "11", "12"
  subject: string;
  subject_code?: string;
  chapter_number: number;
  chapter_title: string;
  summary_notes: string;
  pdf_notes_url: string;
  video_lessons: {
    id: string;
    title: string;
    youtube_id: string;
    channel_name: string;
    duration: string;
    thumbnail_url: string;
    topic: string;
  }[];
  previous_exam_questions: {
    year: number;
    question: string;
    marks: number;
    answer: string;
  }[];
  important_questions: {
    id: string;
    marks: 2 | 3 | 5;
    question: string;
    key_points: string[];
  }[];
  practice_quiz: {
    id: number;
    question: string;
    options: string[];
    correct_option: number;
    explanation: string;
  }[];
}

export const initialSchoolChapters: SchoolChapterResource[] = [
  {
    id: "cbse-10-sci-ch12",
    board_code: "CBSE",
    board_name: "Central Board of Secondary Education",
    class_level: "10",
    subject: "Science",
    subject_code: "086",
    chapter_number: 12,
    chapter_title: "Electricity",
    summary_notes: `
# Chapter 12: Electricity (Class 10 Science)

### 1. Electric Current & Circuit
- **Electric Current ($I$):** The rate of flow of electric charges.
  $$I = \\frac{Q}{t}$$
- Unit: Ampere (A). $1\\text{ A} = 1\\text{ Coulomb} / 1\\text{ second}$.
- Measured by: **Ammeter** (always connected in series in a circuit).

### 2. Electric Potential & Potential Difference
- **Potential Difference ($V$):** Work done to move a unit charge from one point to another.
  $$V = \\frac{W}{Q}$$
- Unit: Volt (V). $1\\text{ V} = 1\\text{ Joule} / 1\\text{ Coulomb}$.
- Measured by: **Voltmeter** (always connected in parallel across the component).

### 3. Ohm's Law
- At constant temperature, current through a conductor is directly proportional to the potential difference across its ends:
  $$V = I \\times R$$
- **Resistance ($R$):** Property of a conductor to resist the flow of charges. Unit: Ohm ($\\Omega$).
- **Factors affecting resistance:**
  $$R = \\rho \\frac{l}{A}$$
  Where $\\rho$ is resistivity ($\\Omega\\cdot\\text{m}$), $l$ is length, and $A$ is cross-sectional area.

### 4. Resistors in Series and Parallel
- **Series:** $R_s = R_1 + R_2 + R_3$. Current remains the same, voltage divides.
- **Parallel:** $\\frac{1}{R_p} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}$. Voltage remains the same, current divides.

### 5. Heating Effect of Electric Current (Joule's Law)
- Heat produced:
  $$H = I^2 R t = V I t = \\frac{V^2}{R} t$$
- Electric Power: $P = V I = I^2 R = \\frac{V^2}{R}$. Unit: Watt (W). Commercial unit: $1\\text{ kWh} = 3.6 \\times 10^6\\text{ Joules}$.
`,
    pdf_notes_url: "https://ncert.nic.in/textbook/pdf/jesc112.pdf",
    video_lessons: [
      {
        id: "vid-cbse-10-elec-1",
        title: "Electricity Class 10 Full Chapter in One Shot | CBSE Physics",
        youtube_id: "dQw4w9WgXcQ",
        channel_name: "ExamHub Learning India",
        duration: "48:15",
        thumbnail_url: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        topic: "Complete Chapter Concept & Numerical Derivations"
      },
      {
        id: "vid-cbse-10-elec-2",
        title: "Ohm's Law & Resistance in Series/Parallel Combinations",
        youtube_id: "kJQP7kiw5Fk",
        channel_name: "CBSE Science Academy",
        duration: "24:30",
        thumbnail_url: "https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg",
        topic: "Circuit Numericals and Combination Problems"
      }
    ],
    previous_exam_questions: [
      {
        year: 2024,
        question: "State Joule's law of heating. Name two domestic electrical appliances based on this effect.",
        marks: 3,
        answer: "Joule's law states that heat generated in a resistor is directly proportional to: (1) square of current (I²), (2) resistance (R), and (3) time of flow (t): H = I²Rt. Domestic appliances: Electric iron, Electric toaster, Electric water heater."
      },
      {
        year: 2023,
        question: "Why are domestic electric circuits wired in parallel and not in series?",
        marks: 3,
        answer: "Parallel circuits ensure: (1) each appliance receives full supply voltage (220V), (2) if one appliance fails or is turned off, others remain functional, (3) each appliance operates on its own switch with appropriate current draw."
      }
    ],
    important_questions: [
      {
        id: "imp-10-elec-1",
        marks: 2,
        question: "Define 1 Ohm resistance and 1 Ampere current.",
        key_points: ["1 Ohm: Resistance of conductor when 1V produces 1A current", "1 Ampere: Flow of 1 Coulomb of charge per second"]
      },
      {
        id: "imp-10-elec-2",
        marks: 5,
        question: "Derive the expression for equivalent resistance of three resistors connected in parallel.",
        key_points: ["Total current I = I1 + I2 + I3", "By Ohm's Law: I1 = V/R1, I2 = V/R2, I3 = V/R3", "V/Rp = V(1/R1 + 1/R2 + 1/R3) => 1/Rp = 1/R1 + 1/R2 + 1/R3"]
      }
    ],
    practice_quiz: [
      {
        id: 1,
        question: "The commercial unit of electrical energy is:",
        options: ["Joule", "Kilowatt-hour (kWh)", "Watt", "Ampere-hour"],
        correct_option: 1,
        explanation: "1 kWh (Kilowatt-hour) is the standard commercial unit of electrical energy, equal to 3.6 × 10^6 Joules."
      },
      {
        id: 2,
        question: "If the length of a copper wire is doubled keeping its radius constant, its resistance will:",
        options: ["Remain unchanged", "Become half", "Become double", "Become four times"],
        correct_option: 2,
        explanation: "Since R is directly proportional to length (R = ρ l / A), doubling length doubles the resistance."
      },
      {
        id: 3,
        question: "Which instrument is always connected in parallel across a circuit component?",
        options: ["Ammeter", "Galvanometer", "Voltmeter", "Rheostat"],
        correct_option: 2,
        explanation: "A voltmeter has high resistance and must be connected in parallel to measure potential difference without drawing significant current."
      }
    ]
  },
  {
    id: "cbse-12-phy-ch03",
    board_code: "CBSE",
    board_name: "Central Board of Secondary Education",
    class_level: "12",
    subject: "Physics",
    subject_code: "042",
    chapter_number: 3,
    chapter_title: "Current Electricity",
    summary_notes: `
# Chapter 3: Current Electricity (Class 12 Physics)

### 1. Drift Velocity & Mobility
- **Drift Velocity ($v_d$):** Average velocity acquired by electrons in an applied electric field:
  $$v_d = -\\frac{e E \\tau}{m}$$
  Where $\\tau$ is relaxation time.
- Relation between current and drift velocity:
  $$I = n e A v_d$$
- **Mobility ($\\mu$):** Magnitude of drift velocity per unit electric field: $\\mu = \\frac{v_d}{E} = \\frac{e \\tau}{m}$.

### 2. Temperature Dependence of Resistivity
- For metals: Resistivity increases with temperature: $\\rho_T = \\rho_0 [1 + \\alpha (T - T_0)]$.
- For semiconductors: Resistivity decreases exponentially with temperature due to rapid increase in charge carrier density $n$.

### 3. Kirchhoff's Laws
- **Junction Rule (KCL):** $\\sum I = 0$ at any electrical junction (Conservation of Charge).
- **Loop Rule (KVL):** $\\sum \\Delta V = 0$ around any closed loop (Conservation of Energy).

### 4. Wheatstone Bridge & Meter Bridge
- Condition for balance: $\\frac{R_1}{R_2} = \\frac{R_3}{R_4}$ (No current through galvanometer).
- Used to measure unknown resistance accurately.
`,
    pdf_notes_url: "https://ncert.nic.in/textbook/pdf/leph103.pdf",
    video_lessons: [
      {
        id: "vid-cbse-12-curr-1",
        title: "Class 12 Physics Chapter 3 Current Electricity Full Chapter",
        youtube_id: "fJ9rUzIMcZQ",
        channel_name: "ExamHub MasterClass",
        duration: "1:15:30",
        thumbnail_url: "https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg",
        topic: "Drift Velocity, Kirchhoff's Laws & Potentiometer"
      }
    ],
    previous_exam_questions: [
      {
        year: 2024,
        question: "State Kirchhoff's rules. Using these rules, find the condition for a balanced Wheatstone bridge.",
        marks: 5,
        answer: "Kirchhoff's rules: Junction rule (Conservation of Charge) and Loop rule (Conservation of Energy). Using KVL in loops ABDA and BCDB with zero galvanometer current Ig=0 yields P/Q = R/S."
      }
    ],
    important_questions: [
      {
        id: "imp-12-curr-1",
        marks: 3,
        question: "Deduce Ohm's law from the concept of drift velocity of electrons.",
        key_points: ["Start with I = n e A vd", "Substitute vd = e E tau / m", "Substitute E = V / l", "Obtain V = I (m l / n e^2 tau A) where R = m l / n e^2 tau A"]
      }
    ],
    practice_quiz: [
      {
        id: 1,
        question: "Kirchhoff's junction rule is based on the conservation of:",
        options: ["Energy", "Momentum", "Charge", "Angular momentum"],
        correct_option: 2,
        explanation: "Kirchhoff's junction rule (KCL) is a direct consequence of the conservation of electric charge."
      }
    ]
  },
  {
    id: "tn-10-sci-ch01",
    board_code: "TNSB",
    board_name: "Tamil Nadu State Board",
    class_level: "10",
    subject: "Science",
    subject_code: "TN10SCI",
    chapter_number: 1,
    chapter_title: "Laws of Motion",
    summary_notes: `
# Chapter 1: Laws of Motion (Tamil Nadu Class 10 Science)

### 1. Force and Inertia
- **Inertia:** The inherent property of a body to resist any change in its state of rest or uniform motion.
  - Inertia of Rest
  - Inertia of Motion
  - Inertia of Direction

### 2. Linear Momentum
- Momentum ($p = m \\times v$). Vector quantity. Unit: $\\text{kg}\\cdot\\text{m/s}$.

### 3. Newton's Three Laws of Motion
- **First Law:** Every body continues in its state of rest or uniform motion unless acted upon by an external unbalanced force. Defines Force and Inertia.
- **Second Law:** Rate of change of linear momentum is directly proportional to external force applied:
  $$F = m \\times a$$
  Unit: Newton (N). $1\\text{ N} = 1\\text{ kg}\\cdot\\text{m/s}^2$.
- **Third Law:** For every action, there is an equal and opposite reaction ($F_A = -F_B$).

### 4. Conservation of Linear Momentum
- In the absence of an external force, total linear momentum of an isolated system remains constant:
  $$m_1 u_1 + m_2 u_2 = m_1 v_1 + m_2 v_2$$
- Rocket propulsion is based on Newton's Third Law and the Law of Conservation of Linear Momentum.
`,
    pdf_notes_url: "https://textbookcorp.tn.gov.in/pdf/10_Sci_EM.pdf",
    video_lessons: [
      {
        id: "vid-tn-10-motion-1",
        title: "10th Science Laws of Motion Complete Lesson | Tamil Nadu State Board",
        youtube_id: "9bZkp7q19f0",
        channel_name: "Tamil Nadu School Education TV",
        duration: "35:20",
        thumbnail_url: "https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg",
        topic: "Newton's Laws, Inertia & Rocket Propulsion"
      }
    ],
    previous_exam_questions: [
      {
        year: 2024,
        question: "State and prove the law of conservation of linear momentum with a neat diagram.",
        marks: 7,
        answer: "Proof: Let two bodies A and B of masses m1, m2 move with initial velocities u1, u2. During collision, force on B is F2 = m2(v2-u2)/t. Force on A is F1 = m1(v1-u1)/t. By Newton's Third Law F1 = -F2. Rearranging gives m1 u1 + m2 u2 = m1 v1 + m2 v2."
      }
    ],
    important_questions: [
      {
        id: "imp-tn-10-1",
        marks: 2,
        question: "Why does an athlete run a certain distance before taking a long jump?",
        key_points: ["Due to inertia of motion", "Acquires momentum that helps in leaping a longer distance"]
      }
    ],
    practice_quiz: [
      {
        id: 1,
        question: "The principle involved in rocket propulsion is:",
        options: ["Newton's First Law", "Newton's Second Law", "Law of Conservation of Linear Momentum", "Kepler's Law"],
        correct_option: 2,
        explanation: "Rocket propulsion is based on the law of conservation of linear momentum and Newton's Third Law of motion."
      }
    ]
  },
  {
    id: "cbse-10-math-ch01",
    board_code: "CBSE",
    board_name: "Central Board of Secondary Education",
    class_level: "10",
    subject: "Mathematics",
    subject_code: "041",
    chapter_number: 1,
    chapter_title: "Real Numbers",
    summary_notes: `
# Chapter 1: Real Numbers (Class 10 Mathematics)

### 1. Fundamental Theorem of Arithmetic
- Every composite number can be expressed (factorised) as a product of primes uniquely, apart from the order in which the prime factors occur.
- For any two positive integers $a$ and $b$:
  $$\\text{HCF}(a, b) \\times \\text{LCM}(a, b) = a \\times b$$
- Note: This formula holds true only for two numbers, not for three or more.

### 2. Revisiting Irrational Numbers
- A number $s$ is irrational if it cannot be written in the form $\\frac{p}{q}$, where $p$ and $q$ are integers and $q \\neq 0$.
- **Theorem:** Let $p$ be a prime number. If $p$ divides $a^2$, then $p$ divides $a$, where $a$ is a positive integer.
- Proof of irrationality of $\\sqrt{2}, \\sqrt{3}, \\sqrt{5}$ using the method of contradiction is a guaranteed board question.

### 3. Properties of Operations on Real Numbers
- The sum or difference of a rational and an irrational number is always **irrational**.
- The product and quotient of a non-zero rational and an irrational number is always **irrational**.
`,
    pdf_notes_url: "https://ncert.nic.in/textbook/pdf/jemh101.pdf",
    video_lessons: [
      {
        id: "vid-cbse-10-real-1",
        title: "Real Numbers Class 10 Full Chapter in One Shot | CBSE 2026",
        youtube_id: "YdK1Qz6e5wY",
        channel_name: "ExamHub Mathematics",
        duration: "52:10",
        thumbnail_url: "https://img.youtube.com/vi/YdK1Qz6e5wY/hqdefault.jpg",
        topic: "Prime Factorisation, HCF-LCM & Irrationality Proofs"
      }
    ],
    previous_exam_questions: [
      {
        year: 2024,
        question: "Prove that √5 is an irrational number.",
        marks: 3,
        answer: "Assume √5 is rational, i.e., √5 = a/b where a, b are co-prime integers. 5b² = a², so 5 divides a². Thus 5 divides a. Let a = 5c. 5b² = 25c² => b² = 5c², so 5 divides b. Hence 5 is a common factor of a and b, contradicting that a, b are co-prime. Therefore √5 is irrational."
      },
      {
        year: 2023,
        question: "Given that HCF(306, 657) = 9, find LCM(306, 657).",
        marks: 2,
        answer: "We know HCF × LCM = Product of numbers. 9 × LCM = 306 × 657. LCM = (306 × 657) / 9 = 34 × 657 = 22,338."
      }
    ],
    important_questions: [
      {
        id: "imp-10-math-1",
        marks: 3,
        question: "Explain why 7 × 11 × 13 + 13 and 7 × 6 × 5 × 4 × 3 × 2 × 1 + 5 are composite numbers.",
        key_points: ["7×11×13 + 13 = 13(77 + 1) = 13 × 78", "Has factors other than 1 and itself, therefore composite"]
      }
    ],
    practice_quiz: [
      {
        id: 1,
        question: "The product of a non-zero rational and an irrational number is always:",
        options: ["Rational", "Irrational", "Always an integer", "Zero"],
        correct_option: 1,
        explanation: "Multiplying any non-zero rational number with an irrational number always yields an irrational number."
      },
      {
        id: 2,
        question: "If HCF(a, b) = 12 and a × b = 1800, then LCM(a, b) is:",
        options: ["120", "150", "180", "1500"],
        correct_option: 1,
        explanation: "LCM = (a × b) / HCF = 1800 / 12 = 150."
      }
    ]
  },
  {
    id: "icse-10-chem-ch01",
    board_code: "ICSE",
    board_name: "Indian Certificate of Secondary Education",
    class_level: "10",
    subject: "Chemistry",
    subject_code: "52",
    chapter_number: 1,
    chapter_title: "Periodic Properties and Variations",
    summary_notes: `
# Chapter 1: Periodic Properties (ICSE Class 10 Chemistry)

### 1. Modern Periodic Law
- Physical and chemical properties of elements are periodic functions of their **atomic numbers**.
- Modern Periodic Table consists of 7 horizontal rows (**Periods**) and 18 vertical columns (**Groups**).

### 2. Trends in Periodic Properties
| Property | Across a Period (Left to Right) | Down a Group (Top to Bottom) |
|---|---|---|
| **Atomic Radius** | Decreases (Nuclear charge increases) | Increases (Number of shells increases) |
| **Ionisation Potential** | Increases | Decreases |
| **Electron Affinity** | Increases | Decreases |
| **Electronegativity** | Increases (Fluorine is highest: 4.0) | Decreases |
| **Metallic Character** | Decreases | Increases |
| **Non-metallic Character** | Increases | Decreases |

### 3. Key Definitions
- **Ionisation Potential (IP):** Energy required to remove an electron from the outermost shell of an isolated gaseous atom.
- **Electronegativity:** The tendency of an atom in a molecule to attract the shared pair of electrons towards itself.
`,
    pdf_notes_url: "https://cisce.org/wp-content/uploads/2023/11/ICSE-Chemistry-Class-10.pdf",
    video_lessons: [
      {
        id: "vid-icse-10-chem-1",
        title: "Periodic Table ICSE Class 10 Chemistry Full Chapter Revision",
        youtube_id: "k8Z_54o90rM",
        channel_name: "ICSE Simplified",
        duration: "40:15",
        thumbnail_url: "https://img.youtube.com/vi/k8Z_54o90rM/hqdefault.jpg",
        topic: "Ionisation Energy, Atomic Size & Electronegativity Trends"
      }
    ],
    previous_exam_questions: [
      {
        year: 2024,
        question: "Define Electron Affinity. How does it vary across a period from left to right?",
        marks: 3,
        answer: "Electron Affinity is the amount of energy released when an electron is added to an isolated neutral gaseous atom to form a uninegative ion. Across a period, nuclear charge increases and atomic size decreases, so electron affinity increases from left to right."
      }
    ],
    important_questions: [
      {
        id: "imp-icse-10-1",
        marks: 2,
        question: "Name the element having the highest electronegativity and the element having the highest electron affinity.",
        key_points: ["Highest electronegativity: Fluorine (F)", "Highest electron affinity: Chlorine (Cl)"]
      }
    ],
    practice_quiz: [
      {
        id: 1,
        question: "Which of the following elements has the highest electronegativity?",
        options: ["Chlorine", "Fluorine", "Oxygen", "Nitrogen"],
        correct_option: 1,
        explanation: "Fluorine has the highest electronegativity value (4.0 on Pauling scale) in the periodic table."
      }
    ]
  },
  {
    id: "karnataka-10-math-ch03",
    board_code: "KSEEB",
    board_name: "Karnataka School Examination and Assessment Board",
    class_level: "10",
    subject: "Mathematics",
    subject_code: "81E",
    chapter_number: 1,
    chapter_title: "Arithmetic Progressions",
    summary_notes: `
# Chapter 1: Arithmetic Progressions (Karnataka SSLC Maths)

### 1. General Form of an AP
- An Arithmetic Progression (AP) is a list of numbers in which each term is obtained by adding a fixed number $d$ (common difference) to the preceding term:
  $$a, a + d, a + 2d, a + 3d, \\dots$$
- Common difference $d = a_{k+1} - a_k$ (can be positive, negative, or zero).

### 2. $n$-th Term of an AP
$$a_n = a + (n - 1)d$$
Where $a$ is the first term, $d$ is common difference, and $n$ is number of terms.

### 3. Sum of First $n$ Terms of an AP
$$S_n = \\frac{n}{2} [2a + (n - 1)d] = \\frac{n}{2} [a + l]$$
Where $l = a_n$ is the last term.
- Sum of first $n$ positive integers: $S_n = \\frac{n(n + 1)}{2}$.
`,
    pdf_notes_url: "https://kseab.karnataka.gov.in/textbooks/sslc-maths.pdf",
    video_lessons: [
      {
        id: "vid-kar-10-ap-1",
        title: "SSLC Maths Arithmetic Progressions Full Chapter | Karnataka Board",
        youtube_id: "3V1G91jY7pQ",
        channel_name: "Karnataka SSLC Toppers",
        duration: "45:00",
        thumbnail_url: "https://img.youtube.com/vi/3V1G91jY7pQ/hqdefault.jpg",
        topic: "nth term formula and Sum of AP derivations"
      }
    ],
    previous_exam_questions: [
      {
        year: 2024,
        question: "Find the 20th term of the AP: 2, 7, 12, ...",
        marks: 2,
        answer: "Here a = 2, d = 7 - 2 = 5, n = 20. a20 = a + (n-1)d = 2 + (20-1)5 = 2 + 19(5) = 2 + 95 = 97."
      }
    ],
    important_questions: [
      {
        id: "imp-kar-10-1",
        marks: 3,
        question: "The sum of the 4th and 8th terms of an AP is 24 and the sum of the 6th and 10th terms is 44. Find the first three terms of the AP.",
        key_points: ["a4 + a8 = 2a + 10d = 24 => a + 5d = 12", "a6 + a10 = 2a + 14d = 44 => a + 7d = 22", "d = 5, a = -13. First three terms: -13, -8, -3"]
      }
    ],
    practice_quiz: [
      {
        id: 1,
        question: "The common difference of the AP: -5, -1, 3, 7, ... is:",
        options: ["-4", "4", "-6", "2"],
        correct_option: 1,
        explanation: "d = a2 - a1 = -1 - (-5) = -1 + 5 = 4."
      }
    ]
  }
];

// ----------------------------------------------------------------------------
// 4. AI CAREER TOOLS ENGINE & EVALUATION LOGIC
// ----------------------------------------------------------------------------

export interface EligibilityResult {
  status: "LIKELY_ELIGIBLE" | "NEEDS_VERIFICATION" | "LIKELY_NOT_ELIGIBLE";
  matchPercentage: number;
  reason: string;
  details: {
    qualificationMatch: boolean;
    ageMatch: boolean;
    skillsMatch: string[];
    missingSkills: string[];
  };
  recommendations: string[];
}

export function evaluateJobEligibility(
  userProfile: {
    education: string;
    graduationYear?: number;
    age?: number;
    skills: string[];
  },
  job: {
    title: string;
    qualification: string;
    age_limit?: string;
    required_skills?: string | string[];
  }
): EligibilityResult {
  const userEdu = userProfile.education.toLowerCase();
  const jobQual = job.qualification.toLowerCase();

  // 1. Qualification matching
  let qualMatch = false;
  if (
    jobQual.includes("any graduate") ||
    (userEdu.includes("b.e") || userEdu.includes("b.tech")) && (jobQual.includes("b.e") || jobQual.includes("b.tech") || jobQual.includes("engineering") || jobQual.includes("graduate")) ||
    (userEdu.includes("bca") || userEdu.includes("b.sc")) && (jobQual.includes("bca") || jobQual.includes("b.sc") || jobQual.includes("graduate")) ||
    (userEdu.includes("10th") || userEdu.includes("12th")) && (jobQual.includes("10th") || jobQual.includes("matriculation") || jobQual.includes("12th") || jobQual.includes("higher secondary"))
  ) {
    qualMatch = true;
  }

  // 2. Age evaluation
  let ageMatch = true;
  if (userProfile.age && job.age_limit) {
    const numbers = job.age_limit.match(/\d+/g)?.map(Number) || [];
    if (numbers.length >= 2) {
      const minAge = numbers[0];
      const maxAge = numbers[1];
      if (userProfile.age < minAge || userProfile.age > maxAge + 3) {
        ageMatch = false;
      }
    }
  }

  // 3. Skills matching
  const jobSkillsList = Array.isArray(job.required_skills)
    ? job.required_skills
    : typeof job.required_skills === "string"
    ? job.required_skills.split(",").map(s => s.trim())
    : [];

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of jobSkillsList) {
    const isMatched = userProfile.skills.some(
      us => us.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(us.toLowerCase())
    );
    if (isMatched) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  // Calculate score
  let score = 0;
  if (qualMatch) score += 50;
  if (ageMatch) score += 20;
  const skillRatio = jobSkillsList.length > 0 ? (matchedSkills.length / jobSkillsList.length) * 30 : 30;
  score += Math.round(skillRatio);

  let status: "LIKELY_ELIGIBLE" | "NEEDS_VERIFICATION" | "LIKELY_NOT_ELIGIBLE" = "NEEDS_VERIFICATION";
  let reason = "Your qualifications partially match. Please verify official notification PDF.";

  if (score >= 75 && qualMatch && ageMatch) {
    status = "LIKELY_ELIGIBLE";
    reason = "Strong match! Your educational qualifications, age range, and core competencies satisfy the primary criteria.";
  } else if (!qualMatch || !ageMatch) {
    status = "LIKELY_NOT_ELIGIBLE";
    reason = !qualMatch 
      ? `Required education "${job.qualification}" does not closely match your profile.`
      : `Your age (${userProfile.age}) falls outside the primary prescribed age bracket (${job.age_limit}).`;
  }

  return {
    status,
    matchPercentage: score,
    reason,
    details: {
      qualificationMatch: qualMatch,
      ageMatch,
      skillsMatch: matchedSkills,
      missingSkills
    },
    recommendations: [
      "Always read the official notification PDF before submitting payment.",
      "Check applicable category relaxations (OBC: 3 years, SC/ST: 5 years, PwBD: 10 years).",
      missingSkills.length > 0 ? `Consider learning: ${missingSkills.slice(0, 3).join(", ")}` : "Profile is competitive for this role."
    ]
  };
}

// ----------------------------------------------------------------------------
// 5. UNIFIED GLOBAL SEARCH ENGINE
// ----------------------------------------------------------------------------

export interface GlobalSearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: "GOVT_JOB" | "IT_JOB" | "UNIVERSITY_PAPER" | "SCHOOL_CHAPTER" | "SCHOOL_BOOK" | "VIDEO_LESSON";
  category_label: string;
  url: string;
  meta: string;
}

export function searchAllPlatform(query: string, categoryFilter?: string): GlobalSearchResultItem[] {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();

  const results: GlobalSearchResultItem[] = [];

  // 1. Search IT Jobs
  if (!categoryFilter || categoryFilter === "ALL" || categoryFilter === "IT_JOB") {
    for (const job of initialITJobs) {
      if (
        job.title.toLowerCase().includes(q) ||
        job.company_name.toLowerCase().includes(q) ||
        job.required_skills.some(s => s.toLowerCase().includes(q)) ||
        job.location.toLowerCase().includes(q)
      ) {
        results.push({
          id: `it-${job.id}`,
          title: job.title,
          subtitle: `${job.company_name} • ${job.location}`,
          category: "IT_JOB",
          category_label: "IT & Private Job",
          url: `/jobs/it?id=${job.id}`,
          meta: job.salary_range
        });
      }
    }
  }

  // 2. Search Universities & Question Papers
  if (!categoryFilter || categoryFilter === "ALL" || categoryFilter === "UNIVERSITY_PAPER") {
    for (const univ of initialUniversities) {
      if (univ.name.toLowerCase().includes(q) || univ.city.toLowerCase().includes(q) || univ.short_code.toLowerCase().includes(q)) {
        results.push({
          id: `univ-${univ.id}`,
          title: univ.name,
          subtitle: `${univ.city}, ${univ.state} • ${univ.papers_count} Papers Available`,
          category: "UNIVERSITY_PAPER",
          category_label: "College & University",
          url: `/university?university_id=${univ.id}`,
          meta: `${univ.degrees_offered.slice(0, 3).join(", ")}`
        });
      }
    }

    for (const paper of initialUniversityQuestionPapers) {
      if (
        paper.subject_name.toLowerCase().includes(q) ||
        paper.subject_code.toLowerCase().includes(q) ||
        paper.department.toLowerCase().includes(q) ||
        paper.university_name.toLowerCase().includes(q)
      ) {
        results.push({
          id: `paper-${paper.id}`,
          title: `${paper.subject_name} (${paper.subject_code})`,
          subtitle: `${paper.university_name} • ${paper.degree} Sem ${paper.semester}`,
          category: "UNIVERSITY_PAPER",
          category_label: "University Question Paper",
          url: `/university?paper_id=${paper.id}`,
          meta: `${paper.exam_year} ${paper.exam_session}`
        });
      }
    }
  }

  // 3. Search School Learning Resources & Chapters
  if (!categoryFilter || categoryFilter === "ALL" || categoryFilter === "SCHOOL_CHAPTER") {
    for (const chapter of initialSchoolChapters) {
      if (
        chapter.chapter_title.toLowerCase().includes(q) ||
        chapter.subject.toLowerCase().includes(q) ||
        chapter.board_code.toLowerCase().includes(q) ||
        `class ${chapter.class_level}`.includes(q) ||
        `${chapter.class_level}th`.includes(q)
      ) {
        results.push({
          id: `school-${chapter.id}`,
          title: `Class ${chapter.class_level} ${chapter.subject}: ${chapter.chapter_title}`,
          subtitle: `${chapter.board_name} • Chapter ${chapter.chapter_number}`,
          category: "SCHOOL_CHAPTER",
          category_label: "School Chapter & Notes",
          url: `/school/chapter/${chapter.id}`,
          meta: `${chapter.video_lessons.length} Videos • Practice Quiz`
        });
      }
    }
  }

  return results.slice(0, 20);
}
