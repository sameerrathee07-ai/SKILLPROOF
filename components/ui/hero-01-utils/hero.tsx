"use client";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

export type AvatarList = {
  image: string;
};

type HeroSectionProps = {
  avatarList?: AvatarList[];
};

function HeroSection({}: HeroSectionProps = {}) {
  return (
    <section>
      <div className="w-full h-full relative">
        <div className="relative w-full pt-8 md:pt-20 pb-12 md:pb-16 before:absolute before:w-full before:h-full before:bg-gradient-to-r before:from-slate-100 before:via-white before:to-slate-100 before:rounded-3xl before:top-12 before:blur-3xl before:-z-10 dark:before:from-slate-900 dark:before:via-black dark:before:to-slate-800 dark:before:rounded-3xl dark:before:blur-3xl dark:before:-z-10">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col max-w-5xl mx-auto gap-8">
              <div className="relative flex flex-col text-center items-center sm:gap-6 gap-4">
                <motion.h1
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="lg:text-7xl md:text-6xl text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100"
                >
                  Building verified talent with{" "}
                  <span className="font-serif italic font-normal text-slate-700 dark:text-slate-300">
                    measurable proof
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                  className="text-base sm:text-lg font-normal max-w-2xl text-muted-foreground"
                >
                  SkillProof validates candidate abilities with deterministic scoring,
                  calibrated benchmarks, and automated proposal evaluations for forward-thinking teams.
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="flex items-center justify-center pt-2"
              >
                <a href="/problems" aria-label="Browse Challenges">
                  <Button className="relative text-sm font-medium rounded-lg h-11 px-8 group transition-all duration-300 w-fit cursor-pointer flex items-center gap-2">
                    <span>Get Started</span>
                    <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
