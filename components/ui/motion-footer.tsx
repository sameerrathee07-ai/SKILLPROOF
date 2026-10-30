"use client";

import * as React from "react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

// Register ScrollTrigger safely for React
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------------------
// 1. INLINE STYLES (light theme, matches the slate/white site shell)
// -------------------------------------------------------------------------
const STYLES = `
.cinematic-footer-wrapper {
  -webkit-font-smoothing: antialiased;

  --pill-bg-1: #ffffff;
  --pill-bg-2: #f8fafc;
  --pill-shadow: rgba(15, 23, 42, 0.12);
  --pill-highlight: rgba(255, 255, 255, 0.9);
  --pill-inset-shadow: rgba(15, 23, 42, 0.04);
  --pill-border: rgba(15, 23, 42, 0.10);

  --pill-bg-1-hover: #ffffff;
  --pill-bg-2-hover: #f1f5f9;
  --pill-border-hover: rgba(15, 23, 42, 0.24);
  --pill-shadow-hover: rgba(15, 23, 42, 0.18);
  --pill-highlight-hover: rgba(255, 255, 255, 1);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(220, 38, 38, 0.5)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px rgba(220, 38, 38, 0.8)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 40s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

.footer-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, rgba(15, 23, 42, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(15, 23, 42, 0.05) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(15, 23, 42, 0.10) 0%,
    rgba(148, 163, 184, 0.16) 40%,
    transparent 70%
  );
}

.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
      0 10px 30px -10px var(--pill-shadow),
      inset 0 1px 1px var(--pill-highlight),
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow:
      0 20px 40px -10px var(--pill-shadow-hover),
      inset 0 1px 1px var(--pill-highlight-hover);
  color: #0f172a;
}

.footer-giant-bg-text {
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(15, 23, 42, 0.08);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.10) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

.footer-text-glow {
  background: linear-gradient(180deg, #0f172a 0%, rgba(15, 23, 42, 0.5) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px rgba(15, 23, 42, 0.12));
}
`;

// -------------------------------------------------------------------------
// 2. MAGNETIC BUTTON PRIMITIVE (Zero Dependency)
// -------------------------------------------------------------------------
export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const h = rect.width / 2;
          const w = rect.height / 2;
          const x = e.clientX - rect.left - h;
          const y = e.clientY - rect.top - w;

          gsap.to(element, {
            x: x * 0.4,
            y: y * 0.4,
            rotationX: -y * 0.15,
            rotationY: x * 0.15,
            scale: 1.05,
            ease: "power2.out",
            duration: 0.4,
          });
        };

        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: "elastic.out(1, 0.3)",
            duration: 1.2,
          });
        };

        element.addEventListener("mousemove", handleMouseMove as any);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          element.removeEventListener("mousemove", handleMouseMove as any);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);

      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node: HTMLElement) => {
          (localRef as any).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as any).current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

// -------------------------------------------------------------------------
// 3. MAIN COMPONENT
// -------------------------------------------------------------------------
const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    <span>Deterministic Quality Gates</span> <span className="text-slate-400">✦</span>
    <span>Vetted Proposals Only</span> <span className="text-slate-400">✦</span>
    <span>Token-Based Submissions</span> <span className="text-slate-400">✦</span>
    <span>Public Solver Portfolios</span> <span className="text-slate-400">✦</span>
    <span>Zero Spam Introductions</span> <span className="text-slate-400">✦</span>
  </div>
);

export function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current) return;

    // React strict mode compatible GSAP context cleanup
    const ctx = gsap.context(() => {
      // Background Parallax
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      // Staggered Content Reveal
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 40%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* The curtain wrapper clips the fixed footer until you scroll into it. */}
      <div
        ref={wrapperRef}
        className="relative h-screen w-full"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <footer className="cinematic-footer-wrapper fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-background text-foreground">
          <div className="footer-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px] pointer-events-none z-0" />
          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />

          <div
            ref={giantTextRef}
            aria-hidden="true"
            className="footer-giant-bg-text absolute -bottom-[5vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none"
          >
            SKILLPROOF
          </div>

          <div
            aria-hidden="true"
            className="absolute top-12 left-0 w-full overflow-hidden border-y border-slate-200 bg-background/60 backdrop-blur-md py-4 z-10 -rotate-2 scale-110 shadow-2xl"
          >
            <div className="flex w-max animate-footer-scroll-marquee text-xs md:text-sm font-bold tracking-[0.3em] text-slate-500 uppercase">
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-20 w-full max-w-5xl mx-auto">
            <h2
              ref={headingRef}
              className="text-5xl md:text-8xl font-black footer-text-glow tracking-tighter mb-12 text-center"
            >
              Ready to begin?
            </h2>

            <div ref={linksRef} className="flex flex-col items-center gap-6 w-full">
              <div className="flex flex-wrap justify-center gap-4 w-full">
                <MagneticButton
                  as={Link}
                  href="/problems"
                  className="footer-glass-pill px-10 py-5 rounded-full text-slate-900 font-bold text-sm md:text-base flex items-center gap-3 group"
                >
                  Browse challenges
                </MagneticButton>

                <MagneticButton
                  as={Link}
                  href="/org/problems/new"
                  className="footer-glass-pill px-10 py-5 rounded-full text-slate-900 font-bold text-sm md:text-base flex items-center gap-3 group"
                >
                  Post a challenge
                </MagneticButton>
              </div>

              <div className="flex flex-wrap justify-center gap-3 md:gap-6 w-full mt-2">
                <MagneticButton
                  as={Link}
                  href="/privacy"
                  className="footer-glass-pill px-6 py-3 rounded-full text-slate-500 font-medium text-xs md:text-sm hover:text-slate-900"
                >
                  Privacy Policy
                </MagneticButton>
                <MagneticButton
                  as={Link}
                  href="/terms"
                  className="footer-glass-pill px-6 py-3 rounded-full text-slate-500 font-medium text-xs md:text-sm hover:text-slate-900"
                >
                  Terms of Service
                </MagneticButton>
                <MagneticButton
                  as={Link}
                  href="/pricing"
                  className="footer-glass-pill px-6 py-3 rounded-full text-slate-500 font-medium text-xs md:text-sm hover:text-slate-900"
                >
                  Pricing
                </MagneticButton>
              </div>
            </div>
          </div>

          <div className="relative z-20 w-full pb-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-slate-500 text-[10px] md:text-xs font-semibold tracking-widest uppercase order-2 md:order-1">
              © 2026 SkillProof. All rights reserved.
            </div>

            <div className="footer-glass-pill px-6 py-3 rounded-full flex items-center gap-2 order-1 md:order-2 cursor-default border-slate-200/70">
              <span className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">Crafted with</span>
              <span className="animate-footer-heartbeat text-sm md:text-base text-red-600">❤</span>
              <span className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">by</span>
              <span className="text-slate-900 font-black text-xs md:text-sm tracking-normal ml-1">SkillProof</span>
            </div>

            <MagneticButton
              as="button"
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center text-slate-500 hover:text-slate-900 group order-3"
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5 transform group-hover:-translate-y-1.5 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </MagneticButton>
          </div>
        </footer>
      </div>
    </>
  );
}
