"use client";

import Lottie from "lottie-react";
import type { ComponentProps } from "react";

import { cn } from "@/features/suite/utils/classnames";

import LoadingAnim from "../../assets/jsons/Loading_Anim.json";

type SuiteLoadingIconProps = ComponentProps<"div"> & {
  height?: number;
  loop?: boolean;
  width?: number;
};

export function SuiteLoadingIcon({
  className,
  height = 32,
  loop = true,
  width = 32,
  ...props
}: SuiteLoadingIconProps) {
  return (
    <div
      className={cn("rounded-v1-pill size-8 overflow-hidden", className)}
      {...props}
    >
      <Lottie
        animationData={LoadingAnim}
        loop={loop}
        height={height}
        width={width}
      />
    </div>
  );
}
