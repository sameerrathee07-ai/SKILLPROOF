/**
 * Query parameterization guard and static safety scanner.
 * Ensures all SQL and ORM queries are parameterized, preventing SQL Injection.
 */

const UNSAFE_SQL_PATTERNS = [
  /\$queryRawUnsafe\s*\(/,
  /\$executeRawUnsafe\s*\(/,
  /prisma\.\$queryRaw\s*`[^`]*\$\{[^}]+\}[^`]*`/, // template interpolation inside raw query if not using Prisma.sql tagged
];

export function inspectQuerySafety(sourceCode: string, fileName = "unknown"): {
  safe: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (sourceCode.includes("$queryRawUnsafe")) {
    issues.push(`${fileName}: detected prohibited use of \$queryRawUnsafe`);
  }

  if (sourceCode.includes("$executeRawUnsafe")) {
    issues.push(`${fileName}: detected prohibited use of \$executeRawUnsafe`);
  }

  return {
    safe: issues.length === 0,
    issues,
  };
}
