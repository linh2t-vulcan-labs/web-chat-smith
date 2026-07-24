import React from "react";

import { compositeStyles } from "@/utils/commons/styles";

import styles from "@/features/subscription/styles/styles.module.scss";

const BorderTrialBadge = ({ content }: { content: string }) => (
  <div
    className={compositeStyles(
      "rounded-pill border-border-general-primary px-small-1 border py-px",
      styles["subscription-border-primary-v2"]
    )}
    style={{ borderWidth: 2 }}
  >
    <div
      className={compositeStyles(
        "gap-medium-2 dark:bg-text-general-secondary text-footnoteS-highlight flex h-full flex-col"
      )}
    >
      <span className="bg-gradient-green my-px bg-clip-text whitespace-nowrap text-transparent">
        {content}
      </span>
    </div>
  </div>
);

export default BorderTrialBadge;
