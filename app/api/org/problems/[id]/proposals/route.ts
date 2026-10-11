import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: params.id },
      include: {
        organization: true,
      },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Vetted inbox displays ONLY pitches where passed === true
    const vettedProposals = await prisma.pitch.findMany({
      where: {
        problemId: params.id,
        passed: true,
      },
      include: {
        solver: true,
      },
      orderBy: {
        score: "desc",
      },
    });

    // Count rejected/knocked-out pitches to illustrate noise filtering
    const totalSubmissions = await prisma.pitch.count({
      where: { problemId: params.id },
    });
    const blockedNoise = totalSubmissions - vettedProposals.length;

    const parsedProposals = vettedProposals.map((p) => {
      let stepDataParsed = {};
      let scoreBreakdownParsed = {};
      try {
        stepDataParsed = JSON.parse(p.stepData);
      } catch (e) {}
      try {
        scoreBreakdownParsed = JSON.parse(p.scoreBreakdown);
      } catch (e) {}

      return {
        ...p,
        stepDataParsed,
        scoreBreakdownParsed,
      };
    });

    return NextResponse.json({
      problem,
      totalSubmissions,
      blockedNoise,
      vettedCount: vettedProposals.length,
      proposals: parsedProposals,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
