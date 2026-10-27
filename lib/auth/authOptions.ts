import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { OAUTH_ROLE_COOKIE, parseOAuthRole } from "./oauth-role";

export const authOptions: NextAuthOptions = {
  // @next-auth/prisma-adapter's types predate Prisma 7's client; the runtime interface it uses is unchanged.
  adapter: PrismaAdapter(prisma as unknown as Parameters<typeof PrismaAdapter>[0]),
  providers: [
    GoogleProvider({
      // Server-only env values; never inline OAuth credentials here.
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // Local email signup never verifies the address; auto-linking would let
      // an attacker pre-register a victim's email and absorb their Google login.
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        if (trigger === "signUp") {
          const selectedRole = parseOAuthRole(cookies().get(OAUTH_ROLE_COOKIE)?.value);
          if (selectedRole) {
            await prisma.user.update({
              where: { id: user.id },
              data: { role: selectedRole },
            });
          }
        }

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
  secret: process.env.NEXTAUTH_SECRET,
};
