import React from "react";

import { SVGIcon } from "@/components/svg-icon";
import { compositeStyles } from "@/utils/commons/styles";

import type { TSuggestionBtnV2Props } from "./types";

export default function SuggestionBtnV2({
  className,
  children,
  ...props
}: TSuggestionBtnV2Props) {
  return (
    <button
      type="button"
      className={compositeStyles(
        "gap-small-1 px-medium-1.5 py-small-1 text-bodyS-neutral text-text-general-secondary hover:bg-surface-general-bright-overlay inline-flex cursor-pointer items-center rounded-full transition focus:outline-hidden",
        className ?? ""
      )}
      {...props}
    >
      <SVGIcon
        src="/icons/curved-arrow-right.svg"
        className="text-icon-general-tertiary"
        width={16}
        height={16}
      />

      {children}
    </button>
  );
}
