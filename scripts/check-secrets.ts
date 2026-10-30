/**
 * Scans tracked files for leaked API keys, tokens, or credentials.
 * Run with: tsx scripts/check-secrets.ts
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SECRET_PATTERNS: { name: string; regex: RegExp }[] = [
  { name: "RSA/EC Private Key", regex: /-----BEGIN (RSA|EC|OPENSSH|DSA|PGP)?\s?PRIVATE KEY-----/ },
  { name: "AWS Access Key", regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/ },
  { name: "GitHub Personal Access Token", regex: /gh[pousr]_[A-Za-z0-9_]{36,255}/ },
  { name: "Generic Secret Key Assignment", regex: /(?:api[_-]?key|secret[_-]?key|auth[_-]?token)\s*[:=]\s*["'][a-zA-Z0-9_\-]{32,}["']/i },
  { name: "Database URL with live password", regex: /postgres(?:ql)?:\/\/[a-zA-Z0-9_\-]+:[a-zA-Z0-9_\-!@#$%^&*()+=]{8,}@/ },
];

const IGNORED_FILES = new Set([
  ".env.example",
  "package-lock.json",
  "yarn.lock",
  "scripts/check-secrets.ts",
]);

export function scanContent(content: string, filePath: string): string[] {
  const issues: string[] = [];
  for (const { name, regex } of SECRET_PATTERNS) {
    if (regex.test(content)) {
      issues.push(`${filePath}: matched pattern "${name}"`);
    }
  }
  return issues;
}

export function runSecretScan(): { passed: boolean; issues: string[] } {
  const issues: string[] = [];
  try {
    const trackedFiles = execSync("git ls-files", { encoding: "utf-8" })
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f && !IGNORED_FILES.has(f) && !f.endsWith(".png") && !f.endsWith(".ico") && !f.endsWith(".svg"));

    for (const file of trackedFiles) {
      if (!fs.existsSync(file)) continue;
      const content = fs.readFileSync(file, "utf-8");
      const fileIssues = scanContent(content, file);
      issues.push(...fileIssues);
    }
  } catch (error) {
    console.error("Error inspecting tracked files:", error);
    return { passed: false, issues: ["Failed to inspect git tracked files."] };
  }

  return { passed: issues.length === 0, issues };
}

if (process.argv[1]?.endsWith("check-secrets.ts")) {
  const { passed, issues } = runSecretScan();
  if (!passed) {
    console.error("\x1b[31m[SECURITY ALERT] Potential secrets found in repository:\x1b[0m");
    issues.forEach((issue) => console.error(`  - ${issue}`));
    process.exit(1);
  } else {
    console.log("\x1b[32m[OK] No secrets found in tracked repository files.\x1b[0m");
  }
}
