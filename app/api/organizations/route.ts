import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const orgs = await prisma.organization.findMany({
      include: {
        _count: {
          select: { problems: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orgs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
