import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Building2,
  FileText,
  Inbox,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getRequestUser } from "@/lib/auth/request-user";
import { ProblemStatusToggle } from "@/components/ProblemStatusToggle";

export const dynamic = "force-dynamic";

export default async function OrganizationDashboardPage() {
  const user = await getRequestUser();
  if (!user) {
    redirect("/login?next=/org/dashboard");
  }
  if (user.role !== "POSTER" && user.role !== "ADMIN") {
    redirect("/problems");
  }

  const organization = await prisma.organization.findFirst({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" },
    include: {
      problems: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { pitches: true } },
        },
      },
    },
  });

  const challenges = organization?.problems ?? [];
  const activeChallenges = challenges.filter(
    (challenge) => challenge.status === "OPEN"
  ).length;
  const totalPitches = challenges.reduce(
    (total, challenge) => total + challenge._count.pitches,
    0
  );
  const vettedPitches = organization
    ? await prisma.pitch.count({
        where: {
          passed: true,
          problem: { organizationId: organization.id },
        },
      })
    : 0;

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Link
            href="/problems"
            className="inline-flex items-center text-xs font-semibold text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            Back to all challenges
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              Organization workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
              Review dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Track challenge activity, vetted submissions, and the review
              pipeline for your organization.
            </p>
          </div>
        </div>

        <Link
          href="/org/problems/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-300"
        >
          <PlusCircle className="h-4 w-4" />
          Post New Challenge
        </Link>
      </div>

      {organization ? (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Building2 className="h-4 w-4 text-amber-400" />
          <span className="font-semibold text-white">{organization.name}</span>
          <span className="text-slate-600">/</span>
          <span>{organization.type.replace(/_/g, " ")}</span>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-5">
          <p className="text-sm font-semibold text-amber-200">
            No organization is linked to this account yet.
          </p>
          <p className="mt-1 text-sm text-amber-100/70">
            Post your first challenge to create and bind your organization.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Active Challenges
            </span>
            <Activity className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">
            {activeChallenges}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Open to new solver submissions
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Total Pitches Received
            </span>
            <Inbox className="h-4 w-4 text-slate-700" />
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">
            {totalPitches}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Across every posted challenge
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Vetted Pitches Passed
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">
            {vettedPitches}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Cleared the deterministic quality gate
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Challenges</h2>
            <p className="mt-1 text-xs text-slate-500">
              Review status and open the vetted proposal inbox.
            </p>
          </div>
          <FileText className="h-5 w-5 text-slate-400" />
        </div>

        {challenges.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-slate-700">
              No challenges posted yet.
            </p>
            <Link
              href="/org/problems/new"
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Post your first challenge
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Challenge</th>
                  <th className="px-5 py-3">Friction</th>
                  <th className="px-5 py-3">Posted</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Proposals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {challenges.map((challenge) => {
                  const isOpen = challenge.status === "OPEN";
                  return (
                    <tr key={challenge.id} className="align-middle">
                      <td className="px-5 py-4">
                        <Link
                          href={`/org/problems/${challenge.id}/proposals`}
                          className="font-semibold text-slate-900 transition-colors hover:text-amber-700"
                        >
                          {challenge.title}
                        </Link>
                        <p className="mt-1 text-xs text-slate-500">
                          {challenge._count.pitches} total pitches
                        </p>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                        {challenge.frictionCategory.replace(/_/g, " ")}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {challenge.createdAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-md border px-2 py-1 text-[11px] font-bold ${
                            isOpen
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isOpen ? "Open" : "Closed"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <ProblemStatusToggle
                            problemId={challenge.id}
                            status={isOpen ? "OPEN" : "CLOSED"}
                          />
                          <Link
                            href={`/org/problems/${challenge.id}/proposals`}
                            className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-slate-700"
                          >
                            <Inbox className="h-3.5 w-3.5" />
                            Inbox
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
