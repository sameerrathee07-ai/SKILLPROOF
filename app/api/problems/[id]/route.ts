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
        pitches: {
          select: {
            id: true,
            passed: true,
            score: true,
            createdAt: true,
          },
        },
      },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...problem,
      totalPitches: problem.pitches.length,
      vettedPitches: problem.pitches.filter((p) => p.passed).length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
