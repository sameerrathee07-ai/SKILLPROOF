"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/ui/hero-01-utils/header";
import { GradientBars } from "@/components/ui/gradient-bars-background";
import { ArrowLeft, Coins, CheckCircle, Sparkles, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { TOKEN_TIERS } from "@/lib/tokens";
import { Button } from "@/components/ui/button";

export default function TokensPage() {
  const { user } = useAuth();
  const [submittingTier, setSubmittingTier] = useState<string | null>(null);
  const [confirmedTokens, setConfirmedTokens] = useState<number | null>(null);

  const buyTokens = async (tier: string) => {
    setSubmittingTier(tier);
    try {
      const res = await fetch("/api/tokens/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Could not record your interest");
        return;
      }
      setConfirmedTokens(data.purchase.tokens);
    } catch (e) {
      console.error(e);
      alert("Network error while recording your interest");
    } finally {
      setSubmittingTier(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-[rgb(10,10,10)] text-slate-100 overflow-hidden dark">
      {/* Background with Warm Amber/Gold scheme */}
      <GradientBars
        numBars={15}
        gradientFrom="rgb(245, 158, 11)"
        gradientTo="transparent"
        className="opacity-40"
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 max-w-5xl mx-auto px-4 py-8 md:py-12 w-full">
          {!user ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-full max-w-md bg-slate-900/90 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl text-center space-y-6">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Coins className="w-7 h-7" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    Buy Tokens
                  </h1>
                  <p className="text-sm text-slate-400">
                    Sign in to choose a token pack and fund your challenge submissions with verified deterministic review.
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <Link href="/login?next=/tokens" className="w-full">
                    <Button className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2">
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to Buy Tokens</span>
                    </Button>
                  </Link>
                  <Link href="/signup?next=/tokens" className="w-full">
                    <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 rounded-lg">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div className="space-y-1">
                  <Link
                    href="/problems"
                    className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-white transition mb-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    Back to Challenges
                  </Link>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 ml-2">
                    <Sparkles className="w-3 h-3" />
                    <span>Submission Fuel</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                    Buy Tokens
                  </h1>
                  <p className="text-sm text-slate-400 max-w-2xl">
                    Each pitch submission costs 1 token. Select a package below to record your reservation.
                  </p>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-white/10 text-xs font-semibold text-amber-300">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>Current Balance: {user.tokens ?? 50} Tokens</span>
                </div>
              </div>

              {confirmedTokens !== null ? (
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 space-y-3 backdrop-blur-xl">
                  <div className="inline-flex h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 items-center justify-center border border-emerald-500/20">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Interest Recorded</h2>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                    Payment integration will open shortly. Your reservation for the{" "}
                    <span className="font-bold text-emerald-400">{confirmedTokens}-token pack</span> has been logged to your account.
                  </p>
                  <Button
                    onClick={() => setConfirmedTokens(null)}
                    variant="outline"
                    className="mt-2 border-slate-700 text-slate-200 hover:bg-slate-800 rounded-lg text-xs"
                  >
                    Select Another Pack
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-3 gap-6">
                  {TOKEN_TIERS.map((tier) => (
                    <div
                      key={tier.tier}
                      className="group rounded-2xl border border-white/10 bg-slate-950/70 backdrop-blur-xl p-6 sm:p-8 space-y-6 flex flex-col justify-between hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5"
                    >
                      <div className="space-y-4">
                        <div className="inline-flex h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 items-center justify-center group-hover:scale-110 transition-transform">
                          <Coins className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-3xl font-black text-white tracking-tight">
                            {tier.tokens}{" "}
                            <span className="text-lg font-normal text-slate-400">Tokens</span>
                          </p>
                          <p className="text-sm font-semibold text-amber-400 mt-1">
                            Rs {tier.amount}
                          </p>
                        </div>
                        <ul className="text-xs text-slate-400 space-y-2 pt-2 border-t border-white/5">
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            {tier.tokens} pitch submissions
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Deterministic scoring included
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Tokens never expire
                          </li>
                        </ul>
                      </div>

                      <Button
                        type="button"
                        onClick={() => buyTokens(tier.tier)}
                        disabled={submittingTier !== null}
                        className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white border border-white/10 font-bold py-2.5 rounded-lg text-xs transition duration-200"
                      >
                        {submittingTier === tier.tier
                          ? "Recording..."
                          : `Choose ${tier.tokens}-token pack`}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
