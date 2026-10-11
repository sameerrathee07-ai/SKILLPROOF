"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, User, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { SlideButton } from "@/components/SlideButton";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"SOLVER" | "POSTER">("SOLVER");
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    const success = await signup({ name, email, role });
    setSubmitting(false);
    if (success) {
      router.push("/problems");
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-xl bg-slate-900 text-white items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs text-slate-500">
            Join SkillProof as an Education Problem Poster or Student Solver
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aryan Verma"
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aryan@college.edu"
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Role
            </label>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setRole("SOLVER")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === "SOLVER"
                    ? "border-slate-900 bg-slate-900 text-white font-bold shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="text-xs">Student Solver</div>
                <div className={`text-[10px] mt-0.5 ${role === "SOLVER" ? "text-slate-300" : "text-slate-500"}`}>
                  Pitch solutions & earn credibility
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("POSTER")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === "POSTER"
                    ? "border-slate-900 bg-slate-900 text-white font-bold shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="text-xs">Org Poster</div>
                <div className={`text-[10px] mt-0.5 ${role === "POSTER" ? "text-slate-300" : "text-slate-500"}`}>
                  Post education challenges
                </div>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <SlideButton
              type="submit"
              disabled={submitting}
              variant="primary"
              icon={<ArrowRight className="w-4 h-4" />}
              className="w-full py-3 text-sm font-bold"
            >
              {submitting ? "Creating Account..." : "Create Account & Start"}
            </SlideButton>
          </div>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-slate-900 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
