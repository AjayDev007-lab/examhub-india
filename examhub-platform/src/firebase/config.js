/**
 * Firebase Architecture & Resilient Local State Fallback Engine
 * EXAMHUB INDIA — Production Ready Firebase Integration
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Read environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Check if valid Firebase configuration is present
export const isConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "your-api-key" &&
  firebaseConfig.projectId
);

export const isDemoMode = !isConfigured;

let appInstance = null;
let authInstance = null;
let dbInstance = null;
let storageInstance = null;

if (isConfigured) {
  try {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
    storageInstance = getStorage(appInstance);
  } catch (err) {
    console.warn("Firebase initialization failed, falling back to local persistent store:", err);
  }
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;
export const googleProvider = isConfigured ? new GoogleAuthProvider() : null;

// =========================================================================
// HIGH-FIDELITY PERSISTENT FALLBACK ENGINE FOR DEMO / OFFLINE OPERATION
// =========================================================================

const SEED_STUDENTS = [
  {
    uid: "std_001",
    studentId: "EH-2026-90412",
    fullName: "Aditya Sharma",
    email: "student@examhub.in",
    phone: "+91 98765 43210",
    dob: "2006-08-14",
    gender: "Male",
    state: "Maharashtra",
    district: "Pune",
    college: "Fergusson College, Autonomous Pune",
    course: "B.Tech Computer Science & AI",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256",
    role: "student",
    createdAt: "2026-01-10T09:30:00.000Z",
    isActive: true,
    emailVerified: true
  },
  {
    uid: "std_002",
    studentId: "EH-2026-88102",
    fullName: "Priya Sundaram",
    email: "priya.s@examhub.in",
    phone: "+91 98410 29384",
    dob: "2007-03-22",
    gender: "Female",
    state: "Tamil Nadu",
    district: "Chennai",
    college: "Anna University Campus",
    course: "B.Sc Biotechnology",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
    role: "student",
    createdAt: "2026-01-15T10:15:00.000Z",
    isActive: true,
    emailVerified: true
  }
];

const SEED_ADMIN = {
  uid: "adm_001",
  fullName: "ExamHub Super Administrator",
  email: "ajaydevvs22102004@gmail.com",
  phone: "+91 91234 56789",
  role: "admin",
  isSuperAdmin: true,
  createdAt: "2026-01-01T00:00:00.000Z"
};

const SEED_EXAMS = [
  {
    id: "exam_01",
    name: "National Eligibility cum Entrance Test (NEET UG) 2026",
    code: "NEET-UG-2026",
    category: "Medical Entrance",
    date: "2026-05-03",
    registrationDeadline: "2026-03-20",
    duration: "200 Minutes (3 hrs 20 mins)",
    eligibility: "10+2 with Physics, Chemistry, Biology with minimum 50% aggregate",
    status: "Upcoming",
    authority: "National Testing Agency (NTA)",
    fee: "INR 1,700",
    totalSeats: "1,08,915 MBBS / BDS Seats",
    instructions: "Admit card mandatory with passport size photograph and original Aadhaar card.",
    featured: true
  },
  {
    id: "exam_02",
    name: "Joint Entrance Examination (JEE Main) Session 2",
    code: "JEE-MAIN-2026-S2",
    category: "Engineering Entrance",
    date: "2026-04-08",
    registrationDeadline: "2026-03-12",
    duration: "180 Minutes",
    eligibility: "Class 12 pass or appearing with Mathematics & Physics",
    status: "Registration Open",
    authority: "National Testing Agency (NTA)",
    fee: "INR 1,000",
    totalSeats: "57,000 NIT/IIIT Seats",
    instructions: "Computer Based Test (CBT). Reporting time 90 minutes before examination.",
    featured: true
  },
  {
    id: "exam_03",
    name: "UPSC Civil Services (Preliminary) Examination 2026",
    code: "UPSC-CSE-PRE-2026",
    category: "Civil Services",
    date: "2026-05-24",
    registrationDeadline: "2026-02-28",
    duration: "4 Hours (2 Sessions)",
    eligibility: "Graduate degree from any recognized Indian University",
    status: "Upcoming",
    authority: "Union Public Service Commission",
    fee: "INR 100 (Exempt for Women/SC/ST)",
    totalSeats: "1,056 Posts (IAS/IPS/IFS)",
    instructions: "Black ballpoint pen only. Negative marking applicable (1/3rd penalty).",
    featured: true
  },
  {
    id: "exam_04",
    name: "Railway Recruitment Board (RRB) Group D CEN 08/2025",
    code: "RRB-GROUP-D-2026",
    category: "Railways Recruitment",
    date: "2026-03-15",
    registrationDeadline: "2026-01-31",
    duration: "90 Minutes",
    eligibility: "10th pass or ITI from NCVT/SCVT recognized institute",
    status: "Registration Closed",
    authority: "Railway Recruitment Control Board",
    fee: "INR 500",
    totalSeats: "32,450 Posts",
    instructions: "Biometric Aadhaar authentication at entry gate. Carry 2 passport photos.",
    featured: false
  },
  {
    id: "exam_05",
    name: "Staff Selection Commission (SSC CGL) Tier-I 2025",
    code: "SSC-CGL-2025",
    category: "Central Recruitment",
    date: "2025-11-20",
    registrationDeadline: "2025-08-30",
    duration: "60 Minutes",
    eligibility: "Bachelor's Degree in any discipline",
    status: "Completed",
    authority: "Staff Selection Commission",
    fee: "INR 100",
    totalSeats: "17,727 Posts",
    instructions: "Examination completed successfully across 128 nationwide testing centers.",
    featured: false
  }
];

const SEED_HALL_TICKETS = [
  {
    id: "ht_001",
    examId: "exam_01",
    examName: "National Eligibility cum Entrance Test (NEET UG) 2026",
    examCode: "NEET-UG-2026",
    studentId: "std_001",
    studentUid: "std_001",
    studentName: "ADITYA SHARMA",
    rollNumber: "2604108821",
    registrationNumber: "NEET260098412",
    examDate: "Sunday, May 03, 2026",
    examTime: "02:00 PM to 05:20 PM IST",
    reportingTime: "12:30 PM",
    gateClosingTime: "01:30 PM",
    centreName: "Kendriya Vidyalaya No. 1, AFS Campus",
    centreCode: "MH-PUN-084",
    centreAddress: "Viman Nagar Road, Lohegaon, Pune, Maharashtra — 411014",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256",
    barcodeValue: "EH2604108821NEETUG",
    instructions: [
      "Candidate must bring this original printed Hall Ticket with a valid Government Photo ID (Aadhaar / Voter ID / Passport).",
      "One passport size photograph must be pasted in the designated box in presence of the invigilator.",
      "Electronic devices, smartwatches, calculators, and rough sheets are strictly prohibited inside the hall.",
      "Report strictly before Gate Closing Time (01:30 PM). No candidate shall be permitted after gate closure."
    ]
  },
  {
    id: "ht_002",
    examId: "exam_02",
    examName: "Joint Entrance Examination (JEE Main) Session 2",
    examCode: "JEE-MAIN-2026-S2",
    studentId: "std_001",
    studentUid: "std_001",
    studentName: "ADITYA SHARMA",
    rollNumber: "2602104590",
    registrationNumber: "JEE260144921",
    examDate: "Wednesday, April 08, 2026",
    examTime: "09:00 AM to 12:00 PM IST",
    reportingTime: "07:30 AM",
    gateClosingTime: "08:30 AM",
    centreName: "iON Digital Zone iDZ 1, Ramwadi",
    centreCode: "MH-PUN-019",
    centreAddress: "Survey No. 45/2, Nagar Road, Ramwadi, Pune, Maharashtra — 411014",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256",
    barcodeValue: "EH2602104590JEEMAIN",
    instructions: [
      "Bring printed copy of Admit Card downloaded from ExamHub India or NTA portal.",
      "Carry transparent ballpoint pen and original Aadhaar card.",
      "Rough sheets will be provided in the test lab and must be dropped in the drop box before exiting."
    ]
  }
];

const SEED_RESULTS = [
  {
    id: "res_001",
    examId: "exam_05",
    examName: "Staff Selection Commission (SSC CGL) Tier-I 2025",
    studentId: "std_001",
    studentUid: "std_001",
    studentName: "ADITYA SHARMA",
    rollNumber: "2604108821",
    registrationNumber: "RID-2604108821",
    marksObtained: 172.5,
    maxMarks: 200.0,
    percentage: 86.25,
    grade: "DISTINCTION",
    percentile: "98.84 Percentile",
    rank: "AIR 142",
    status: "PASS",
    qualifyingStatus: "QUALIFIED FOR TIER-II",
    subjectMarks: [
      { subject: "General Intelligence & Reasoning", obtained: 46.5, max: 50 },
      { subject: "General Awareness & Current Affairs", obtained: 38.0, max: 50 },
      { subject: "Quantitative Aptitude (Mathematics)", obtained: 48.0, max: 50 },
      { subject: "English Comprehension", obtained: 40.0, max: 50 }
    ],
    publishedDate: "2026-01-28",
    isPublished: true,
    authority: "Staff Selection Commission",
    officialPortal: "https://ssc.gov.in"
  },
  {
    id: "res_002",
    examId: "exam_04",
    examName: "Railway Recruitment Board (RRB) Group D CEN 08/2025",
    studentId: "std_002",
    studentUid: "std_002",
    studentName: "PRIYA SUNDARAM",
    rollNumber: "2608103342",
    registrationNumber: "RID-2608103342",
    marksObtained: 84.0,
    maxMarks: 100.0,
    percentage: 84.0,
    grade: "EXCELLENT",
    percentile: "96.42 Percentile",
    rank: "AIR 890",
    status: "PASS",
    qualifyingStatus: "SHORTLISTED FOR PET",
    subjectMarks: [
      { subject: "General Science", obtained: 22.0, max: 25 },
      { subject: "Mathematics", obtained: 21.5, max: 25 },
      { subject: "General Intelligence & Reasoning", obtained: 26.5, max: 30 },
      { subject: "General Awareness & Current Affairs", obtained: 14.0, max: 20 }
    ],
    publishedDate: "2026-02-14",
    isPublished: true,
    authority: "Railway Recruitment Board",
    officialPortal: "https://indianrailways.gov.in"
  }
];

const SEED_NOTIFICATIONS = [
  {
    id: "notif_001",
    title: "NEET UG 2026 Official Hall Tickets Released",
    category: "Hall Tickets",
    date: "Today, 11:30 AM",
    timestamp: Date.now() - 3600000,
    content: "National Testing Agency has issued the computer-verified Hall Tickets for NEET UG 2026. Students can download directly from their student dashboard.",
    link: "hall-tickets",
    priority: "HIGH",
    unread: true
  },
  {
    id: "notif_002",
    title: "SSC CGL Tier-I 2025 Final Normalized Scores Published",
    category: "Results",
    date: "Yesterday, 04:45 PM",
    timestamp: Date.now() - 86400000,
    content: "Official normalized marks and Tier-II qualified candidate rosters are now available for verification in the Results portal.",
    link: "results",
    priority: "NORMAL",
    unread: true
  },
  {
    id: "notif_003",
    title: "JEE Main 2026 Session 2 Registration Window Extended",
    category: "Exams",
    date: "2 days ago",
    timestamp: Date.now() - 172800000,
    content: "NTA has extended the candidate registration and online fee payment deadline for JEE Main 2026 Session 2 until March 12, 2026.",
    link: "exams",
    priority: "NORMAL",
    unread: false
  },
  {
    id: "notif_004",
    title: "UPSC Civil Services 2026 Notification & Syllabus Released",
    category: "Important Notices",
    date: "Feb 18, 2026",
    timestamp: Date.now() - 345600000,
    content: "Official gazette publication for 1,056 CSE vacancies with detailed examination guidelines and stage-wise schedule.",
    link: "exams",
    priority: "NORMAL",
    unread: false
  }
];

// Helper to initialize and retrieve reactive store from localStorage
function getLocalCollection(key, defaultData) {
  if (typeof window === "undefined") return defaultData;
  const stored = localStorage.getItem(`examhub_${key}`);
  if (!stored) {
    localStorage.setItem(`examhub_${key}`, JSON.stringify(defaultData));
    return defaultData;
  }
  try {
    return JSON.parse(stored);
  } catch (_) {
    return defaultData;
  }
}

function saveLocalCollection(key, data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`examhub_${key}`, JSON.stringify(data));
  // Dispatch custom storage event for in-tab reactive syncing
  window.dispatchEvent(new CustomEvent(`examhub_store_${key}`, { detail: data }));
}

// Exportable Local Store API
export const localStore = {
  getStudents: () => getLocalCollection("students", SEED_STUDENTS),
  saveStudents: (data) => saveLocalCollection("students", data),

  getAdmin: () => getLocalCollection("admin", SEED_ADMIN),
  saveAdmin: (data) => saveLocalCollection("admin", data),

  getExams: () => getLocalCollection("exams", SEED_EXAMS),
  saveExams: (data) => saveLocalCollection("exams", data),

  getHallTickets: () => getLocalCollection("hallTickets", SEED_HALL_TICKETS),
  saveHallTickets: (data) => saveLocalCollection("hallTickets", data),

  getResults: () => getLocalCollection("results", SEED_RESULTS),
  saveResults: (data) => saveLocalCollection("results", data),

  getNotifications: () => getLocalCollection("notifications", SEED_NOTIFICATIONS),
  saveNotifications: (data) => saveLocalCollection("notifications", data),

  getRegistrations: () => getLocalCollection("registrations", []),
  saveRegistrations: (data) => saveLocalCollection("registrations", data)
};
