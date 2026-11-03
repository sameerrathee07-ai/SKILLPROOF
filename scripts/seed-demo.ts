import "dotenv/config";
import { prisma } from "../lib/db";

// Two demo challenges for screenshots and local review. Safe to rerun: existing titles are skipped.
const samples = [
  {
    org: { name: "Northpoint Coaching", type: "COACHING_CENTER" },
    problem: {
      title: "Weekly batch rescheduling eats three hours of our front desk",
      frictionCategory: "SCHEDULING",
      description:
        "We run 42 batches across 9 classrooms with 17 teachers. Every week two or three teachers call in unavailable, and the front desk rebuilds the timetable by hand in a spreadsheet, then sends 60+ WhatsApp messages to parents. Room clashes still slip through, and two students showed up last month to a class that had been moved. We need a way to detect room and teacher conflicts before anything goes out to parents.",
    },
  },
  {
    org: { name: "Sunrise Tuition Academy", type: "TUITION_ACADEMY" },
    problem: {
      title: "Parents pull students out after the second test score drop",
      frictionCategory: "STUDENT_RETENTION",
      description:
        "Around 30% of our Class 10 students leave between the second and third monthly test. We only discover the risk when a parent calls to cancel, and by then the decision is already made. Our teachers notice the slide in class but have no consistent way to flag it, and parents say they were never told what was changing. We want an early warning we can act on while there is still time to intervene.",
    },
  },
];

async function main() {
  for (const sample of samples) {
    const existing = await prisma.problem.findFirst({ where: { title: sample.problem.title } });
    if (existing) {
      console.log(`skip  ${existing.frictionCategory.padEnd(18)} ${existing.id}  ${existing.title}`);
      continue;
    }

    const org =
      (await prisma.organization.findFirst({ where: { name: sample.org.name } })) ??
      (await prisma.organization.create({ data: sample.org }));

    const problem = await prisma.problem.create({
      data: { ...sample.problem, organizationId: org.id, status: "OPEN" },
    });

    console.log(`added ${problem.frictionCategory.padEnd(18)} ${problem.id}  ${problem.title}`);
  }
}

main().finally(() => prisma.$disconnect());
