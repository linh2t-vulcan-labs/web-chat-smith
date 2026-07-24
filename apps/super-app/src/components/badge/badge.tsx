import { memo } from "react";

import { compositeStyles } from "@/utils/commons/styles";

import { badgeVariant, dotBadgeVariant } from "./consts";
import type { TBadgeProps } from "./types";

function Badge(props: TBadgeProps) {
  if (props.type === "dot") {
    const { children, size, className, onClick } = props;

    const concatStyles = compositeStyles(
      "text-text-general-secondary",
      className
    );

    return (
      <span
        className={compositeStyles(dotBadgeVariant({ size }), concatStyles)}
        onClick={onClick}
      >
        {children}
      </span>
    );
  }

  const { children, color, rounded, className, containerClassName, onClick } =
    props;

  return (
    <span
      className={badgeVariant({
        className: containerClassName,
        color,
        rounded,
      })}
      onClick={onClick}
    >
      <span
        className={compositeStyles(
          "text-footnoteS-neutral px-[2.5px]",
          className
        )}
      >
        {children}
      </span>
    </span>
  );
}

export default memo(Badge);
