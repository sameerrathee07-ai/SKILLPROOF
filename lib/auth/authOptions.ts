import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, tokens: true, credibilityScore: true },
        });
        if (dbUser) {
          token.role = (dbUser.role as "SOLVER" | "POSTER" | "ADMIN") || "SOLVER";
          token.tokens = dbUser.tokens ?? 50;
          token.credibilityScore = dbUser.credibilityScore ?? 1.0;
        }
      }

      if (trigger === "update" && session) {
        if (session.role) token.role = session.role;
        if (typeof session.tokens === "number") token.tokens = session.tokens;
        if (typeof session.credibilityScore === "number") {
          token.credibilityScore = session.credibilityScore;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "SOLVER" | "POSTER" | "ADMIN") || "SOLVER";
        session.user.tokens = (token.tokens as number) ?? 50;
        session.user.credibilityScore = (token.credibilityScore as number) ?? 1.0;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "skillproof_development_secret_32_chars_long_minimum",
};
