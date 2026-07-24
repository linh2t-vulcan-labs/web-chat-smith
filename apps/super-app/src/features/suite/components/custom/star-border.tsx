"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";

import { cn } from "@/features/suite/utils/classnames";

// Ported verbatim from reactbits (StarBorder, JS + Tailwind variant). The
// `animate-star-movement-top/bottom` utilities + keyframes are registered in suite-styles.css.
// `innerClassName` lets callers replace the demo inner surface (must stay opaque so the moving
// glow only shows at the edges as a border).
interface StarBorderProps {
  as?: ElementType;
  className?: string;
  color?: string;
  speed?: string;
  thickness?: number;
  innerClassName?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

const DEFAULT_INNER =
  "rounded-[20px] border border-gray-800 bg-gradient-to-b from-black to-gray-900 px-[26px] py-[16px] text-center text-[16px] text-white";

const StarBorder = ({
  as: Component = "button",
  className = "",
  color = "white",
  speed = "6s",
  thickness = 1,
  innerClassName,
  children,
  ...rest
}: StarBorderProps) => (
  <Component
    className={`rounded-v1-large relative inline-block overflow-hidden ${className}`}
    style={{
      padding: `${thickness}px 0`,
      ...rest.style,
    }}
    {...rest}
  >
    <div
      className="animate-star-movement-bottom absolute end-[-250%] bottom-[-11px] z-0 h-[50%] w-[300%] rounded-full opacity-70"
      style={{
        animationDuration: speed,
        background: `radial-gradient(circle, ${color}, transparent 10%)`,
      }}
    />
    <div
      className="animate-star-movement-top absolute top-[-10px] start-[-250%] z-0 h-[50%] w-[300%] rounded-full opacity-70"
      style={{
        animationDuration: speed,
        background: `radial-gradient(circle, ${color}, transparent 10%)`,
      }}
    />
    <div
      className={cn(
        "py-v1-structural-content-tight relative z-1",
        innerClassName ?? DEFAULT_INNER
      )}
    >
      {children}
    </div>
  </Component>
);

export default StarBorder;
