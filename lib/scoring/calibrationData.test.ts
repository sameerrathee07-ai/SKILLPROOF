import { describe, it, expect } from "vitest";
import { CALIBRATION_DATASET, runCalibrationSuite } from "@/lib/scoring/calibrationData";

describe("CALIBRATION_DATASET", () => {
  it("contains both strong and weak samples across sectors", () => {
    const strong = CALIBRATION_DATASET.filter((c) => c.type === "STRONG");
    const weak = CALIBRATION_DATASET.filter((c) => c.type === "WEAK");
    expect(strong.length).toBeGreaterThan(0);
    expect(weak.length).toBeGreaterThan(0);
    expect(CALIBRATION_DATASET.length).toBe(strong.length + weak.length);
  });

  it("has unique ids", () => {
    const ids = CALIBRATION_DATASET.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("runCalibrationSuite", () => {
  const report = runCalibrationSuite();

  it("reports correct totals", () => {
    expect(report.totalPitches).toBe(CALIBRATION_DATASET.length);
    expect(report.strongPitches + report.weakPitches).toBe(report.totalPitches);
  });

  it("passes every calibration case (val4Success)", () => {
    expect(report.val4Success).toBe(true);
    expect(report.results.every((r) => r.testPassed)).toBe(true);
  });

  it("scores every strong pitch at or above the gate", () => {
    const strong = report.results.filter((r) => r.type === "STRONG");
    expect(strong.length).toBeGreaterThan(0);
    for (const r of strong) {
      expect(r.actualPassed).toBe(true);
      expect(r.actualKnockedOut).toBe(false);
      expect(r.actualScore).toBeGreaterThanOrEqual(6.0);
    }
  });

  it("rejects every weak pitch (knockout or low score)", () => {
    const weak = report.results.filter((r) => r.type === "WEAK");
    expect(weak.length).toBeGreaterThan(0);
    for (const r of weak) {
      expect(r.actualPassed).toBe(false);
      expect(r.actualScore).toBeLessThan(6.0);
    }
  });

  it("keeps knockedOut and failed buckets consistent", () => {
    const knockedOut = report.results.filter((r) => r.actualKnockedOut).length;
    const failed = report.results.filter((r) => !r.actualPassed && !r.actualKnockedOut).length;
    expect(report.knockedOutPitches).toBe(knockedOut);
    expect(report.failedPitches).toBe(failed);
    expect(report.passedPitches + knockedOut + failed).toBe(report.totalPitches);
  });
});