import { forwardRef } from "react";

import { buttonV3Variants } from "./consts";
import type { TButtonV3Props } from "./types";

const ButtonV3 = forwardRef<HTMLButtonElement, TButtonV3Props>(
  ({ className, size, color, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={buttonV3Variants({
        className,
        color,
        size,
      })}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
);

ButtonV3.displayName = "ButtonV3";

export default ButtonV3;
