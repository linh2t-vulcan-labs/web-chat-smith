import { forwardRef } from "react";

import { featureChipVariants } from "./consts";
import type { TFeatureChipProps } from "./types";

const FeatureChip = forwardRef<HTMLButtonElement, TFeatureChipProps>(
  (
    {
      className,
      startIcon,
      endIcon,
      color,
      size,
      rounded,
      disabled,
      fullWidth,
      isActive,
      children,
      startIconSpacing = "mr-small-0.5",
      endIconSpacing = "ml-small-1",
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type="button"
      className={featureChipVariants({
        className,
        color,
        disabled,
        fullWidth,
        hasEndIcon: !!endIcon,
        isActive,
        rounded,
        size,
      })}
      disabled={disabled}
      {...props}
    >
      {startIcon && <span className={startIconSpacing}>{startIcon}</span>}
      {children}
      {endIcon && <span className={endIconSpacing}>{endIcon}</span>}
    </button>
  )
);

FeatureChip.displayName = "FeatureChip";

export default FeatureChip;
