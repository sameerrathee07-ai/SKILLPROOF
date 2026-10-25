"use client";

import { useState } from "react";
import Header from "@/components/ui/hero-01-utils/header";
import { GradientBars } from "@/components/ui/gradient-bars-background";
import { Handshake, Mail, Building, User, Check, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CollaboratePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [type, setType] = useState<"COACHING_CENTER" | "TUITION_ACADEMY" | "COLLEGE_DEPT" | "OTHER">("COLLEGE_DEPT");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate collaborative intake
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="relative min-h-screen bg-[rgb(10,10,10)] text-slate-100 overflow-hidden dark">
      {/* Background with Rose / Coral scheme */}
      <GradientBars numBars={15} gradientFrom="rgb(244, 63, 94)" className="opacity-40" />

      <div className="relative z-10">
        <Header />

        <main className="max-w-4xl mx-auto px-4 py-8 md:py-16 space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Handshake className="w-4 h-4" />
              <span>Partner Onboarding</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              Let&apos;s Collaborate
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Launch a closed quality-gated pilot with your academy, coaching network, or engineering department.
            </p>
          </div>

          {submitted ? (
            <div className="p-10 rounded-2xl bg-slate-950/80 border border-emerald-500/30 backdrop-blur-xl text-center space-y-4 max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <Check className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-white">Collaboration Inquiry Received</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Thank you, <strong>{name}</strong>. Our team will review your institution&apos;s requirements for <strong>{organization}</strong> and reach out within 24 hours to schedule a sandbox walkthrough.
              </p>
              <div className="pt-4">
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="border-white/20 text-white rounded-lg cursor-pointer"
                >
                  Send another inquiry
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-8 sm:p-10 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-xl shadow-2xl max-w-2xl mx-auto space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="collab-name" className="text-xs text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Your Name *</span>
                    </Label>
                    <Input
                      id="collab-name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Jordan Ellis"
                      className="mt-1.5 bg-slate-900/80 border-white/10 text-white placeholder:text-slate-600"
                    />
                  </div>

                  <div>
                    <Label htmlFor="collab-email" className="text-xs text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Work Email *</span>
                    </Label>
                    <Input
                      id="collab-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jordan@university.edu"
                      className="mt-1.5 bg-slate-900/80 border-white/10 text-white placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="collab-org" className="text-xs text-slate-300 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>Organization / Department *</span>
                    </Label>
                    <Input
                      id="collab-org"
                      required
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="School of Computer Science"
                      className="mt-1.5 bg-slate-900/80 border-white/10 text-white placeholder:text-slate-600"
                    />
                  </div>

                  <div>
                    <Label htmlFor="collab-type" className="text-xs text-slate-300">
                      Institution Type
                    </Label>
                    <select
                      id="collab-type"
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="mt-1.5 w-full h-10 px-3 rounded-md bg-slate-900/80 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="COLLEGE_DEPT">College / University Department</option>
                      <option value="COACHING_CENTER">Coaching Center / Training Institute</option>
                      <option value="TUITION_ACADEMY">Tuition / Prep Academy</option>
                      <option value="OTHER">Other Tech Organization</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="collab-msg" className="text-xs text-slate-300">
                    What challenges or friction points do you want to solve?
                  </Label>
                  <textarea
                    id="collab-msg"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="We receive hundreds of student project pitches per semester with high noise and want to pilot an automated 6.0 quality gate..."
                    className="mt-1.5 w-full rounded-md bg-slate-900/80 border border-white/10 p-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white h-11 rounded-lg font-semibold shadow-lg shadow-rose-600/20 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? "Submitting..." : "Submit Collaboration Inquiry"}</span>
                </Button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
