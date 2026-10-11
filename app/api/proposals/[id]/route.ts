import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pitch = await prisma.pitch.findUnique({
      where: { id: params.id },
      include: {
        solver: true,
        problem: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!pitch) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    let parsedStepData = {};
    let parsedScoreBreakdown = {};
    try {
      parsedStepData = JSON.parse(pitch.stepData);
    } catch (e) {}
    try {
      parsedScoreBreakdown = JSON.parse(pitch.scoreBreakdown);
    } catch (e) {}

    return NextResponse.json({
      ...pitch,
      stepDataParsed: parsedStepData,
      scoreBreakdownParsed: parsedScoreBreakdown,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
