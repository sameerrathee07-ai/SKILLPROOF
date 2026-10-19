import { PrismaClient } from "@prisma/client";
import { evaluatePitch } from "../lib/scoring/engine";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding SkillProof database...");

  // Clean existing data
  await prisma.pitch.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const solverAryan = await prisma.user.create({
    data: {
      email: "aryan@solver.skillproof.dev",
      name: "Aryan Verma",
      role: "SOLVER",
      tokens: 50,
      credibilityScore: 1.2,
    },
  });

  const solverPriya = await prisma.user.create({
    data: {
      email: "priya@solver.skillproof.dev",
      name: "Priya Patel",
      role: "SOLVER",
      tokens: 45,
      credibilityScore: 1.0,
    },
  });

  const posterSharma = await prisma.user.create({
    data: {
      email: "sharma@apexcoaching.edu",
      name: "Director Sharma",
      role: "POSTER",
      tokens: 100,
      credibilityScore: 1.0,
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@skillproof.dev",
      name: "System Admin",
      role: "ADMIN",
      tokens: 999,
      credibilityScore: 2.0,
    },
  });

  // Create Education Organizations
  const orgApex = await prisma.organization.create({
    data: {
      name: "Apex IIT-JEE & NEET Coaching Hub",
      type: "COACHING_CENTER",
    },
  });

  const orgHorizon = await prisma.organization.create({
    data: {
      name: "Horizon Academy for Secondary Tuitions",
      type: "TUITION_ACADEMY",
    },
  });

  const orgCollege = await prisma.organization.create({
    data: {
      name: "City Engineering College - Dept of Computer Science",
      type: "COLLEGE_DEPT",
    },
  });

  // Create Problems
  const problem1 = await prisma.problem.create({
    data: {
      organizationId: orgApex.id,
      postedById: posterSharma.id,
      title: "Batch-wise Attendance & Drop-out Early Warning Trigger",
      description:
        "Across our 12 offline JEE batches (650+ students), attendance drops precede course abandonment by 2-3 weeks. Faculty mark attendance on paper registers, leading to a 4-day lag before admin or counselors notice consecutive absences. We need a lightweight system where faculty or QR/biometric tap syncs instantly, detects 3 consecutive missed lectures, and alerts student counselors and parents via automated WhatsApp webhook before students fall irrecoverably behind.",
      frictionCategory: "STUDENT_RETENTION",
      status: "OPEN",
    },
  });

  const problem2 = await prisma.problem.create({
    data: {
      organizationId: orgHorizon.id,
      postedById: posterSharma.id,
      title: "Parent-Tutor Progress Sync & Rescheduling Bottleneck",
      description:
        "We coordinate 40 part-time tutors delivering 1-on-1 and small group batches for Class 9-12 students. Last-minute exam postponements and tutor sickness cause 30+ rescheduling disputes each week via frantic WhatsApp messages. We need an automated conflict-free slot rescheduling workflow with parent SMS/WhatsApp confirmations and faculty availability calendars.",
      frictionCategory: "SCHEDULING",
      status: "OPEN",
    },
  });

  const problem3 = await prisma.problem.create({
    data: {
      organizationId: orgCollege.id,
      postedById: posterSharma.id,
      title: "Hardware Lab & GPU Rig Equipment Booking Allocation",
      description:
        "Our AI/ML lab features 4 multi-GPU workstations and 30 IoT embedded sensor kits. Final-year students hoard workstation access without utilizing compute, while other teams fail project milestone deadlines due to blocked slots. We require a transparent quota-based reservation portal with time-bounded job locks and department head override capabilities.",
      frictionCategory: "ADMIN_WORKFLOW",
      status: "OPEN",
    },
  });

  // Seed a realistic passing pitch for Problem 1
  const strongPitchInput = {
    step1Diagnosis:
      "The root cause is not student disinterest, but operational latency in attendance feedback loops. Paper registers create a 4-day administrative blind spot where consecutive absences go unnoticed until the weekend batch review. By the time counseling calls happen, the student has missed foundational topics in physics/math, causing frustration and eventual dropout. The systemic friction lies in manual data entry and lack of real-time trigger rules.",
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
        rejectionReason:
          "Rejected due to prohibitive setup expense and hallway bottleneck delays before classes.",
      },
      {
        name: "Commercial Off-the-Shelf ERP System (e.g. Teachmint/Classting)",
        pros: "Feature-rich platform available immediately.",
        cons: "Expensive recurring per-student subscription fees (₹40/student/month = ₹26,000/mo), rigid UI that faculty resist, and lack of custom 3-absence WhatsApp trigger logic.",
        rejectionReason:
          "Rejected because recurring vendor lock-in is 3x more expensive and lacks tailored counselor triage workflows.",
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
  };

  const evalResult = evaluatePitch(strongPitchInput);

  await prisma.pitch.create({
    data: {
      problemId: problem1.id,
      solverId: solverAryan.id,
      stepData: JSON.stringify(strongPitchInput),
      score: evalResult.overallScore,
      passed: evalResult.passed,
      knockedOut: evalResult.knockedOut,
      scoreBreakdown: JSON.stringify(evalResult),
      revisionCount: 0,
    },
  });

  console.log(`Seeded: 3 Organizations, 3 Problems, 4 Users, 1 Sample Pitch (Score: ${evalResult.overallScore}/10, Passed: ${evalResult.passed})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
