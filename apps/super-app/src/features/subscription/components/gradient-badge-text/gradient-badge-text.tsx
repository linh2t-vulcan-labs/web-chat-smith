import type { ReactNode } from "react";
import React from "react";

import { compositeStyles } from "@/utils/commons/styles";

const GradientBadgeText = ({
  content,
  className,
}: {
  content: ReactNode;
  className?: string;
}) => (
  <span
    className={compositeStyles(
      "bg-gradient-green text-footnoteM-highlight bg-clip-text text-transparent",
      className
    )}
  >
    {content}
  </span>
);

export default GradientBadgeText;
