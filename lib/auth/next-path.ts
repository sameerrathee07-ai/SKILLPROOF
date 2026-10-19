/**
 * Login redirect target: same-site paths only, so a crafted ?next= cannot bounce users off-site.
 * Browsers treat backslashes as scheme slashes, so "/\evil.com" is also external.
 */
export function safeNextPath(search: string): string {
  const next = new URLSearchParams(search).get("next");
  return next &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.includes("\\")
    ? next
    : "/problems";
}
