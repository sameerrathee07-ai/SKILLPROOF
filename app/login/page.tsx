"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/hero-01-utils/header";
import { GradientBars } from "@/components/ui/gradient-bars-background";
import { ShieldCheck, Mail, ArrowRight, Camera, Upload, X } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { safeNextPath } from "@/lib/auth/next-path";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleRole, setGoogleRole] = useState<"SOLVER" | "POSTER">("SOLVER");
  const [authError, setAuthError] = useState<string | null>(null);
  const { login, signInWithGoogle } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef(false);
  const googleRef = useRef(false);

  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get("error");
    if (!error) return;
    setAuthError(
      error === "OAuthAccountNotLinked"
        ? "An account with this email already exists. Sign in with email instead."
        : "Google sign-in failed. Please try again."
    );
  }, []);

  const nextPath = () => safeNextPath(window.location.search);

  const handleDeviceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      alert("Image size should be under 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitRef.current || !email.trim()) return;
    submitRef.current = true;
    setSubmitting(true);
    try {
      const success = await login(email, image);
      if (success) {
        router.push(nextPath());
      }
    } finally {
      submitRef.current = false;
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (googleRef.current) return;
    googleRef.current = true;
    setGoogleLoading(true);
    try {
      await signInWithGoogle(googleRole);
    } catch (e) {
      console.error(e);
      alert("Failed to initiate Google sign-in.");
    } finally {
      googleRef.current = false;
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[rgb(10,10,10)] text-slate-100 overflow-hidden dark">
      {/* Background with Sky Blue theme */}
      <GradientBars
        numBars={15}
        gradientFrom="rgb(14, 165, 233)"
        gradientTo="transparent"
        className="opacity-40"
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md bg-slate-900/90 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
            {/* Brand Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 items-center justify-center shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Sign In to SkillProof
              </h1>
              <p className="text-xs text-slate-400">
                Secure deterministic verification for solvers and education organizations
              </p>
            </div>

            {/* Google OAuth Section */}
            <div className="space-y-3">
              {authError ? (
                <p
                  role="alert"
                  className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200"
                >
                  {authError}
                </p>
              ) : null}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  New Google Account Role
                </label>
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-950/80 p-1 border border-white/5">
                  <button
                    type="button"
                    onClick={() => setGoogleRole("SOLVER")}
                    className={`rounded-md px-3 py-2 text-xs font-bold transition-all ${
                      googleRole === "SOLVER"
                        ? "bg-sky-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Solver
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoogleRole("POSTER")}
                    className={`rounded-md px-3 py-2 text-xs font-bold transition-all ${
                      googleRole === "POSTER"
                        ? "bg-sky-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Poster
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Existing Google accounts keep their current role.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-white/10 bg-slate-800/80 hover:bg-slate-700/80 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>
                  {googleLoading
                    ? "Connecting..."
                    : `Continue with Google as ${googleRole === "SOLVER" ? "Solver" : "Poster"}`}
                </span>
              </button>

              <div className="relative flex items-center justify-center py-2">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-slate-900 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                  or sign in with email
                </span>
                <div className="border-t border-white/10 w-full" />
              </div>
            </div>

            {/* Email & Optional Device PFP Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Optional Profile Picture from Device */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Profile Picture (From Device)
                  </label>
                  <span className="text-[10px] text-slate-500">Optional</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-800 border-2 border-white/20 flex items-center justify-center shrink-0">
                    {image ? (
                      <img
                        src={image}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleDeviceImageChange}
                      className="hidden"
                      id="device-pfp-login"
                    />
                    <label
                      htmlFor="device-pfp-login"
                      className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white border border-white/10 transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{image ? "Change Photo" : "Choose File"}</span>
                    </label>

                    {image && (
                      <button
                        type="button"
                        onClick={() => {
                          setImage(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@organization.edu"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-white/10 bg-slate-950/80 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition flex items-center justify-center gap-2"
              >
                <span>{submitting ? "Signing In..." : "Sign In with Email"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* Signup Link */}
            <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-bold text-sky-400 hover:text-sky-300 transition">
                Create an Account
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
