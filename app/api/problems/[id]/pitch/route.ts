import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { evaluatePitch, PitchInput } from "@/lib/scoring/engine";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { pitchInput, solverId, revisionCount = 0 } = body;

    if (!pitchInput) {
      return NextResponse.json({ error: "Missing pitch input data" }, { status: 400 });
    }

    // Verify problem exists
    const problem = await prisma.problem.findUnique({
      where: { id: params.id },
    });
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Find or create active solver
    let activeSolverId = solverId;
    if (!activeSolverId) {
      let defaultSolver = await prisma.user.findFirst({
        where: { role: "SOLVER" },
      });
      if (!defaultSolver) {
        defaultSolver = await prisma.user.create({
          data: {
            email: "student.solver@skillproof.dev",
            name: "Student Solver",
            role: "SOLVER",
            tokens: 50,
            credibilityScore: 1.0,
          },
        });
      }
      activeSolverId = defaultSolver.id;
    }

    // Run pure deterministic scoring engine
    const evaluation = evaluatePitch(pitchInput as PitchInput);

    // Save pitch to database
    const pitch = await prisma.pitch.create({
      data: {
        problemId: problem.id,
        solverId: activeSolverId,
        stepData: JSON.stringify(pitchInput),
        score: evaluation.overallScore,
        passed: evaluation.passed,
        knockedOut: evaluation.knockedOut,
        scoreBreakdown: JSON.stringify(evaluation),
        revisionCount: Number(revisionCount) || 0,
      },
    });

    let updatedSolver = null;
    // If passed, reward solver credibility
    if (evaluation.passed) {
      updatedSolver = await prisma.user.update({
        where: { id: activeSolverId },
        data: {
          credibilityScore: {
            increment: 0.1,
          },
        },
      });
    } else {
      updatedSolver = await prisma.user.findUnique({
        where: { id: activeSolverId },
      });
    }

    return NextResponse.json({
      pitchId: pitch.id,
      evaluation,
      solver: updatedSolver,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
