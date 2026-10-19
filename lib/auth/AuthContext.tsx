"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";

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
  signInWithGoogle: () => Promise<void>;
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
        setLocalUser(JSON.parse(stored));
      } else {
        const defaultUser: AuthUser = {
          id: "solver_default",
          name: "Aryan Verma",
          email: "aryan@solver.skillproof.dev",
          role: "SOLVER",
          tokens: 50,
          credibilityScore: 1.2,
        };
        setLocalUser(defaultUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultUser));
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
      id: session.user.id || (session.user as any).sub || "google_user",
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

  const signInWithGoogle = async () => {
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
