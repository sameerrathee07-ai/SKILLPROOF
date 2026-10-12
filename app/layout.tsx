import Link from "next/link";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/lib/auth/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillProof: Quality-Gated Education Problem Solving",
  description:
    "Deterministic, explainable quality gate connecting student solvers with coaching centers, tuition providers, and college departments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </AuthProvider>

        <footer className="no-print border-t border-slate-200/80 bg-white/60 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-slate-700">SkillProof Platform</span>: Focused Single-Sector Wedge: Education
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <Link href="/privacy" className="hover:text-slate-800 transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-slate-800 transition-colors">
                Terms and Conditions
              </Link>
              <span>•</span>
              <span className="text-slate-400">Zero LLM Dependency</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
