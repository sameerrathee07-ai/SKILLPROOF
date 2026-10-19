"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Coins } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { TOKEN_TIERS } from "@/lib/tokens";

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

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Buy Tokens
          </h1>
          <p className="text-sm text-slate-600">
            Sign in to choose a token pack.
          </p>
          <Link
            href="/login?next=/tokens"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="space-y-2">
        <Link
          href="/problems"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to problems
        </Link>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Buy Tokens
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Each pitch submission costs one token. Pick a pack below to record
          your interest. Payments are not live yet.
        </p>
      </div>

      {confirmedTokens !== null ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-2">
          <div className="inline-flex h-10 w-10 rounded-lg bg-white text-emerald-600 items-center justify-center border border-emerald-200">
            <Coins className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-emerald-900">Interest recorded</h2>
          <p className="text-sm text-emerald-800">
            Payment integration is coming. Your interest in the{" "}
            {confirmedTokens}-token pack is recorded.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-4">
          {TOKEN_TIERS.map((tier) => (
            <div
              key={tier.tier}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
            >
              <div className="inline-flex h-10 w-10 rounded-lg bg-slate-900 text-white items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black text-slate-900">
                  {tier.tokens} tokens
                </p>
                <p className="text-sm font-semibold text-slate-600">
                  Rs {tier.amount}
                </p>
              </div>
              <button
                type="button"
                onClick={() => buyTokens(tier.tier)}
                disabled={submittingTier !== null}
                className="w-full px-4 py-2.5 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 transition"
              >
                {submittingTier === tier.tier
                  ? "Recording..."
                  : `Choose ${tier.tokens}-token pack`}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
