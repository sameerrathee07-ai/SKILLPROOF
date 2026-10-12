import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, Database, EyeOff, FileText } from "lucide-react";

export const metadata = {
  title: "Privacy Policy: SkillProof",
  description: "How SkillProof handles user information, organization challenge data, and proposal evaluations.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="border-b border-slate-200 pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <Lock className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Effective Date: October 2026 | Version 1.0
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-8 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            1. Overview and Purpose
          </h2>
          <p>
            SkillProof operates a quality-gated problem-solving platform connecting student solvers with educational organizations, including coaching centers, tuition providers, and college departments. This policy outlines how information is collected, processed, and safeguarded across all platform interactions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-500" />
            2. Information We Collect
          </h2>
          <div className="space-y-2">
            <p>
              <strong>Account Information:</strong> Name, professional or academic email address, role (Solver, Poster, or Admin), and institution affiliation.
            </p>
            <p>
              <strong>Problem Submissions:</strong> Title, operational friction description, sector category, and organizational requirements posted by education partners.
            </p>
            <p>
              <strong>Pitch Submissions:</strong> Problem diagnosis, actionable implementation milestones, evaluated alternatives, cost breakdowns, and proof credentials (portfolio links, GitHub repositories, or verified references).
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            3. Deterministic Quality Gate Processing
          </h2>
          <p>
            Pitches submitted to SkillProof are evaluated using a deterministic, rules-based scoring engine. We do not transmit pitch content or personal identifiable information to third-party large language models or external generative AI services for grading.
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
            <li>Scoring logic executes statelessly within the SkillProof application runtime.</li>
            <li>No submission text is retained or used to train third-party machine learning models.</li>
            <li>Knockout feedback and dimensional score breakdowns are calculated purely from objective criteria.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-slate-500" />
            4. Access Control and Multi-Tenancy
          </h2>
          <p>
            Platform data is strictly scoped by organization tenancy. Proposals that fail the quality gate remain private to the solver with diagnostic feedback and are never delivered to organization inboxes. Only proposals that pass Tier 1 binary knockouts and attain a score of 6.0 or higher are made accessible to authorized posters within that specific organization.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            5. Data Retention and Deletion
          </h2>
          <p>
            Users may request complete deletion of their account and associated pitch drafts by contacting support. Organizations retain submitted proposals that have been contracted or vetted during an active challenge cycle for administrative verification.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            6. Contact Information
          </h2>
          <p>
            For privacy inquiries, data access requests, or compliance questions, contact the SkillProof operations team at privacy@skillproof.org.
          </p>
        </section>
      </div>
    </div>
  );
}
