"use client";

import { motion } from "motion/react";
import React, { useMemo } from "react";
import type { JSX } from "react";

import { cn } from "@/features/suite/utils/classnames";

interface TextShimmerProps {
  children: string;
  as?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
  duration?: number;
  spread?: number;
}

export function TextShimmer({
  children,
  as: Component = "p",
  className,
  style,
  duration = 2,
  spread = 2,
}: TextShimmerProps) {
  // oxlint-disable-next-line react/react-compiler -- dynamically creates a motion component from the `as` prop; component identity must vary with the prop, so it can't be hoisted to module scope like a static component
  const MotionComponent = useMemo(
    () => motion.create(Component as keyof JSX.IntrinsicElements),
    [Component]
  );

  const dynamicSpread = useMemo(
    () => children.length * spread,
    [children, spread]
  );

  return (
    // oxlint-disable-next-line react/react-compiler -- renders the dynamically-created motion component from the `as` prop; component identity must vary with the prop, so it can't be hoisted to module scope like a static component
    <MotionComponent
      className={cn(
        "relative inline-block bg-size-[250%_100%,auto] bg-clip-text",
        "text-transparent [--base-color:#a1a1aa] [--base-gradient-color:#000]",
        "[background-repeat:no-repeat,padding-box] [--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))]",
        "dark:[--base-color:#71717a] dark:[--base-gradient-color:#ffffff] dark:[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))]",
        className
      )}
      initial={{ backgroundPosition: "100% center" }}
      animate={{ backgroundPosition: "0% center" }}
      transition={{
        duration,
        ease: "linear",
        repeat: Infinity,
      }}
      style={
        {
          "--spread": `${dynamicSpread}px`,
          backgroundImage: `var(--bg), linear-gradient(var(--base-color), var(--base-color))`,
          color: "transparent",
          ...style,
        } as React.CSSProperties
      }
    >
      {children}
    </MotionComponent>
  );
}
