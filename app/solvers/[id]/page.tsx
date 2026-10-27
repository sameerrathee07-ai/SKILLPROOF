import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Building2,
  Calendar,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { normalizeUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

function parseProofLinks(stepData: string): string[] {
  try {
    const parsed = JSON.parse(stepData) as { step5ProofLinks?: unknown };
    if (typeof parsed.step5ProofLinks !== "string") return [];
    return parsed.step5ProofLinks
      .split(/[\n,]+/)
      .map((link) => link.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export default async function SolverPortfolioPage({
  params,
}: {
  params: { id: string };
}) {
  const solver = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      headline: true,
      bio: true,
      credibilityScore: true,
      createdAt: true,
      pitches: {
        where: { passed: true },
        orderBy: { score: "desc" },
        select: {
          id: true,
          score: true,
          stepData: true,
          problem: {
            select: {
              title: true,
              frictionCategory: true,
              organization: {
                select: {
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!solver) {
    notFound();
  }

  const proofLinks = Array.from(
    new Set(solver.pitches.flatMap((pitch) => parseProofLinks(pitch.stepData)))
  );

  return (
    <div className="space-y-8 pb-16">
      <Link
        href="/problems"
        className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Back to challenges
      </Link>

      <section className="rounded-2xl border border-white/10 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Solver
            </span>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {solver.name || "SkillProof Solver"}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {solver.headline || "Building practical solutions to education challenges."}
              </p>
            </div>
            {solver.bio ? (
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
                {solver.bio}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Award className="w-3.5 h-3.5" />
                Credibility
              </div>
              <div className="mt-1 text-xl font-bold text-emerald-700">
                {solver.credibilityScore.toFixed(1)}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                Joined
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-800">
                {solver.createdAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white">Vetted Problem Solutions</h2>
          <p className="text-sm text-slate-400">
            Challenges this solver passed through the deterministic quality gate.
          </p>
        </div>

        {solver.pitches.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-sm text-slate-400">
              No vetted solutions have been published yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {solver.pitches.map((pitch) => (
              <article
                key={pitch.id}
                className="rounded-xl border border-white/10 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-slate-900">
                      {pitch.problem.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {pitch.problem.organization.name}
                      </span>
                      <span>
                        {pitch.problem.organization.type.replace(/_/g, " ")}
                      </span>
                      <span>
                        {pitch.problem.frictionCategory.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                      Gate Score
                    </div>
                    <div className="text-lg font-bold text-emerald-800">
                      {pitch.score.toFixed(1)}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {proofLinks.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">Proof Links</h2>
          <div className="flex flex-wrap gap-2">
            {proofLinks.map((link) => (
              <a
                key={link}
                href={normalizeUrl(link)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 transition-colors"
              >
                {link}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
