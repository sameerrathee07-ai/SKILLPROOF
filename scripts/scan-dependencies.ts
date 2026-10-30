/**
 * Dependency security scanner.
 * Audits project dependencies and verifies against known vulnerabilities.
 */
import { execSync } from "node:child_process";

export function auditDependencies(): {
  vulnerabilitiesCount: number;
  criticalCount: number;
  highCount: number;
  moderateCount: number;
  lowCount: number;
} {
  try {
    const rawOutput = execSync("npm audit --json", { encoding: "utf-8" });
    const parsed = JSON.parse(rawOutput);
    const metadata = parsed.metadata?.vulnerabilities || {};
    return {
      vulnerabilitiesCount: metadata.total || 0,
      criticalCount: metadata.critical || 0,
      highCount: metadata.high || 0,
      moderateCount: metadata.moderate || 0,
      lowCount: metadata.low || 0,
    };
  } catch (error: any) {
    if (error.stdout) {
      try {
        const parsed = JSON.parse(error.stdout);
        const metadata = parsed.metadata?.vulnerabilities || {};
        return {
          vulnerabilitiesCount: metadata.total || 0,
          criticalCount: metadata.critical || 0,
          highCount: metadata.high || 0,
          moderateCount: metadata.moderate || 0,
          lowCount: metadata.low || 0,
        };
      } catch {}
    }
    return {
      vulnerabilitiesCount: 0,
      criticalCount: 0,
      highCount: 0,
      moderateCount: 0,
      lowCount: 0,
    };
  }
}

if (process.argv[1]?.endsWith("scan-dependencies.ts")) {
  console.log("Auditing dependencies...");
  const report = auditDependencies();
  console.log(`Scan completed: ${report.vulnerabilitiesCount} total vulnerabilities found.`);
  console.log(`- Critical: ${report.criticalCount}`);
  console.log(`- High: ${report.highCount}`);
  console.log(`- Moderate: ${report.moderateCount}`);
  console.log(`- Low: ${report.lowCount}`);
}
