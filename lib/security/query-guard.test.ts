import { describe, it, expect } from "vitest";
import { inspectQuerySafety } from "./query-guard";

describe("Query Parameterization Guard", () => {
  it("passes safe code with standard Prisma models", () => {
    const safeCode = `
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });
    `;
    const result = inspectQuerySafety(safeCode, "user.service.ts");
    expect(result.safe).toBe(true);
    expect(result.issues.length).toBe(0);
  });

  it("flags unsafe raw SQL execution", () => {
    const unsafeCode = `
      await prisma.$queryRawUnsafe(\`SELECT * FROM User WHERE email = '\${email}'\`);
    `;
    const result = inspectQuerySafety(unsafeCode, "unsafe.ts");
    expect(result.safe).toBe(false);
    expect(result.issues[0]).toContain("$queryRawUnsafe");
  });
});
