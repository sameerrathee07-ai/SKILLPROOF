"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, PlusCircle, CheckCircle2, Sliders, BookOpen, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { SlideButton } from "@/components/SlideButton";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks = [
    { href: "/problems", label: "Challenges", icon: BookOpen },
    { href: "/org/problems/new", label: "Post Problem", icon: PlusCircle },
    { href: "/admin/calibrate", label: "Gate Calibration", icon: Sliders },
  ];

  const initials = user
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "SP";

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                SkillProof
              </span>
              <span className="text-[10px] font-semibold text-brand-600 tracking-wider uppercase -mt-1">
                Education Wedge
              </span>
            </div>
          </Link>
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Deterministic Gate: 6.0 / 10.0
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden sm:flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-100 text-brand-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Badge / Sign In */}
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              {/* Credibility & Tokens Pill */}
              <div className="hidden lg:flex items-center space-x-2 bg-slate-50 border border-slate-200/80 rounded-full px-3 py-1">
                <span className="text-xs font-semibold text-slate-500">Credibility:</span>
                <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                  ★ {user.credibilityScore?.toFixed(2) || "1.00"}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-xs font-semibold text-slate-500">Tokens:</span>
                <span className="inline-flex items-center text-xs font-bold text-indigo-600">
                  🪙 {user.tokens ?? 50}
                </span>
              </div>

              {/* Profile info & Logout */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {user.role === "POSTER" ? "Org Poster" : "Student Solver"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <SlideButton variant="primary" icon={<LogIn className="w-3.5 h-3.5" />}>
                  Sign In
                </SlideButton>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
