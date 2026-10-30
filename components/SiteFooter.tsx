"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The landing page ends with its own cinematic footer, so skip the shell bar there.
export function SiteFooter() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <footer className="no-print border-t border-slate-200/80 bg-white/60 py-6 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span className="font-semibold text-slate-700">SkillProof Platform</span>: Focused Single-Sector Wedge: Education
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <Link href="/privacy" className="hover:text-slate-800 transition-colors">
            Privacy Policy
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/terms" className="hover:text-slate-800 transition-colors">
            Terms and Conditions
          </Link>
          <span aria-hidden="true">·</span>
          <span className="text-slate-400">Zero LLM Dependency</span>
        </div>
      </div>
    </footer>
  );
}
