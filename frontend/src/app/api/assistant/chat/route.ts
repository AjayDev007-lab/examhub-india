import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/data";

interface Citation {
  title: string;
  url: string;
  source: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const q = message.toLowerCase().trim();
    let reply = "";
    const citations: Citation[] = [];

    // Query analysis & verified source matching
    if (q.includes("upsc") || q.includes("civil service") || q.includes("ias") || q.includes("ips")) {
      reply = `**UPSC Civil Services Examination (CSE) Overview & Verified Eligibility:**

• **Minimum Qualification:** Bachelor's degree in any discipline from a recognized central, state, or deemed university.
• **Age Eligibility:** 21 to 32 years (as of August 1 of the examination year) with standard reservation relaxations for OBC, SC, ST, and PwD.
• **Stages of Examination:**
  1. **Preliminary Examination:** Objective Multiple Choice Questions (General Studies Paper I & CSAT Paper II).
  2. **Main Examination:** Written descriptive papers (9 papers including qualifying language papers, essay, and optional subjects).
  3. **Personality Test (Interview):** Conducted at Dholpur House, New Delhi.
• **Application Method:** Candidates must complete One Time Registration (OTR) on the official UPSC online portal before submitting the examination form.`;
      citations.push(
        { title: "Union Public Service Commission Official Portal", url: "https://upsc.gov.in/", source: "NIC / UPSC Gazette" },
        { title: "UPSC Online Application & OTR System", url: "https://upsconline.nic.in/", source: "UPSC / DoPT" }
      );
    } else if (q.includes("neet") || q.includes("medical") || q.includes("mbbs")) {
      reply = `**NEET (UG) National Eligibility cum Entrance Test:**

• **Eligibility:** Passed Class 12 (or equivalent) with Physics, Chemistry, Biology/Biotechnology, and English as core subjects.
• **Minimum Age:** Candidate must be at least 17 years old by December 31 of the admission year.
• **Scope:** Single mandatory national entrance test for admission to undergraduate medical (MBBS), dental (BDS), AYUSH (BAMS, BHMS, BUMS), and Veterinary seats across all government and private institutions in India, including AIIMS and JIPMER.
• **Conducting Body:** National Testing Agency (NTA). Counselling is administered by MCC (15% All India Quota) and respective State Medical Admission Authorities.`;
      citations.push(
        { title: "NEET (UG) Official Examination Portal", url: "https://neet.nta.nic.in/", source: "National Testing Agency (NTA)" },
        { title: "Medical Counselling Committee (MCC)", url: "https://mcc.nic.in/", source: "DGHS / MoHFW" }
      );
    } else if (q.includes("jee") || q.includes("engineering") || q.includes("iit") || q.includes("nit")) {
      reply = `**JEE (Main) & JEE (Advanced) Engineering Admissions:**

• **JEE (Main):**
  - Conducted by the National Testing Agency (NTA) in multiple sessions per academic year.
  - Used for B.Tech/B.E. admissions at NITs, IIITs, CFTIs, and serves as the screening gateway for JEE (Advanced).
  - Subjects required in Class 12: Physics, Mathematics, and one of Chemistry/Biology/Technical Vocational.
• **JEE (Advanced):**
  - Conducted on rotation by one of the premier Indian Institutes of Technology (IITs).
  - Top 250,000 qualifiers from JEE (Main) are eligible to register.
• **Seat Allocation:** Centralized Joint Seat Allocation Authority (JoSAA) manages online counseling and seat allotment across IITs, NITs, and IIEST.`;
      citations.push(
        { title: "JEE (Main) NTA Examination Portal", url: "https://jeemain.nta.nic.in/", source: "National Testing Agency" },
        { title: "JoSAA Joint Seat Allocation Portal", url: "https://josaa.nic.in/", source: "Ministry of Education" }
      );
    } else if (q.includes("scholarship") || q.includes("nsp") || q.includes("grant")) {
      reply = `**National Scholarship Portal (NSP) & Central Schemes:**

• **Unified Application:** Government of India provides a single-window portal (NSP) for Central Sector Scheme of Scholarships for College and University Students, Pre-Matric and Post-Matric schemes, and minority fellowships.
• **Verification Process:** Three-tier verification: Institution Level (Nodal Officer), District Nodal Officer (DNO), and State/Ministry Department.
• **Disbursement:** Scholarships are directly transferred to the student's Aadhaar-seeded bank account via Direct Benefit Transfer (DBT).`;
      citations.push(
        { title: "National Scholarship Portal Official Registry", url: "https://scholarships.gov.in/", source: "National Informatics Centre (NIC)" },
        { title: "Ministry of Education Scholarships", url: "https://www.education.gov.in/", source: "Govt of India" }
      );
    } else if (q.includes("ssc") || q.includes("cgl") || q.includes("chsl")) {
      reply = `**Staff Selection Commission (SSC) Examinations:**

• **SSC CGL (Combined Graduate Level):** Recruitment to Group B and Group C posts in central ministries, departments, and attached offices (e.g., Assistant Section Officer, Inspector of Income Tax, Central Excise Inspector). Minimum qualification: Bachelor's degree.
• **SSC CHSL (Combined Higher Secondary Level):** Recruitment for Lower Division Clerk (LDC), Junior Secretariat Assistant (JSA), and Data Entry Operators (DEO). Minimum qualification: Class 12 pass.
• **Portal Note:** All applications are now hosted on the upgraded official portal (<code class="font-mono">https://ssc.gov.in/</code>) requiring candidate One Time Registration.`;
      citations.push(
        { title: "Staff Selection Commission Official Portal", url: "https://ssc.gov.in/", source: "DoPT / Government of India" }
      );
    } else {
      // General database lookup
      const matches = (dbStore?.officialWebsites || []).filter((w) => {
        const inName = w.name.toLowerCase().includes(q);
        const inCode = w.code?.toLowerCase().includes(q);
        const inExams = w.related_examinations?.some((e) => e.toLowerCase().includes(q));
        return inName || inCode || inExams;
      });

      if (matches.length > 0) {
        const top = matches.slice(0, 3);
        reply = `Found official authorities matching your query in the verified registry:\n\n` +
          top.map((m) => `• **${m.name} (${m.code || m.domain}):** ${m.description}\n  *Key Services:* ${m.related_examinations?.join(", ") || "Examinations & Citizen Services"}`).join("\n\n") +
          `\n\nAlways verify exact examination eligibility criteria, dates, and application deadlines directly on the official portals listed below.`;
        top.forEach((m) => {
          citations.push({ title: m.name, url: m.official_url, source: m.verification_source });
        });
      } else {
        reply = `ExamHub AI Exam Assistant answers questions using verified Indian Government and examination authority sources (.gov.in, .nic.in, .ac.in).

You can ask about:
• Eligibility criteria for UPSC, SSC, NEET, JEE, GATE, CAT, and State PSCs
• Application steps and One Time Registration (OTR) procedures
• Central and State Scholarship portals (NSP, Post-Matric)
• Verification of official examination portals and admit card release procedures

*Disclaimer: ExamHub India does not invent examination dates, fees, or policy decisions. All authoritative rules should be confirmed from official gazette notifications.*`;
        citations.push(
          { title: "National Portal of India Directory", url: "https://www.india.gov.in/", source: "Government of India" },
          { title: "National Testing Agency Portal", url: "https://exams.nta.ac.in/", source: "Ministry of Education" }
        );
      }
    }

    return NextResponse.json({
      answer: reply,
      citations,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process query" }, { status: 500 });
  }
}
