import { runCalibrationSuite } from "../lib/scoring/calibrationData";

console.log("==========================================================");
console.log(" SkillProof Gate Calibration Test Suite (VAL-1 to VAL-6)");
console.log(" Pure Deterministic Two-Tier Quality Scoring Engine");
console.log("==========================================================\n");

const report = runCalibrationSuite();

console.log(
  `Total Test Cases: ${report.totalPitches} | Strong Pitches: ${report.strongPitches} | Weak Pitches: ${report.weakPitches}`
);
console.log("--------------------------------------------------------------------------------------------------------");
console.log(
  String("ID").padEnd(25) +
  String("Sector").padEnd(16) +
  String("Type").padEnd(10) +
  String("Score").padEnd(10) +
  String("Status").padEnd(14) +
  String("Assertion").padEnd(10)
);
console.log("--------------------------------------------------------------------------------------------------------");

for (const res of report.results) {
  const statusStr = res.actualKnockedOut
    ? "KNOCKED OUT"
    : res.actualPassed
    ? "PASSED (>=6.0)"
    : "FAILED (<6.0)";
  const passStr = res.testPassed ? "✓ PASS" : "✗ FAIL";

  console.log(
    res.id.padEnd(25) +
    res.sector.padEnd(16) +
    res.type.padEnd(10) +
    `${res.actualScore}/10`.padEnd(10) +
    statusStr.padEnd(14) +
    passStr.padEnd(10)
  );

  if (res.feedback.length > 0 && !res.actualPassed) {
    console.log(`   ↳ Feedback: ${res.feedback[0]}`);
  }
}

console.log("--------------------------------------------------------------------------------------------------------");
console.log(`\nVAL-4 Verification Summary:`);
console.log(`- 100% Strong Pitches Scored >= 6.0: ${report.results.filter(r => r.type === "STRONG").every(r => r.testPassed) ? "YES (PASSED)" : "NO"}`);
console.log(`- 100% Weak Pitches Scored < 6.0 or Knocked Out: ${report.results.filter(r => r.type === "WEAK").every(r => r.testPassed) ? "YES (PASSED)" : "NO"}`);
console.log(`- Overall Calibration Gate Success (VAL-4 & VAL-6): ${report.val4Success ? "PASSED (100% ACCURACY)" : "FAILED"}`);

if (!report.val4Success) {
  console.error("\nCalibration failed! Review misclassified pitches and adjust keyword sets/caps.");
  process.exit(1);
} else {
  console.log("\n>>> Calibration Exit Criteria MET: Gate is calibrated and blocking Phase 1 is satisfied.\n");
  process.exit(0);
}
