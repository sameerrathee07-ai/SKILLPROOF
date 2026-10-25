"use client";

import { usePathname } from "next/navigation";

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <main
      className={
        isHome
          ? "flex-1 w-full"
          : "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
      }
    >
      {children}
    </main>
  );
}
