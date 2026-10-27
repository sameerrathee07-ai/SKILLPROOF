"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Power } from "lucide-react";

export function ProblemStatusToggle({
  problemId,
  status,
}: {
  problemId: string;
  status: "OPEN" | "CLOSED";
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  async function toggleStatus() {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);

    const next = current === "OPEN" ? "CLOSED" : "OPEN";
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`/api/problems/${problemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Unable to update challenge status.");
      }

      setCurrent(next);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === "AbortError"
          ? "The request timed out. Please try again."
          : error instanceof Error
            ? error.message
            : "Unable to update challenge status.";
      alert(message);
    } finally {
      window.clearTimeout(timeout);
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleStatus}
      disabled={saving}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {saving ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Power className="h-3.5 w-3.5" />
      )}
      {current === "OPEN" ? "Close" : "Reopen"}
    </button>
  );
}
