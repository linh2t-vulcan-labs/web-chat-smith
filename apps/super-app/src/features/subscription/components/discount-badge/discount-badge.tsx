import React from "react";

import type { TDiscountBadgeProps } from "./types";

const DiscountBadge: React.FC<TDiscountBadgeProps> = ({
  saveLabel,
  percent,
}) => (
  <span className="rounded-half bg-neutral-150 bg-gradient-green px-small-0.75 text-text-general-inverse relative inline-flex w-max items-center justify-center">
    <span className="pe-small-0.25 text-bodyM-highlight hidden md:inline-block">
      {saveLabel}{" "}
    </span>
    <span className="inline-block md:hidden">-</span>
    <span className="text-bodyM-highlight">{percent}</span>%
  </span>
);

export default DiscountBadge;
