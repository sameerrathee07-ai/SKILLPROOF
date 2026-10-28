"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/ui/hero-01-utils/header";
import { GradientBars } from "@/components/ui/gradient-bars-background";
import { useAuth, type AuthUser } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Building, 
  Briefcase, 
  Image as ImageIcon, 
  Check, 
  Save, 
  Star, 
  Coins, 
  Sparkles, 
  Globe, 
  Calendar,
  Lock,
  LogIn,
  Upload
} from "lucide-react";

export default function ProfilePage() {
  const { user, loading, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [image, setImage] = useState(user?.image || "");
  const [role, setRole] = useState<"SOLVER" | "POSTER" | "ADMIN">(user?.role || "SOLVER");
  const [age, setAge] = useState<string>(user?.age ? String(user.age) : "24");
  const [company, setCompany] = useState(user?.company || "");
  const [headline, setHeadline] = useState(user?.headline || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"PROFILE" | "SUBMISSIONS">("PROFILE");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.image !== undefined) setImage(user.image || "");
      if (user.role) setRole(user.role);
      if (user.age !== undefined && user.age !== null) setAge(String(user.age));
      if (user.company !== undefined && user.company !== null) setCompany(user.company);
      if (user.headline !== undefined && user.headline !== null) setHeadline(user.headline);
      if (user.bio !== undefined && user.bio !== null) setBio(user.bio);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab !== "SUBMISSIONS" || !user) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    setSubmissionsLoading(true);
    setSubmissionsError("");

    fetch("/api/users/submissions", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load submissions.");
        return response.json();
      })
      .then((data) => setSubmissions(Array.isArray(data) ? data : []))
      .catch((error) => {
        if (error?.name === "AbortError") {
          setSubmissionsError("The request timed out. Your saved profile is unaffected. Try again.");
        } else {
          setSubmissionsError("Could not load your submissions. Try again.");
        }
      })
      .finally(() => {
        clearTimeout(timeout);
        setSubmissionsLoading(false);
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [activeTab, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name,
      email,
      image: image.trim() || null,
      age: age ? Number(age) : null,
      company: company.trim() || null,
      headline: headline.trim() || null,
      bio: bio.trim() || null,
    };

    // Update local React state / localStorage
    updateUser(payload);

    // Persist to database
    try {
      await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Failed to sync profile to backend", err);
    }

    setIsSubmitting(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SP";

  const submissionBadge = (submission: any) => {
    if (!submission.passed) {
      return {
        label: "Gate Not Passed",
        className: "border-rose-500/20 bg-rose-500/10 text-rose-400",
      };
    }

    const status = submission.status || "SUBMITTED";
    if (status === "SHORTLISTED") {
      return {
        label: "Shortlisted",
        className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
      };
    }
    if (status === "ACCEPTED") {
      return {
        label: "Accepted",
        className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
      };
    }
    if (status === "DECLINED") {
      return {
        label: "Declined",
        className: "border-rose-500/20 bg-rose-500/10 text-rose-400",
      };
    }

    return {
      label: "Under Review",
      className: "border-slate-500/20 bg-slate-500/10 text-slate-300",
    };
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[rgb(10,10,10)] text-slate-100 overflow-hidden dark">
        <GradientBars numBars={15} gradientFrom="rgb(59, 130, 246)" className="opacity-40" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen bg-[rgb(10,10,10)] text-slate-100 overflow-hidden dark">
        <GradientBars numBars={15} gradientFrom="rgb(59, 130, 246)" className="opacity-40" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md bg-slate-900/90 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl text-center space-y-6">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Sign In Required
                </h1>
                <p className="text-sm text-slate-400">
                  Profile management and personal credentials are tied to your verified account. Please sign in to view and edit your profile.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Link href="/login?next=/profile" className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Access Profile</span>
                  </Button>
                </Link>
                <Link href="/signup?next=/profile" className="w-full">
                  <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 rounded-lg">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[rgb(10,10,10)] text-slate-100 overflow-hidden dark">
      {/* Background with Royal Blue scheme */}
      <GradientBars numBars={15} gradientFrom="rgb(59, 130, 246)" className="opacity-40" />

      <div className="relative z-10">
        <Header />

        <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          {/* Top Banner / Header */}
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Account & Identification</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                User Profile
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Customize your profile photo, identification badges, affiliation, and role preferences.
              </p>
            </div>

            {/* Credibility & Tokens Pill */}
            <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-lg p-2 text-xs">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                <Star className="w-3.5 h-3.5 fill-emerald-400" />
                <span>{user?.credibilityScore?.toFixed(2) || "1.00"} Cred</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                <Coins className="w-3.5 h-3.5" />
                <span>{user?.tokens ?? 50} Tokens</span>
              </div>
            </div>
          </div>

          {user?.role === "SOLVER" && (
            <div className="mb-6 flex items-center gap-2 border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab("PROFILE")}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                  activeTab === "PROFILE"
                    ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                    : "text-slate-400 hover:text-white border border-transparent"
                }`}
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("SUBMISSIONS")}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                  activeTab === "SUBMISSIONS"
                    ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                    : "text-slate-400 hover:text-white border border-transparent"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                My Submissions
              </button>
            </div>
          )}

          <form onSubmit={handleSave} className={activeTab === "PROFILE" ? "space-y-10" : "hidden"}>
            {/* Avatar Section */}
            <div className="rounded-xl border border-white/10 bg-slate-950/70 backdrop-blur-xl p-6 sm:p-10 space-y-8">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-400" />
                <span>Profile Picture (PFP)</span>
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Avatar Preview */}
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500/40 bg-slate-900 flex items-center justify-center text-white text-2xl font-black shadow-xl">
                    {image ? (
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  {image && (
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-500 transition"
                      title="Clear photo"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex-1 w-full space-y-4">
                  {/* Upload from Device */}
                  <div>
                    <Label className="text-xs text-slate-300 block mb-1.5">
                      Upload from Device
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleDeviceImageUpload}
                        className="hidden"
                        id="profile-device-pfp"
                      />
                      <label
                        htmlFor="profile-device-pfp"
                        className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose Photo from Device</span>
                      </label>
                      {image && (
                        <button
                          type="button"
                          onClick={() => {
                            setImage("");
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition border border-rose-900/30"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal & Professional Info */}
            <div className="rounded-xl border border-white/10 bg-slate-950/70 backdrop-blur-xl p-6 sm:p-10 space-y-8">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                <span>Personal & Professional Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7">
                <div>
                  <Label htmlFor="name" className="text-xs text-slate-300">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 bg-slate-900/80 border-white/10 text-white placeholder:text-slate-600"
                  />
                </div>

                <div>
                  <Label htmlFor="age" className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Age</span>
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    min={15}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="24"
                    className="mt-1.5 bg-slate-900/80 border-white/10 text-white placeholder:text-slate-600"
                  />
                </div>

                <div>
                  <Label htmlFor="company" className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>Company / University / Organization</span>
                  </Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corp or Tech Institute"
                    className="mt-1.5 bg-slate-900/80 border-white/10 text-white placeholder:text-slate-600"
                  />
                </div>

                <div>
                  <Label htmlFor="role" className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>Platform Role</span>
                  </Label>
                  <select
                    id="role"
                    value={role}
                    disabled
                    className="mt-1.5 w-full h-10 px-3 rounded-md bg-slate-900/80 border border-white/10 text-slate-300 text-sm opacity-80 cursor-not-allowed"
                  >
                    <option value="SOLVER">Student Solver (Pitches & Challenges)</option>
                    <option value="POSTER">Organization Poster (Posts Problems)</option>
                    <option value="ADMIN">Administrator (Gate Calibration)</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Roles are assigned at signup. Contact SkillProof support to change yours.
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="headline" className="text-xs text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>Professional Headline</span>
                </Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Senior Full-Stack Engineer | Systems Thinker"
                  className="mt-1.5 bg-slate-900/80 border-white/10 text-white placeholder:text-slate-600"
                />
              </div>

              <div>
                <Label htmlFor="bio" className="text-xs text-slate-300">
                  Biography & Problem Solving Focus
                </Label>
                <textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell clients and peers about your background, projects, and specialties..."
                  className="mt-1.5 w-full rounded-md bg-slate-900/80 border border-white/10 p-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-4 pt-6">
              {saved && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg animate-in fade-in">
                  <Check className="w-4 h-4" />
                  <span>Profile updated and top-left avatar refreshed!</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 h-11 flex items-center gap-2 rounded-lg font-semibold shadow-lg shadow-blue-500/20 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
              </Button>
            </div>
          </form>

          {activeTab === "SUBMISSIONS" && user?.role === "SOLVER" && (
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-white">My Submissions</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Every proposal you have submitted, its gate score, and the organization review state.
                </p>
              </div>

              {submissionsLoading ? (
                <div className="rounded-lg border border-white/10 bg-slate-950/70 p-6 text-sm text-slate-400">
                  Loading your submissions...
                </div>
              ) : submissionsError ? (
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-300">
                  {submissionsError}
                </div>
              ) : submissions.length === 0 ? (
                <div className="rounded-lg border border-white/10 bg-slate-950/70 p-6">
                  <p className="text-sm font-medium text-white">No submissions yet.</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Browse open challenges and submit your first proposal.
                  </p>
                  <Link
                    href="/problems"
                    className="mt-4 inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Browse challenges
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((submission) => {
                    const badge = submissionBadge(submission);
                    return (
                      <Link
                        key={submission.id}
                        href={`/problems/${submission.problemId}`}
                        className="block rounded-lg border border-white/10 bg-slate-950/70 p-5 transition hover:border-white/20 hover:bg-slate-900/80"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-white">
                              {submission.problem?.title || "Challenge"}
                            </h3>
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                              <Building className="w-3.5 h-3.5" />
                              {submission.problem?.organization?.name || "Organization"}
                              {submission.problem?.organization?.type
                                ? ` / ${submission.problem.organization.type.replaceAll("_", " ")}`
                                : ""}
                            </p>
                          </div>
                          <span
                            className={`inline-flex w-fit items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-amber-400" />
                            Gate score {Number(submission.score || 0).toFixed(1)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(submission.createdAt).toLocaleDateString()}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" />
                            {submission.problem?.frictionCategory?.replaceAll("_", " ") || "General"}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
