"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "SOLVER" | "POSTER" | "ADMIN";
  tokens: number;
  credibilityScore: number;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string) => Promise<boolean>;
  signup: (data: { name: string; email: string; role: "SOLVER" | "POSTER" }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
});

const AUTH_STORAGE_KEY = "skillproof_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default demo fallback if fresh browser session
        const defaultUser: AuthUser = {
          id: "solver_default",
          name: "Aryan Verma",
          email: "aryan@solver.skillproof.dev",
          role: "SOLVER",
          tokens: 50,
          credibilityScore: 1.2,
        };
        setUser(defaultUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultUser));
      }
    } catch (e) {
      console.error("Failed to load local auth", e);
    } finally {
      setLoading(false);
    }
  }, []);

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
      setUser(data.user);
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
      setUser(resData.user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(resData.user));
      return true;
    } catch (e) {
      console.error(e);
      alert("Network error during signup");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
