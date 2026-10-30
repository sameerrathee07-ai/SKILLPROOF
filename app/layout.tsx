import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { MainContent } from "@/components/MainContent";

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
          <MainContent>
            {children}
          </MainContent>
        </AuthProvider>

        <SiteFooter />
      </body>
    </html>
  );
}
