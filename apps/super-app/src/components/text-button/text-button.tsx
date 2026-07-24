import { forwardRef } from "react";

import { textButtonVariants } from "./consts";
import type { TTextButtonProps } from "./types";

const TextButton = forwardRef<HTMLButtonElement, TTextButtonProps>(
  (
    {
      className,
      startIcon,
      endIcon,
      color,
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
      className={textButtonVariants({
        className,
        color,
        disabled,
        fullWidth,
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

TextButton.displayName = "TextButton";

export default TextButton;
