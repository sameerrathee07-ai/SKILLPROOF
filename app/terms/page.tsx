import Link from "next/link";
import { Scale, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, FileCheck } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions: SkillProof",
  description: "Terms and conditions governing the use of the SkillProof quality-gated problem solving platform.",
};

export default function TermsAndConditionsPage() {
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
            <Scale className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Terms and Conditions
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
            <FileCheck className="w-4 h-4 text-slate-500" />
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using the SkillProof platform, whether as a student solver, education organization poster, or platform administrator, you agree to comply with and be bound by these Terms and Conditions. If you do not agree, do not access or use the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            2. Two-Tier Quality Gate and Submission Rules
          </h2>
          <p>
            SkillProof operates on a quality-filtering architecture designed to eliminate low-effort proposals. All pitch submissions are subject to the following rules:
          </p>
          <div className="space-y-2 pl-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <strong className="block text-slate-900 font-semibold mb-1">Tier 1: Binary Knockouts</strong>
              <p className="text-xs text-slate-600">
                Pitches missing explicit milestone pricing, failing to evaluate at least two distinct alternatives, or falling below 200 total characters fail immediately and will not be forwarded to posters.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <strong className="block text-slate-900 font-semibold mb-1">Tier 2: Quality Threshold</strong>
              <p className="text-xs text-slate-600">
                Submissions must achieve an aggregate quality score of 6.0 or higher out of 10.0 across all dimensional criteria to reach the organization inbox.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-slate-500" />
            3. Prohibited Conduct
          </h2>
          <p>Users agree not to engage in any of the following activities:</p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
            <li>Submitting bulk automated pitches, scraped content, or plagiarized work.</li>
            <li>Providing fabricated credentials, misleading portfolio references, or false organizational identities.</li>
            <li>Attempting to circumvent, manipulate, or reverse-engineer the deterministic quality gate scoring engine.</li>
            <li>Posting challenges or pitches containing offensive, defamatory, or unlawful materials.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-500" />
            4. Intellectual Property
          </h2>
          <p>
            Solvers retain copyright and ownership of the original text and materials submitted in their proposals. By submitting a proposal to an organization challenge, the solver grants the posting organization a non-exclusive license to evaluate the proposal for engagement or implementation purposes. Organizations may not repurpose proprietary solver materials without explicit agreement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            5. Disclaimers and Limitation of Liability
          </h2>
          <p>
            SkillProof provides the platform and quality evaluation tools on an "as is" and "as available" basis. SkillProof does not guarantee that posting a challenge will result in an accepted solution, nor that passing the quality gate guarantees a commercial contract between solvers and organizations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            6. Changes and Contact
          </h2>
          <p>
            We reserve the right to modify these terms as the platform evolves. Material updates will be reflected with an updated effective date. For legal inquiries, contact legal@skillproof.org.
          </p>
        </section>
      </div>
    </div>
  );
}
