"use client";

import { useState } from "react";
import { 
  Sliders, 
  CheckCircle2, 
  XCircle, 
  RotateCw, 
  ChevronDown, 
  ChevronRight,
  BookOpen
} from "lucide-react";
import { CalibrationReport } from "@/lib/scoring/calibrationData";
import Header from "@/components/ui/hero-01-utils/header";
import { GradientBars } from "@/components/ui/gradient-bars-background";

export default function CalibrationAdminPage() {
  const [report, setReport] = useState<CalibrationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchCalibration = async () => {
    setRunning(true);
    setLoading(true);
    try {
      const res = await fetch("/api/calibrate");
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRunning(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="relative min-h-screen bg-[rgb(10,10,10)] text-slate-100 overflow-hidden dark">
      {/* Background with Amber scheme */}
      <GradientBars numBars={15} gradientFrom="rgb(245, 158, 11)" className="opacity-40" />

      <div className="relative z-10">
        <Header />

        <main className="space-y-8 pb-16 max-w-6xl mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
                <Sliders className="w-3.5 h-3.5" />
                <span>PRD Phase 1: Blocking Gate Calibration</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Calibration Test Suite (VAL-1 to VAL-6)
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-3xl">
                Verifies the deterministic 6.0/10.0 quality gate against hand-crafted strong and deliberately weak pitches across education, hospitality, and financial services.
              </p>
            </div>

            <button
              type="button"
              disabled={running}
              onClick={fetchCalibration}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${running ? "animate-spin" : ""}`} />
              <span>{running ? "Running Suite..." : report ? "Re-run Calibration Suite" : "Run Calibration Suite"}</span>
            </button>
          </div>

          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-slate-400 font-medium">Running calibration test suite...</p>
            </div>
          ) : report ? (
            <div className="space-y-8">
              {/* VAL-4 Verification Status Banner */}
              <div
                className={`p-6 rounded-xl border backdrop-blur-xl shadow-lg ${
                  report.val4Success
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-100"
                    : "bg-rose-950/40 border-rose-500/30 text-rose-100"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-xl mt-0.5 ${
                      report.val4Success ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                    }`}
                  >
                    {report.val4Success ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <XCircle className="w-6 h-6" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-white">
                      {report.val4Success
                        ? "VAL-4 Calibration Exit Criteria Passed (100% Accuracy)"
                        : "Calibration Failed: Adjust Keyword Sets or Caps (VAL-5)"}
                    </h2>
                    <p className="text-xs leading-relaxed text-slate-300 max-w-3xl">
                      {report.val4Success
                        ? "All strong sample pitches scored ≥ 6.0, and 100% of deliberately weak pitches either triggered Tier 1 Binary Knockouts or scored below 6.0. Phase 1 blocking gate is completely satisfied."
                        : "One or more pitches were misclassified across the 6.0 threshold. Review the failing assertions below."}
                    </p>
                    <div className="text-[11px] font-mono text-slate-400 pt-1">
                      Last verified: {new Date(report.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Test Statistics Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 backdrop-blur-xl shadow-md text-center">
                  <div className="text-2xl font-black text-white">{report.totalPitches}</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">Total Test Pitches</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/20 backdrop-blur-xl shadow-md text-center">
                  <div className="text-2xl font-black text-emerald-400">
                    {report.passedPitches} / {report.strongPitches}
                  </div>
                  <div className="text-xs text-emerald-300 mt-1 font-medium">
                    Strong Pitches Passed (≥ 6.0)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-rose-500/20 backdrop-blur-xl shadow-md text-center">
                  <div className="text-2xl font-black text-rose-400">
                    {report.knockedOutPitches}
                  </div>
                  <div className="text-xs text-rose-300 mt-1 font-medium">
                    Binary Knockouts Triggered
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/20 backdrop-blur-xl shadow-md text-center">
                  <div className="text-2xl font-black text-amber-400">
                    {report.failedPitches}
                  </div>
                  <div className="text-xs text-amber-300 mt-1 font-medium">
                    Tier 2 Scored &lt; 6.0
                  </div>
                </div>
              </div>

              {/* Calibration Test Matrix Table */}
              <div className="bg-slate-950/70 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg overflow-hidden">
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">Sample Pitch Calibration Matrix</h3>
                    <p className="text-xs text-slate-400">
                      Inspect how each strong or weak pitch evaluated through the two-tier gate
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                    Deterministic Engine: Active
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-bold border-b border-white/10">
                      <tr>
                        <th className="py-3 px-4">Test Pitch</th>
                        <th className="py-3 px-3">Sector</th>
                        <th className="py-3 px-3">Type</th>
                        <th className="py-3 px-3">Score</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">VAL-4 Assertion</th>
                        <th className="py-3 px-3 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {report.results.map((res) => {
                        const isExpanded = expandedId === res.id;
                        return (
                          <tr key={res.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-white">
                              <div>{res.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{res.id}</div>
                            </td>

                            <td className="py-3.5 px-3">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 border border-white/10 text-slate-300">
                                {res.sector}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 font-semibold">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  res.type === "STRONG"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                }`}
                              >
                                {res.type}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 font-bold text-white">
                              {res.actualScore.toFixed(1)} / 10
                            </td>

                            <td className="py-3.5 px-3">
                              {res.actualKnockedOut ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                  Knocked Out
                                </span>
                              ) : res.actualPassed ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Passed (≥ 6.0)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  Failed (&lt; 6.0)
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-3">
                              {res.testPassed ? (
                                <span className="inline-flex items-center text-emerald-400 font-bold gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>PASS</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-rose-400 font-bold gap-1">
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>FAIL</span>
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => toggleExpand(res.id)}
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                                title="Inspect dimensional breakdown"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Expanded Breakdown Drawer if clicked */}
              {expandedId && (
                <div className="p-6 rounded-xl bg-slate-950/80 border border-white/10 shadow-lg space-y-4">
                  {(() => {
                    const target = report.results.find((r) => r.id === expandedId);
                    if (!target) return null;
                    const dims = target.scoreBreakdown.dimensions;

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div>
                            <h4 className="font-bold text-white text-sm">
                              Detailed Diagnostics: {target.name}
                            </h4>
                            <span className="text-xs text-slate-400 font-mono">{target.id}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setExpandedId(null)}
                            className="text-xs text-slate-400 hover:text-white"
                          >
                            Close
                          </button>
                        </div>

                        {/* Feedback if any */}
                        {target.feedback.length > 0 && (
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                            <strong className="block font-bold">Actionable Diagnostic Feedback:</strong>
                            <ul className="list-disc list-inside space-y-0.5">
                              {target.feedback.map((f, i) => (
                                <li key={i}>{f}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 6 Dimensions Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                          {Object.entries(dims).map(([key, val]: any) => (
                            <div key={key} className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-1">
                              <div className="flex items-center justify-between font-bold text-white">
                                <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                                <span className="text-amber-400">
                                  {val.score} / {val.maxScore}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400">{val.feedback}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* PRD Reference Section */}
              <div className="p-6 rounded-xl bg-slate-950/70 border border-white/10 backdrop-blur-xl text-white space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm">
                    Reference: SkillProof PRD Requirements VAL-1 through VAL-6
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Phase 1 Gate Calibration blocks every subsequent phase. By demonstrating 100% test accuracy on strong pitches scoring ≥ 6.0 and weak pitches scoring &lt; 6.0 or knocking out, SkillProof establishes an empirical, defensible quality threshold before running closed pilots with education partners.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/15 bg-slate-950/40 p-12 text-center backdrop-blur-xl">
              <div className="mx-auto w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-amber-400 mb-4">
                <Sliders className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1">No Calibration Benchmark Executed</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                The calibration gate starts clean with no preloaded or prefilled benchmark values. Run the benchmark on demand to test VAL-1 through VAL-6 against the scoring engine.
              </p>
              <button
                type="button"
                disabled={running}
                onClick={fetchCalibration}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${running ? "animate-spin" : ""}`} />
                <span>Run Calibration Suite</span>
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
