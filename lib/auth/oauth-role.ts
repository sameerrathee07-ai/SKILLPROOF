export const OAUTH_ROLE_COOKIE = "skillproof_oauth_role";

export type OAuthRole = "SOLVER" | "POSTER";

export function parseOAuthRole(value: string | undefined): OAuthRole | null {
  return value === "SOLVER" || value === "POSTER" ? value : null;
}
