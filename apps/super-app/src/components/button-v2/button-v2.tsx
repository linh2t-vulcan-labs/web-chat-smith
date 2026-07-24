import { forwardRef } from "react";

import { buttonV2Variants } from "./consts";
import type { TButtonV2Props } from "./types";

const ButtonV2 = forwardRef<HTMLButtonElement, TButtonV2Props>(
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
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type="button"
      className={buttonV2Variants({
        className,
        color,
        disabled,
        fullWidth,
        rounded,
        size,
      })}
      disabled={disabled}
      {...props}
    >
      {startIcon}
      {children}
      {endIcon}
    </button>
  )
);

ButtonV2.displayName = "ButtonV2";

export default ButtonV2;
