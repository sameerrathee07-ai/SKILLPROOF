/**
 * API Response trimming and data minimization.
 * Ensures internal database secrets, password hashes, and unauthorized contact data
 * are never leaked to API callers.
 */

export interface SafeUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  tokens?: number;
  credibilityScore?: number;
  image?: string | null;
  age?: number | null;
  company?: string | null;
  bio?: string | null;
  headline?: string | null;
  createdAt?: Date | string;
}

/**
 * Trims a User database record to safe fields for the authenticated owner.
 */
export function trimUserForOwner(user: any): SafeUser {
  if (!user || typeof user !== "object") return user;
  const {
    id,
    name,
    email,
    role,
    tokens,
    credibilityScore,
    image,
    age,
    company,
    bio,
    headline,
    createdAt,
  } = user;

  return {
    id,
    name: name ?? null,
    email: email ?? null,
    role: role || "SOLVER",
    tokens: tokens ?? 50,
    credibilityScore: credibilityScore ?? 1.0,
    image: image ?? null,
    age: age ?? null,
    company: company ?? null,
    bio: bio ?? null,
    headline: headline ?? null,
    createdAt,
  };
}

/**
 * Trims a User record for public/cross-user viewing (hiding private email).
 */
export function trimUserForPublic(user: any): Omit<SafeUser, "email"> {
  const safe = trimUserForOwner(user);
  const { email, ...publicFields } = safe;
  return publicFields;
}
