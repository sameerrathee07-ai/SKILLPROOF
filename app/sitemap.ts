import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://skillproof.app";

const STATIC_ROUTES = [
  "",
  "/problems",
  "/about",
  "/pricing",
  "/services",
  "/privacy",
  "/terms",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));

  let problems: { id: string; createdAt: Date }[] = [];
  try {
    problems = await prisma.problem.findMany({
      where: { status: "OPEN" },
      select: { id: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[sitemap] Failed to load open challenges", error);
  }

  return [
    ...staticEntries,
    ...problems.map((problem) => ({
      url: `${BASE_URL}/problems/${problem.id}/pitch`,
      lastModified: problem.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
