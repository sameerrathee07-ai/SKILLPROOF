import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "SOLVER" | "POSTER" | "ADMIN";
      tokens: number;
      credibilityScore: number;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: "SOLVER" | "POSTER" | "ADMIN";
    tokens?: number;
    credibilityScore?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "SOLVER" | "POSTER" | "ADMIN";
    tokens?: number;
    credibilityScore?: number;
  }
}
