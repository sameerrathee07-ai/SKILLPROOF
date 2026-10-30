"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mail, User, Camera, Upload, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { FullScreenAuth, GoogleMark } from "@/components/ui/full-screen-auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const inputClass =
  "w-full rounded-lg border bg-white py-2 pl-10 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [role, setRole] = useState<"SOLVER" | "POSTER">("SOLVER");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signup, signInWithGoogle } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef(false);
  const googleRef = useRef(false);

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Please enter your name.");
      return;
    }
    setNameError("");
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    if (submitRef.current) return;
    submitRef.current = true;
    setSubmitting(true);
    try {
      const success = await signup({ name, email: email.trim(), role, image });
      if (success) {
        router.push("/problems");
      }
    } finally {
      submitRef.current = false;
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (googleRef.current) return;
    googleRef.current = true;
    setGoogleLoading(true);
    try {
      await signInWithGoogle(role);
    } catch (e) {
      console.error(e);
      alert("Failed to initiate Google sign-up.");
    } finally {
      googleRef.current = false;
      setGoogleLoading(false);
    }
  };

  return (
    <FullScreenAuth mode="signup">
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-100 disabled:opacity-50"
        >
          <GoogleMark />
          <span>
            {googleLoading
              ? "Connecting..."
              : `Continue with Google as ${role === "SOLVER" ? "Solver" : "Poster"}`}
          </span>
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            or create with email
          </span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-neutral-700">
              Profile picture (from device)
            </label>
            <span className="text-[10px] text-neutral-400">Optional</span>
          </div>

          <div className="mt-2.5 flex items-center gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-neutral-200 bg-neutral-100">
              {image ? (
                <img src={image} alt="Profile preview" className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-5 w-5 text-neutral-400" />
              )}
            </div>

            <div className="flex flex-1 items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleDeviceImageChange}
                className="hidden"
                id="device-pfp-signup"
              />
              <label
                htmlFor="device-pfp-signup"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-800 transition hover:bg-neutral-100"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>{image ? "Change photo" : "Choose file"}</span>
              </label>

              {image && (
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSignup} noValidate className="space-y-3">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-600"
            >
              Full name
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError("");
                }}
                placeholder="Your full name"
                aria-invalid={!!nameError}
                aria-describedby="name-error"
                className={`${inputClass} ${nameError ? "border-red-500" : "border-neutral-300"}`}
              />
              <User className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
            </div>
            {nameError && (
              <p id="name-error" className="mt-1 text-xs text-red-600">
                {nameError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-600"
            >
              Email address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                placeholder="you@organization.edu"
                aria-invalid={!!emailError}
                aria-describedby="email-error"
                className={`${inputClass} ${emailError ? "border-red-500" : "border-neutral-300"}`}
              />
              <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
            </div>
            {emailError && (
              <p id="email-error" className="mt-1 text-xs text-red-600">
                {emailError}
              </p>
            )}
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-600">
              Platform role
            </span>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { value: "SOLVER", title: "Student solver", hint: "Pitch solutions & earn credibility" },
                  { value: "POSTER", title: "Org poster", hint: "Post education challenges" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value)}
                  className={`rounded-lg border p-3 text-left transition ${
                    role === option.value
                      ? "border-orange-500 bg-orange-50 text-neutral-900 shadow-sm"
                      : "border-neutral-300 bg-white text-neutral-500 hover:bg-neutral-50"
                  }`}
                >
                  <div className="text-xs font-bold">{option.title}</div>
                  <div
                    className={`mt-0.5 text-[10px] ${
                      role === option.value ? "text-orange-700" : "text-neutral-500"
                    }`}
                  >
                    {option.hint}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
          >
            <span>{submitting ? "Creating account..." : "Create account"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </FullScreenAuth>
  );
}
