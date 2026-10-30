"use client";

import Link from "next/link";
import { SunIcon as Sunburst } from "lucide-react";
import type { ReactNode } from "react";

export function GoogleMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`${className} shrink-0`} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function FullScreenAuth({
  mode,
  children,
}: {
  mode: "login" | "signup";
  children: ReactNode;
}) {
  const isSignup = mode === "signup";

  return (
    <div className="min-h-screen w-full bg-neutral-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl shadow-xl flex flex-col md:flex-row">
        <aside className="relative md:w-1/2 bg-neutral-950 text-white p-8 md:p-12 min-h-[16rem] md:min-h-[36rem] overflow-hidden">
          <div className="absolute inset-0 flex opacity-30" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-full w-16 bg-gradient-to-r from-transparent via-black to-white/20"
              />
            ))}
          </div>
          <div
            className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-orange-500 opacity-70 blur-3xl"
            aria-hidden="true"
          />

          <Link
            href="/"
            className="relative z-10 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400 hover:text-orange-300"
          >
            <Sunburst className="h-5 w-5" />
            SkillProof
          </Link>

          <h1 className="relative z-10 mt-10 text-2xl md:text-3xl font-medium leading-tight tracking-tight">
            {isSignup
              ? "Post a real problem. Get a verified solution."
              : "Where education problems meet verified student solutions."}
          </h1>
          <p className="relative z-10 mt-4 max-w-sm text-sm text-neutral-400">
            {isSignup
              ? "Join as a solver or a poster. The deterministic quality gate does the rest."
              : "Sign in to submit pitches, review proposals, and track your credibility."}
          </p>
        </aside>

        <div className="md:w-1/2 bg-neutral-50 p-8 md:p-12">
          <div className="mb-8">
            <div className="mb-4 text-orange-500">
              <Sunburst className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-medium tracking-tight text-neutral-900">
              {isSignup ? "Get started" : "Welcome back"}
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              {isSignup
                ? "Create your SkillProof account."
                : "Sign in with your email or Google account."}
            </p>
          </div>

          {children}

          <p className="mt-6 text-center text-sm text-neutral-600">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-neutral-900 underline">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New to SkillProof?{" "}
                <Link href="/signup" className="font-medium text-neutral-900 underline">
                  Create an account
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
