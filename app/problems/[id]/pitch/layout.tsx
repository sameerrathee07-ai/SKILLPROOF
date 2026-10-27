import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://skillproof.app";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  let problem: {
    title: string;
    description: string;
    frictionCategory: string;
  } | null = null;

  try {
    problem = await prisma.problem.findUnique({
      where: { id: params.id },
      select: { title: true, description: true, frictionCategory: true },
    });
  } catch (error) {
    console.error("[pitch metadata] Failed to load challenge", error);
  }

  if (!problem) {
    return {
      title: "Submit a proposal",
      description:
        "Submit a structured five-step proposal through SkillProof's deterministic quality gate.",
    };
  }

  const title = `Submit a proposal: ${problem.title}`;
  const description = problem.description.slice(0, 155);

  return {
    title,
    description,
    openGraph: {
      title: `${title} | SkillProof`,
      description,
      url: `${BASE_URL}/problems/${params.id}/pitch`,
      siteName: "SkillProof",
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `${title} | SkillProof`,
      description,
    },
  };
}

export default function PitchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
