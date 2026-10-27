"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/ui/hero-01-utils/header";
import { GradientBars } from "@/components/ui/gradient-bars-background";

const FULL_WIDTH_ROUTES = [
  "/",
  "/problems",
  "/admin/calibrate",
  "/about",
  "/services",
  "/pricing",
  "/collaborate",
  "/profile",
  "/tokens",
  "/login",
  "/signup",
];

const SHELL_ROUTES: Array<{ test: (pathname: string) => boolean; color: string }> = [
  { test: (pathname) => pathname === "/privacy", color: "rgb(148, 163, 184)" },
  { test: (pathname) => pathname === "/terms", color: "rgb(139, 92, 246)" },
  {
    test: (pathname) => /^\/problems\/[^/]+\/pitch\/result$/.test(pathname),
    color: "rgb(16, 185, 129)",
  },
  {
    test: (pathname) => /^\/problems\/[^/]+\/pitch$/.test(pathname),
    color: "rgb(59, 130, 246)",
  },
  { test: (pathname) => pathname === "/org/problems/new", color: "rgb(20, 184, 166)" },
  { test: (pathname) => pathname === "/org/dashboard", color: "rgb(245, 158, 11)" },
  {
    test: (pathname) => /^\/org\/problems\/[^/]+\/proposals$/.test(pathname),
    color: "rgb(245, 158, 11)",
  },
  {
    test: (pathname) => /^\/solvers\/[^/]+$/.test(pathname),
    color: "rgb(180, 83, 9)",
  },
  {
    test: (pathname) => /^\/org\/proposals\/[^/]+$/.test(pathname),
    color: "rgb(14, 165, 233)",
  },
];

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shell = SHELL_ROUTES.find((route) => route.test(pathname));

  if (shell) {
    return (
      <div className="relative flex-1 w-full overflow-hidden bg-[rgb(10,10,10)] text-slate-100 dark print:bg-white print:text-slate-900">
        <GradientBars
          numBars={15}
          gradientFrom={shell.color}
          className="opacity-40 no-print"
        />
        <div className="relative z-10">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:max-w-none print:p-0">
            {children}
          </main>
        </div>
      </div>
    );
  }

  const isFullWidth = FULL_WIDTH_ROUTES.includes(pathname);

  return (
    <main
      className={
        isFullWidth
          ? "flex-1 w-full"
          : "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
      }
    >
      {children}
    </main>
  );
}
