"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import { OAUTH_ROLE_COOKIE, type OAuthRole } from "./oauth-role";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "SOLVER" | "POSTER" | "ADMIN";
  tokens: number;
  credibilityScore: number;
  image?: string | null;
  age?: number | null;
  company?: string | null;
  bio?: string | null;
  headline?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, image?: string | null) => Promise<boolean>;
  signup: (data: { name: string; email: string; role: "SOLVER" | "POSTER"; image?: string | null }) => Promise<boolean>;
  logout: () => void;
  signInWithGoogle: (role: OAuthRole) => Promise<void>;
  updateUser: (data: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  signInWithGoogle: async () => {},
  updateUser: () => {},
});

const AUTH_STORAGE_KEY = "skillproof_auth_user";

function AuthInternal({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [localUser, setLocalUser] = useState<AuthUser | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Clear the legacy hardcoded account older builds persisted for every visitor.
        if (parsed?.id === "solver_default") {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        } else {
          setLocalUser(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load local auth", e);
    } finally {
      setLocalLoading(false);
    }
  }, []);

  // NextAuth authenticated session takes precedence
  let activeUser: AuthUser | null = localUser;
  if (status === "authenticated" && session?.user) {
    activeUser = {
      // Local storage only holds profile extras (bio, age, company); the
      // server session must win for identity and authorization fields.
      ...(localUser || {}),
      id: session.user.id,
      name: session.user.name || "Authenticated User",
      email: session.user.email || "",
      role: session.user.role || "SOLVER",
      tokens: session.user.tokens ?? 50,
      credibilityScore: session.user.credibilityScore ?? 1.0,
      image: session.user.image,
    };
  }

  const isLoading = status === "loading" ? true : localLoading;

  const login = async (email: string, image?: string | null) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...(image ? { image } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Login failed");
        return false;
      }
      setLocalUser(data.user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
      return true;
    } catch (e) {
      console.error(e);
      alert("Network error during login");
      return false;
    }
  };

  const signup = async (data: { name: string; email: string; role: "SOLVER" | "POSTER"; image?: string | null }) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        alert(resData.error || "Signup failed");
        return false;
      }
      setLocalUser(resData.user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(resData.user));
      return true;
    } catch (e) {
      console.error(e);
      alert("Network error during signup");
      return false;
    }
  };

  const logout = () => {
    // Clear the server session cookie too; otherwise the localStorage-only logout leaves a live session.
    void fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setLocalUser(null);
    if (status === "authenticated") {
      signOut({ callbackUrl: "/login" });
    } else {
      router.push("/login");
    }
  };

  const signInWithGoogle = async (role: OAuthRole) => {
    document.cookie = `${OAUTH_ROLE_COOKIE}=${role}; Path=/; Max-Age=600; SameSite=Lax`;
    await signIn("google", { callbackUrl: "/problems" });
  };

  const updateUser = (data: Partial<AuthUser>) => {
    setLocalUser((prev) => {
      const base = activeUser || prev || ({
        id: "local_user_" + Date.now(),
        name: "SkillProof User",
        email: "user@skillproof.local",
        role: "SOLVER",
        tokens: 50,
        credibilityScore: 1.0,
      } as AuthUser);
      const updated: AuthUser = { ...base, ...data };
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to persist user profile update", e);
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user: activeUser,
        loading: isLoading,
        login,
        signup,
        logout,
        signInWithGoogle,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthInternal>{children}</AuthInternal>
    </SessionProvider>
  );
}

export const useAuth = () => useContext(AuthContext);
