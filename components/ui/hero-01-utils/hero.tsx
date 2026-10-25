"use client";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { ArrowUpRight, Star } from "lucide-react";

export type AvatarList = {
  image: string;
};

type HeroSectionProps = {
  avatarList: AvatarList[];
};

function HeroSection({ avatarList }: HeroSectionProps) {
  return (
    <section>
      <div className="w-full h-full relative">
        <div className="relative w-full pt-8 md:pt-20 pb-6 md:pb-10 before:absolute before:w-full before:h-full before:bg-gradient-to-r before:from-slate-100 before:via-white before:to-slate-100 before:rounded-3xl before:top-12 before:blur-3xl before:-z-10 dark:before:from-slate-900 dark:before:via-black dark:before:to-slate-800 dark:before:rounded-3xl dark:before:blur-3xl dark:before:-z-10">
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
                className="flex items-center flex-col md:flex-row justify-center gap-6 sm:gap-8"
              >
                <a href="/problems" aria-label="Browse Challenges">
                  <Button className="relative text-sm font-medium rounded-lg h-11 px-6 group transition-all duration-300 w-fit cursor-pointer flex items-center gap-2">
                    <span>Get Started</span>
                    <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                </a>
                <div className="flex items-center sm:gap-6 gap-3">
                  <ul className="flex flex-row items-center">
                    {avatarList.map((avatar, index) => (
                      <li key={index} className="-mr-2.5 z-10 transition-transform hover:scale-110">
                        <img
                          src={avatar.image}
                          alt="Avatar"
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover border-2 border-background"
                        />
                      </li>
                    ))}
                  </ul>
                  <div className="gap-1 flex flex-col items-start">
                    <div className="flex gap-1" aria-label="5 star rating">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <p className="sm:text-sm text-xs font-medium text-muted-foreground">
                      Trusted by engineering leaders
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
