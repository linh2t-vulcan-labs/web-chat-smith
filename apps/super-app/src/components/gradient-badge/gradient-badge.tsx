import React from "react";

import { compositeStyles } from "@/utils/commons/styles";

import type { GradientBadgeProps } from "./types";

import styles from "./styles.module.scss";

const GradientBadge: React.FC<GradientBadgeProps> = ({
  type = "premium",
  text,
  size = "medium",
  as = "tag",
  containerClassName,
  onBadgeClick,
}) => {
  const badgeContent = (
    <span
      className={compositeStyles(
        size === "small" && styles["badge-text-small"],
        size === "large" && styles["badge-text-large"],
        type === "new" && styles["badge-text-new"],
        type === "premium" && styles["badge-text-premium"],
        (type === "expired" || type === "free") && styles["badge-text-bronze"],
        styles["badge-text"]
      )}
    >
      {text}
    </span>
  );

  const badgeClassname = compositeStyles(
    "dark:before:mix-blend-plus-lighter dark:after:mix-blend-plus-lighter bg-vul-yellow-450 dark:bg-transparent",
    styles["badge-button"],
    type === "new" && styles["badge-button-new"],
    type === "premium" && styles["badge-button-premium"],
    type === "expired" && styles["badge-button-expired"],
    type === "free" && styles["badge-button-free"],
    type === "free" && "bg-black/10 dark:bg-white/10",
    size === "large" && styles["badge-button-large"],
    size === "small" && styles["badge-button-small"],
    containerClassName
  );

  if (as === "tag") {
    return (
      <span className={badgeClassname} onClick={onBadgeClick}>
        {badgeContent}
      </span>
    );
  }

  return (
    <button type="button" className={badgeClassname} onClick={onBadgeClick}>
      {badgeContent}
    </button>
  );
};

export default GradientBadge;
