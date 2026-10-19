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
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string) => Promise<boolean>;
  signup: (data: { name: string; email: string; role: "SOLVER" | "POSTER" }) => Promise<boolean>;
  logout: () => void;
  signInWithGoogle: (role: OAuthRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  signInWithGoogle: async () => {},
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

  const login = async (email: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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

  const signup = async (data: { name: string; email: string; role: "SOLVER" | "POSTER" }) => {
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

  return (
    <AuthContext.Provider
      value={{
        user: activeUser,
        loading: isLoading,
        login,
        signup,
        logout,
        signInWithGoogle,
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
