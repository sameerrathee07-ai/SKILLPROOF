import { evaluatePitch, PitchInput, ScoreResult } from "./engine";

export interface CalibrationTestCase {
  id: string;
  name: string;
  sector: "EDUCATION" | "HOSPITALITY" | "FINANCIAL_SERVICES";
  type: "STRONG" | "WEAK";
  expectedOutcome: "PASS" | "KNOCKOUT" | "FAIL_LOW_SCORE";
  input: PitchInput;
}

export const CALIBRATION_DATASET: CalibrationTestCase[] = [
  // ==========================================
  // VAL-1: Strong Sample Pitches (Expected: >= 6.0, PASS)
  // ==========================================
  {
    id: "VAL-1-EDU-COACHING",
    name: "Coaching Center: Batch Attendance & Drop-Out Warning",
    sector: "EDUCATION",
    type: "STRONG",
    expectedOutcome: "PASS",
    input: {
      step1Diagnosis:
        "Root cause is operational latency in attendance feedback loops. Paper registers create a 4-day administrative blind spot where consecutive absences go unnoticed until the weekend batch review. By the time counseling calls happen, the student has missed foundational topics in physics/math, causing frustration and eventual dropout. The systemic friction lies in manual data entry and lack of real-time trigger rules.",
      step2Solution:
        "A progressive web app (PWA) for faculty with quick batch tap-marking and automated webhook triggers. When a student logs 3 consecutive unexcused absences, the backend fires an instant WhatsApp notification to the parent and flags the student on the counselor triage queue.",
      step2Deliverables:
        "1. Mobile-first Faculty Attendance PWA (tap-to-mark in under 45 seconds). 2. Counselor Triage Dashboard with batch-wise retention analytics. 3. Automated WhatsApp Cloud API webhook service. 4. Daily batch sync with CSV/Excel export for admin records.",
      step2Milestones:
        "Sprint 1 (Days 1-7): Database schema, Auth, and PWA attendance interface. Sprint 2 (Days 8-14): WhatsApp webhook worker and counselor dashboard. Sprint 3 (Days 15-20): Pilot test in 2 batches, staff training, and production deploy.",
      step3Alternatives: [
        {
          name: "Biometric Hardware Terminals at Classroom Doors",
          pros: "Fully automated without faculty intervention.",
          cons: "High initial hardware cost (₹12,000 per room across 12 classrooms), long queues of 60 students per batch entering class, and maintenance overhead.",
          rejectionReason: "Rejected due to prohibitive setup expense and hallway bottleneck delays before classes.",
        },
        {
          name: "Commercial Off-the-Shelf ERP System (e.g. Teachmint/Classting)",
          pros: "Feature-rich platform available immediately.",
          cons: "Expensive recurring per-student subscription fees (₹40/student/month = ₹26,000/mo), rigid UI that faculty resist, and lack of custom 3-absence WhatsApp trigger logic.",
          rejectionReason: "Rejected because recurring vendor lock-in is 3x more expensive and lacks tailored counselor triage workflows.",
        },
      ],
      step4Budget:
        "Total Project Cost: ₹24,000 INR (Milestone 1: ₹8,000 on PWA attendance completion; Milestone 2: ₹10,000 on WhatsApp webhook integration & counselor portal; Milestone 3: ₹6,000 after 2-week live batch pilot & staff handover).",
      step4CostBreakdown:
        "Hosting on Supabase/Vercel free tier (₹0/mo ongoing) + WhatsApp Cloud API free tier for first 1,000 service conversations/month.",
      step5Experience:
        "Built and deployed an attendance tracking portal for my university IEEE student branch (350 active members). Strong proficiency in Next.js, Node.js, PostgreSQL, and WhatsApp Business Cloud API.",
      step5ProofLinks:
        "https://github.com/aryan-dev/attendance-triage-demo | Live portfolio at https://aryanverma.vercel.app",
      step5Constraints:
        "Constraint awareness: Faculty have variable digital literacy, so attendance interface requires large touch buttons and 1-tap 'All Present' with single-tap exception marking. System handles offline caching if basement classroom WiFi drops, syncing when connection restores.",
    },
  },
  {
    id: "VAL-1-EDU-TUITION",
    name: "Tuition Academy: Conflict-Free Tutor Rescheduling Portal",
    sector: "EDUCATION",
    type: "STRONG",
    expectedOutcome: "PASS",
    input: {
      step1Diagnosis:
        "The underlying bottleneck is distributed asynchronous communication over unstructured WhatsApp chats. Forty part-time tutors coordinate across 120 weekly sessions without a unified calendar lock. When an exam shifts or a tutor falls sick, manual back-and-forth takes 14 messages per reschedule, creating double-booking errors and parent friction.",
      step2Solution:
        "A slot reconciliation web portal with synchronized Google Calendar/iCal integration and 1-click parent rescheduling links with temporary 15-minute slot reservation locks.",
      step2Deliverables:
        "1. Tutor Availability Matrix & recurring slot manager. 2. Parent Self-Serve Rescheduling link with SMS OTP. 3. Calendar conflict validation engine. 4. Weekly admin summary dashboard.",
      step2Milestones:
        "Phase 1: Calendar sync and database conflict lock engine (Week 1). Phase 2: Parent self-reschedule mobile view and SMS alerts (Week 2). Phase 3: Tutor onboarding and admin reporting (Week 3).",
      step3Alternatives: [
        {
          name: "Calendly Enterprise Subscription",
          pros: "Instant setup without custom coding.",
          cons: "Costs $15/user/month ($600/month = ₹50,000/mo), lacks tuition center multi-student batch session pooling.",
          rejectionReason: "Prohibitive ongoing software licensing cost for a local tuition academy.",
        },
        {
          name: "Shared Google Spreadsheet with Color Coded Slots",
          pros: "Zero monetary cost.",
          cons: "High human error, concurrent edit race conditions, accidental row overwrites, and no parent notification triggers.",
          rejectionReason: "Current system is already failing due to manual sync errors and lack of automated concurrency control.",
        },
      ],
      step4Budget:
        "Fixed Project Fee: ₹18,500 INR. Milestone 1: ₹6,000 (Database schema & slot lock logic); Milestone 2: ₹7,500 (Parent interface & SMS gateway); Milestone 3: ₹5,000 (Testing & tutor training).",
      step4CostBreakdown:
        "Infra: Node.js serverless on Vercel (free tier), SQLite/Prisma on Turso ($0 tier), Twilio SMS (pay-per-use approx ₹400/month).",
      step5Experience:
        "Full-stack student developer with 2 published production Next.js apps. Maintained scheduling bot for college tech fest with 1,200 attendees.",
      step5ProofLinks:
        "https://github.com/priyapatel/tuition-slot-scheduler | Case study at https://priyadev.com/scheduler",
      step5Constraints:
        "Constraint considerations: Parents often open links on low-bandwidth mobile phones, so page payload is kept under 60KB without heavy libraries. Concurrency locking handles two parents clicking the same replacement slot simultaneously.",
    },
  },
  {
    id: "VAL-1-EDU-COLLEGE",
    name: "College Dept: GPU & Workstation Time-Locked Reservation",
    sector: "EDUCATION",
    type: "STRONG",
    expectedOutcome: "PASS",
    input: {
      step1Diagnosis:
        "The problem stems from an unmonitored commons dilemma. Because lab access has zero cost or consequence, senior project teams book 6-hour workstation blocks and leave machines idling while other teams are blocked. No telemetry verifies actual GPU/compute utilization versus physical bench occupancy.",
      step2Solution:
        "A quota-governed reservation dashboard with automated 20-minute idle job check-in pins. If the reserved workstation does not register active compute within 20 minutes, the lock releases to waitlisted students automatically.",
      step2Deliverables:
        "1. Student reservation portal with student ID authentication. 2. Automated SSH/Agent heartbeat monitor checking GPU utilization. 3. Head-of-Department priority override panel. 4. Usage violation audit log.",
      step2Milestones:
        "Milestone 1: Web reservation portal & role-based auth (Days 1-5). Milestone 2: GPU telemetry agent daemon and auto-release worker (Days 6-12). Milestone 3: Dept pilot rollout (Days 13-16).",
      step3Alternatives: [
        {
          name: "Physical Sign-Up Logbook with Lab Assistant Sign-Off",
          pros: "No software development required.",
          cons: "Paper log is routinely falsified, cannot check actual GPU utilization, and requires lab assistant constant policing.",
          rejectionReason: "Fails to solve the root problem of idle machine hoarding.",
        },
        {
          name: "Slurm HPC Cluster Workload Manager",
          pros: "Industry standard high-performance batch queue.",
          cons: "Extremely steep learning curve for undergraduate project students who need interactive desktop GUI for CAD/deep learning visual debuggers.",
          rejectionReason: "Too complex and disrupts interactive desktop GUI workflows needed by undergrads.",
        },
      ],
      step4Budget:
        "Total Budget: ₹15,000 INR (Milestone 1: ₹5,000; Milestone 2: ₹7,000; Milestone 3: ₹3,000).",
      step4CostBreakdown:
        "Self-hosted entirely on college local intranet server. $0 external cloud cost, zero recurring licensing.",
      step5Experience:
        "3rd year Computer Science student; built campus lab intranet management utility and Linux system services.",
      step5ProofLinks:
        "https://github.com/rohit-cs/lab-workstation-allocator | Demo at https://lab-allocator.dev",
      step5Constraints:
        "Constraint: Systems operate behind college intranet firewall without public internet access. Everything designed to run completely on-premise with zero external cloud dependencies.",
    },
  },
  {
    id: "VAL-1-HOSP-INVENTORY",
    name: "Hospitality: Perishable Ingredient Wastage & Supplier Sync",
    sector: "HOSPITALITY",
    type: "STRONG",
    expectedOutcome: "PASS",
    input: {
      step1Diagnosis:
        "Root cause is disconnected kitchen inventory forecasting. Chefs order dairy and produce based on gut feeling rather than weekly reservation data, resulting in 18% perishable spoil rate each Tuesday/Wednesday.",
      step2Solution:
        "A daily predictive par-level calculator integrating POS banquet bookings and automated morning purchase orders dispatched to local vendors.",
      step2Deliverables:
        "1. Chef Daily Prep & Par-level mobile screen. 2. Automated purchase order generation. 3. Supplier confirmation SMS triggers. 4. Wastage variance report.",
      step2Milestones:
        "Phase 1: Inventory database and consumption tracking (Week 1). Phase 2: Par-level forecasting algorithm and vendor order dispatch (Week 2). Phase 3: Kitchen trial (Week 3).",
      step3Alternatives: [
        {
          name: "Toast/MarketMan Full Enterprise Hospitality ERP",
          pros: "Comprehensive all-in-one suite.",
          cons: "Requires ₹35,000 monthly subscription and massive 4-month staff training.",
          rejectionReason: "Too costly and bloated for a single boutique cafe/hotel.",
        },
        {
          name: "Weekly Whiteboard Inventory List",
          pros: "Zero cost.",
          cons: "Erased daily, no historical trend tracking, no automated alerts when spoilage thresholds breached.",
          rejectionReason: "Incapable of predictive par calculations.",
        },
      ],
      step4Budget:
        "Total Fee: ₹22,000 INR (Phase 1: ₹7,000, Phase 2: ₹10,000, Phase 3: ₹5,000).",
      step4CostBreakdown:
        "Cloud hosting: ₹600/month on DigitalOcean droplet, open-source PostgreSQL.",
      step5Experience:
        "Developed billing and kitchen order display (KOD) system for a 60-seat restaurant.",
      step5ProofLinks:
        "https://github.com/dev-rahul/restaurant-inventory-poc | Portfolio: https://rahuldev.io",
      step5Constraints:
        "Operational constraint: Kitchen staff wear gloves and have flour on hands; UI requires high-contrast large buttons and voice confirmation or simple 1-touch count increments.",
    },
  },
  {
    id: "VAL-1-FIN-RECONCILER",
    name: "Financial Services: GST Invoice Discrepancy Reconciler",
    sector: "FINANCIAL_SERVICES",
    type: "STRONG",
    expectedOutcome: "PASS",
    input: {
      step1Diagnosis:
        "Root cause is mismatched vendor GSTIN invoice data between GSTR-2B government portal and client accounting tally ledgers, requiring 40 hours of manual reconciliation per tax quarter.",
      step2Solution:
        "Automated fuzzy matching Python/Next.js reconciliation worker that parses government JSON and Tally XML exports, instantly flagging invoice number mismatches and uncredited input tax credits.",
      step2Deliverables:
        "1. Secure document upload portal. 2. Automated fuzzy reconciliation engine. 3. Discrepancy exception table. 4. Client tax credit variance report.",
      step2Milestones:
        "Sprint 1: Parser and reconciliation algorithm (Days 1-8). Sprint 2: Web interface and export generator (Days 9-15). Sprint 3: Client data validation (Days 16-21).",
      step3Alternatives: [
        {
          name: "ClearTax / Zoho Books Enterprise Addon",
          pros: "Pre-built commercial connectors.",
          cons: "Expensive per-GSTIN fees and does not support custom legacy Tally XML field mappings used by firm.",
          rejectionReason: "Lacks custom field mapping support for firm's legacy setup.",
        },
        {
          name: "Manual Excel VLOOKUP Matching by Articled Assistants",
          pros: "No new software purchase.",
          cons: "Extremely error-prone, misses slight typo in invoice numbers, and delays filing by up to a week.",
          rejectionReason: "Already causing filing penalties and massive staff overtime.",
        },
      ],
      step4Budget:
        "Total Cost: ₹28,000 INR (Milestone 1: ₹10,000, Milestone 2: ₹12,000, Milestone 3: ₹6,000).",
      step4CostBreakdown:
        "Self-contained container deployed on client local server for financial data privacy.",
      step5Experience:
        "Fintech student enthusiast; built financial data extraction scripts and tax calculator widgets.",
      step5ProofLinks:
        "https://github.com/fintech-solver/gst-matcher-tool | Profile: https://fintechsolver.dev",
      step5Constraints:
        "Data privacy constraint: Client PAN and financial records cannot leave local network; system runs air-gapped on local office workstation.",
    },
  },

  // ==========================================
  // VAL-2: Deliberately Weak Sample Pitches
  // ==========================================
  {
    id: "VAL-2-WEAK-NO-PRICE",
    name: "Weak Pitch 1: Missing Explicit Pricing (Knockout 1)",
    sector: "EDUCATION",
    type: "WEAK",
    expectedOutcome: "KNOCKOUT",
    input: {
      step1Diagnosis:
        "Attendance in coaching centers is low because students skip classes when they get tired. The coaching management needs a system to know who skipped.",
      step2Solution:
        "I will build a website with React where teachers can mark attendance and view who is absent.",
      step2Deliverables: "A web app and a database.",
      step2Milestones: "Phase 1: make website. Phase 2: deploy.",
      step3Alternatives: [
        {
          name: "Paper registers",
          pros: "Easy",
          cons: "Lost easily",
          rejectionReason: "Not digital",
        },
        {
          name: "Excel sheets",
          pros: "Digital",
          cons: "Manual",
          rejectionReason: "Too simple",
        },
      ],
      step4Budget:
        "We can discuss the budget later once we agree on all features. It will be very affordable and cheap, whatever you are willing to pay.", // NO NUMBERS OR CURRENCY
      step4CostBreakdown: "Negotiable after meeting.",
      step5Experience: "I am a 2nd year CS student eager to learn.",
      step5ProofLinks: "No links yet.",
      step5Constraints: "No major constraints.",
    },
  },
  {
    id: "VAL-2-WEAK-NO-ALTERNATIVES",
    name: "Weak Pitch 2: Fewer Than 2 Alternatives (Knockout 2)",
    sector: "EDUCATION",
    type: "WEAK",
    expectedOutcome: "KNOCKOUT",
    input: {
      step1Diagnosis:
        "The problem is that tutors do not know when students are free, and students do not know when tutors are free. This creates scheduling problems and angry calls from parents who demand refunds.",
      step2Solution:
        "A scheduling website where tutors can put their free hours and students can pick time slots. We will use Firebase and React for quick development.",
      step2Deliverables: "Student booking interface and tutor dashboard.",
      step2Milestones: "Week 1: UI. Week 2: Firebase backend.",
      step3Alternatives: [
        {
          name: "Just using WhatsApp messages",
          pros: "Everyone has it",
          cons: "Hard to track",
          rejectionReason: "Too confusing",
        },
        // Only 1 alternative provided!
      ],
      step4Budget: "Total Cost: ₹10,000 INR flat fee.",
      step4CostBreakdown: "Hosting on free tier.",
      step5Experience: "Built 2 hobby web pages in React.",
      step5ProofLinks: "https://github.com/student/profile",
      step5Constraints: "Tutors might not open the website regularly.",
    },
  },
  {
    id: "VAL-2-WEAK-LOW-EFFORT",
    name: "Weak Pitch 3: Under 200 Characters Total (Knockout 3)",
    sector: "EDUCATION",
    type: "WEAK",
    expectedOutcome: "KNOCKOUT",
    input: {
      step1Diagnosis: "Bad scheduling.",
      step2Solution: "Build an app for $100.",
      step2Deliverables: "App",
      step3Alternatives: "1. Google sheet 2. Paper",
      step4Budget: "$100",
      step5Experience: "Student",
    },
  },
  {
    id: "VAL-2-WEAK-SHALLOW-FLUFF",
    name: "Weak Pitch 4: Buzzword Fluff, No Concrete Actionability (Tier 2 Score < 6.0)",
    sector: "EDUCATION",
    type: "WEAK",
    expectedOutcome: "FAIL_LOW_SCORE",
    input: {
      step1Diagnosis:
        "The problem is poor communication in the organization. Communication is the foundation of all educational success. When communication fails, everything fails and students lose motivation.",
      step2Solution:
        "We will implement an AI-powered synergy platform using cloud native paradigms and hyper-scalable modern web paradigms to optimize overall stakeholder alignment.",
      step2Deliverables: "A comprehensive digital synergy platform.",
      step2Milestones: "Milestone 1: kickoff. Milestone 2: completion.",
      step3Alternatives: [
        {
          name: "Doing nothing",
          pros: "Free",
          cons: "Nothing changes",
          rejectionReason: "Not useful",
        },
        {
          name: "Other software",
          pros: "Available",
          cons: "Generic",
          rejectionReason: "Not tailored",
        },
      ],
      step4Budget: "Total price: $500 flat fee.",
      step4CostBreakdown: "All inclusive fee.",
      step5Experience: "Passion for cutting-edge technology and digital transformation.",
      step5ProofLinks: "Portfolio under construction",
      step5Constraints: "None, it will work smoothly.",
    },
  },
  {
    id: "VAL-2-WEAK-SYMPTOM-NO-PROOF",
    name: "Weak Pitch 5: Symptom Restatement, No Verifiable Links (Tier 2 Score < 6.0)",
    sector: "EDUCATION",
    type: "WEAK",
    expectedOutcome: "FAIL_LOW_SCORE",
    input: {
      step1Diagnosis:
        "Students are absent from coaching classes and parents are unhappy. The teachers are busy and don't call parents on time. This is causing students to leave the institute.",
      step2Solution:
        "Create an online sheet where teachers type absent roll numbers and send an email or SMS to parents at the end of the day.",
      step2Deliverables: "A basic portal with login and email button.",
      step2Milestones: "Will take around 2-3 weeks to build.",
      step3Alternatives: [
        {
          name: "Calling each parent manually by phone",
          pros: "Direct contact",
          cons: "Takes too much time",
          rejectionReason: "Admin gets exhausted",
        },
        {
          name: "Notice board pinned announcements",
          pros: "Cheap",
          cons: "Parents don't see it",
          rejectionReason: "Ineffective",
        },
      ],
      step4Budget: "₹5,000 INR for the whole project.",
      step4CostBreakdown: "One-time cost.",
      step5Experience: "Done college coursework in web design.",
      step5ProofLinks: "No public links available.",
      step5Constraints: "Sometimes internet is slow.",
    },
  },
];

export interface CalibrationReport {
  timestamp: string;
  totalPitches: number;
  strongPitches: number;
  weakPitches: number;
  passedPitches: number;
  knockedOutPitches: number;
  failedPitches: number;
  val4Success: boolean; // 100% strong >= 6.0 AND 100% weak < 6.0
  results: {
    id: string;
    name: string;
    sector: string;
    type: "STRONG" | "WEAK";
    expected: string;
    actualPassed: boolean;
    actualKnockedOut: boolean;
    actualScore: number;
    testPassed: boolean;
    feedback: string[];
    scoreBreakdown: ScoreResult;
  }[];
}

/**
 * Runs the deterministic calibration suite against all sample pitches.
 */
export function runCalibrationSuite(): CalibrationReport {
  const results = CALIBRATION_DATASET.map((tc) => {
    const evalResult = evaluatePitch(tc.input);

    let testPassed = false;
    if (tc.type === "STRONG") {
      testPassed = evalResult.passed && !evalResult.knockedOut && evalResult.overallScore >= 6.0;
    } else {
      // Weak pitch must fail or be knocked out
      testPassed = !evalResult.passed && evalResult.overallScore < 6.0;
    }

    return {
      id: tc.id,
      name: tc.name,
      sector: tc.sector,
      type: tc.type,
      expected: tc.expectedOutcome,
      actualPassed: evalResult.passed,
      actualKnockedOut: evalResult.knockedOut,
      actualScore: evalResult.overallScore,
      testPassed,
      feedback: evalResult.actionableFeedback,
      scoreBreakdown: evalResult,
    };
  });

  const totalPitches = results.length;
  const strongPitches = results.filter((r) => r.type === "STRONG").length;
  const weakPitches = results.filter((r) => r.type === "WEAK").length;
  const passedPitches = results.filter((r) => r.actualPassed).length;
  const knockedOutPitches = results.filter((r) => r.actualKnockedOut).length;
  const failedPitches = results.filter((r) => !r.actualPassed && !r.actualKnockedOut).length;

  const val4Success = results.every((r) => r.testPassed);

  return {
    timestamp: new Date().toISOString(),
    totalPitches,
    strongPitches,
    weakPitches,
    passedPitches,
    knockedOutPitches,
    failedPitches,
    val4Success,
    results,
  };
}
