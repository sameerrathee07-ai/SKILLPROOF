"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, ArrowRight, UserCheck } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { SlideButton } from "@/components/SlideButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    const success = await login(email);
    setSubmitting(false);
    if (success) {
      router.push("/problems");
    }
  };

  const quickLogin = async (demoEmail: string) => {
    setSubmitting(true);
    const success = await login(demoEmail);
    setSubmitting(false);
    if (success) {
      router.push("/problems");
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-xl bg-slate-900 text-white items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In to SkillProof
          </h1>
          <p className="text-xs text-slate-500">
            Local developer login (Google Auth coming in production)
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aryan@solver.skillproof.dev"
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <SlideButton
            type="submit"
            disabled={submitting}
            variant="primary"
            icon={<ArrowRight className="w-4 h-4" />}
            className="w-full py-3 text-sm font-bold"
          >
            {submitting ? "Signing In..." : "Sign In & Enter"}
          </SlideButton>
        </form>

        {/* Quick Demo Accounts */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            One-Click Quick Login
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => quickLogin("aryan@solver.skillproof.dev")}
              className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition"
            >
              <div className="font-bold text-slate-800">Aryan Verma</div>
              <div className="text-[10px] text-emerald-600 font-semibold">Student Solver</div>
            </button>

            <button
              type="button"
              onClick={() => quickLogin("sharma@apexcoaching.edu")}
              className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition"
            >
              <div className="font-bold text-slate-800">Director Sharma</div>
              <div className="text-[10px] text-blue-600 font-semibold">Org Poster</div>
            </button>
          </div>
        </div>

        {/* Signup Link */}
        <div className="text-center text-xs text-slate-500 pt-2">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-bold text-slate-900 hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
