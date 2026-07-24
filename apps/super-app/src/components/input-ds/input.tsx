import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { tv } from "tailwind-variants";

import { BASE_STATE_WRAPPER_BASE_STYLES, cn } from "../utils/cn";

const inputWrapperVariants = tv({
  base: "p-v1-structural-content-normal rounded-v1-medium gap-v1-structural-content-tight bg-v1-form-background-default thickness-v1-thin border-v1-form-border-default typo-v1-body-default-normal [&>svg]:size-v1-6 inline-flex w-full cursor-text items-center border",
  extend: BASE_STATE_WRAPPER_BASE_STYLES,
});

const inputControlVariants = tv({
  base: "placeholder:text-v1-text-hierarchy-placeholder text-v1-text-hierarchy-primary w-full focus-within:outline-none",
});

/* =======================
 * Types
 * ======================= */

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "prefix" | "suffix"
> {
  className?: string;
  wrapperClassName?: string;
  prefix?: ReactNode | string;
  suffix?: ReactNode | string;
  prefixWrapperClassName?: string;
  suffixWrapperClassName?: string;
}

/* =======================
 * Component
 * ======================= */

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      prefix,
      prefixWrapperClassName,
      suffix,
      suffixWrapperClassName,
      disabled,
      ...inputProps
    },
    ref
  ) => {
    const hasPrefix = !!prefix;
    const hasSuffix = !!suffix;

    return (
      <label
        data-disabled={disabled ? "" : undefined}
        className={cn(inputWrapperVariants(), wrapperClassName)}
      >
        {hasPrefix && (
          <span
            className={cn(
              "text-v1-text-hierarchy-placeholder",
              prefixWrapperClassName
            )}
          >
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          className={cn(inputControlVariants(), className)}
          disabled={disabled}
          {...inputProps}
        />
        {hasSuffix && (
          <span
            className={cn(
              "text-v1-text-hierarchy-placeholder",
              suffixWrapperClassName
            )}
          >
            {suffix}
          </span>
        )}
      </label>
    );
  }
);

Input.displayName = "Input";

export { Input };
