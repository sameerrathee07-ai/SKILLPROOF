import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const orgId = searchParams.get("organizationId");

    const where: any = {};
    if (category && category !== "ALL") {
      where.frictionCategory = category;
    }
    if (orgId) {
      where.organizationId = orgId;
    }

    const problems = await prisma.problem.findMany({
      where,
      include: {
        organization: true,
        pitches: {
          select: {
            id: true,
            passed: true,
            score: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = problems.map((p) => ({
      ...p,
      totalPitches: p.pitches.length,
      vettedPitches: p.pitches.filter((pitch) => pitch.passed).length,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, frictionCategory, organizationId, orgName, orgType } = body;

    if (!title || !description || !frictionCategory) {
      return NextResponse.json(
        { error: "Title, description, and frictionCategory are required." },
        { status: 400 }
      );
    }

    let resolvedOrgId = organizationId;
    if (!resolvedOrgId) {
      // Find or create default education org
      const org = await prisma.organization.create({
        data: {
          name: orgName || "Premier Education Center",
          type: orgType || "COACHING_CENTER",
        },
      });
      resolvedOrgId = org.id;
    }

    const problem = await prisma.problem.create({
      data: {
        title,
        description,
        frictionCategory,
        organizationId: resolvedOrgId,
        status: "OPEN",
      },
      include: {
        organization: true,
      },
    });

    return NextResponse.json(problem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
