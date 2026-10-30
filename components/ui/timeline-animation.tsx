"use client";

import { motion } from "motion/react";
import type { ReactNode, RefObject } from "react";

const TAGS = {
  div: motion.div,
  h2: motion.h2,
  p: motion.p,
  span: motion.span,
} as const;

type Tag = keyof typeof TAGS;

interface TimelineContentProps {
  as?: Tag;
  animationNum?: number;
  timelineRef?: RefObject<HTMLDivElement>;
  customVariants?: unknown;
  className?: string;
  children: ReactNode;
}

/**
 * Staggered reveal used by the pricing section. `timelineRef` and
 * `customVariants` are accepted for API parity; the reveal triggers on scroll.
 */
export function TimelineContent({
  as = "div",
  animationNum = 0,
  className,
  children,
}: TimelineContentProps) {
  const Tag = TAGS[as];

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: animationNum * 0.15, duration: 0.5 }}
    >
      {children}
    </Tag>
  );
}
