"use client";

import { motion } from "motion/react";
import { memo, useMemo } from "react";

import { compositeStyles } from "@/utils/commons/styles";

import type { TTextShimmerProps } from "./type";

function TextShimmer({
  children,
  as: Component = "p",
  className,
  duration = 2,
  spread = 2,
  theme = "dark",
}: TTextShimmerProps) {
  const lines = useMemo(
    () => (typeof children === "string" ? children.split("\n") : [children]),
    [children]
  );

  return (
    <Component className={className}>
      {lines.map((line, index) => {
        const delay = (duration / 2) * index;

        return (
          <motion.span
            key={index}
            className={compositeStyles(
              "relative block bg-size-[250%_100%,auto] bg-clip-text text-transparent",
              theme === "light"
                ? "[--base-color:#b5b5b5] [--base-gradient-color:#000]"
                : "[--base-color:#8b8b8b] [--base-gradient-color:#000] dark:[--base-color:#a1a1aa]",
              "[background-repeat:no-repeat,padding-box] [--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))]",
              "dark:[--base-color:#71717a] dark:[--base-gradient-color:#ffffff] dark:[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))]"
            )}
            initial={{ backgroundPosition: "100% center" }}
            animate={{ backgroundPosition: "0% center" }}
            transition={{
              delay,
              duration,
              ease: "linear",
              repeat: Infinity,
            }}
            style={
              {
                "--spread": `${line.length * spread}px`,
                backgroundImage: `var(--bg), linear-gradient(var(--base-color), var(--base-color))`,
              } as React.CSSProperties
            }
          >
            {line}
          </motion.span>
        );
      })}
    </Component>
  );
}

export default memo(TextShimmer);
