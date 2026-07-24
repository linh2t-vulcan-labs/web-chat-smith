import { forwardRef } from "react";

import { buttonVariants } from "./consts";
import type { TButtonProps } from "./types";

const Button = forwardRef<HTMLButtonElement, TButtonProps>(
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
      className={buttonVariants({
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

Button.displayName = "Button";

export default Button;
