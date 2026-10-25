"use client";

import { usePathname } from "next/navigation";

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

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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

