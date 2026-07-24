"use client";

import { motion } from "motion/react";
import type { Variants } from "motion/react";

interface TTypingAnimation {
  text: string;
  className?: string;
}

export const TypingAnimation = ({ text, className }: TTypingAnimation) => {
  const container: Variants = {
    animate: { transition: { staggerChildren: 0.025 } },
    exit: { transition: { staggerChildren: 0.015, staggerDirection: -1 } },
    initial: {},
  };

  const child: Variants = {
    animate: {
      filter: "blur(0px)",
      opacity: 1,
      transition: {
        filter: { duration: 0.4 },
        opacity: { duration: 0.25 },
        y: { damping: 20, stiffness: 80, type: "spring" },
      },
      y: 0,
    },
    exit: {
      filter: "blur(12px)",
      opacity: 0,
      transition: {
        filter: { duration: 0.3 },
        opacity: { duration: 0.2 },
        y: { damping: 20, stiffness: 80, type: "spring" },
      },
      y: -10,
    },
    initial: {
      filter: "blur(12px)",
      opacity: 0,
      y: 10,
    },
  };

  return (
    <motion.h3
      className={className}
      variants={container}
      initial="initial"
      animate="animate"
    >
      {[...text].map((char, index) => (
        <motion.span
          key={index}
          variants={child}
          style={{ display: "inline-block" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.h3>
  );
};
