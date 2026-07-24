import * as SelectPrimitive from "@radix-ui/react-select";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

import { SvgIcon } from "../svg-icon-ds";
import { BASE_STATE_WRAPPER_BASE_STYLES, cn } from "../utils/cn";

const buttonWrapperTriggerVariant = tv({
  base: "text-v1-action-text-secondary flex cursor-pointer items-center focus-within:outline-none active:outline-none",
  defaultVariants: {
    intent: "utility",
    size: "md",
  },
  extend: BASE_STATE_WRAPPER_BASE_STYLES,
  variants: {
    intent: {
      form: "rounded-v1-medium bg-v1-surface-hierarchy-container py-v1-structural-content-normal px-v1-structural-content-tight w-full justify-between",
      utility:
        "rounded-v1-circle py-v1-optical-normal px-v1-structural-content-tight w-fit justify-center",
    },
    size: {
      md: "typo-v1-action-md-strong",
      sm: "typo-v1-action-compact-sm-normal",
    },
  },
});

type ButtonTriggerProps = VariantProps<typeof buttonWrapperTriggerVariant> &
  Omit<ComponentPropsWithoutRef<"button">, "size" | "type">;

const ButtonTrigger = forwardRef<HTMLButtonElement, ButtonTriggerProps>(
  ({ className, children, intent, size, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(buttonWrapperTriggerVariant({ intent, size }), className)}
      {...props}
    >
      <div className="px-v1-structural-content-micro flex items-center">
        {children}
      </div>

      <div className="trigger-arrow text-v1-action-icon-tertiary flex origin-center items-center transition-transform duration-200">
        <SvgIcon size={16} name="chevron-down" />
      </div>
    </button>
  )
);

ButtonTrigger.displayName = "ButtonTrigger";

export type SelectTriggerProps = ComponentPropsWithoutRef<
  typeof SelectPrimitive.Trigger
> &
  VariantProps<typeof buttonWrapperTriggerVariant>;

const SelectTrigger2 = forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, children, size, intent, disabled, ...props }, ref) => {
  const hasCustomChildren = children !== undefined && children !== null;

  return (
    <SelectPrimitive.Trigger ref={ref} asChild {...props}>
      <ButtonTrigger
        size={size}
        intent={intent}
        className={className}
        disabled={disabled}
      >
        {hasCustomChildren ? (
          children
        ) : (
          <SelectPrimitive.Value placeholder="Select an option" />
        )}
      </ButtonTrigger>
    </SelectPrimitive.Trigger>
  );
});

SelectTrigger2.displayName = SelectPrimitive.Trigger.displayName;

export { ButtonTrigger };
