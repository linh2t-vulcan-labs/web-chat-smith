import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

import { BASE_STATE_WRAPPER_BASE_STYLES, cn } from "../utils/cn";

const buttonVariants = tv({
  base: cn(
    "h-fit",
    "inline-flex items-center justify-center",
    "rounded-v1-circle"
  ),

  compoundVariants: [
    {
      class: "px-v1-structural-component-medium",
      iconOnly: true,
      size: "xl",
    },
    {
      class: "px-v1-structural-component-micro",
      iconOnly: true,
      size: "l",
    },
    {
      class: "px-v1-structural-component-micro",
      iconOnly: true,
      size: "m",
    },
    {
      class: "px-v1-structural-component-medium",
      iconOnly: false,
      size: "m",
    },
    {
      class: "px-v1-optical-normal!",
      iconOnly: true,
      size: "s",
    },
    {
      class: "px-v1-structural-content-micro",
      iconOnly: true,
      size: "xs",
    },
    {
      class: "px-v1-structural-content-micro",
      iconOnly: true,
      size: "xxs",
    },
  ],

  defaultVariants: {
    iconOnly: false,
    size: "m",
    variant: "default",
  },

  extend: BASE_STATE_WRAPPER_BASE_STYLES,

  variants: {
    iconOnly: {
      false: "",
      true: "",
    },

    size: {
      l: "px-v1-structural-component-large py-v1-structural-component-micro typo-v1-action-md-light",
      m: "py-v1-structural-component-micro  typo-v1-action-sm-light",
      s: "px-v1-structural-component-medium py-v1-optical-normal typo-v1-action-sm-light",
      xl: "px-v1-structural-component-large py-v1-structural-component-medium typo-v1-action-md-light",
      xs: "px-v1-structural-component-small py-v1-structural-content-micro typo-v1-action-sm-light",
      xxs: "px-v1-structural-component-micro py-v1-structural-content-micro typo-v1-action-xs-light",
    },

    variant: {
      default: "bg-v1-action-background-primary text-v1-action-text-primary",
      destructive:
        "bg-v1-action-background-destructive text-v1-action-text-destructive",
      ghost: "text-v1-action-text-secondary",
      gold: "bg-v1-action-background-gold text-v1-action-text-gold",
      outline:
        "thickness-v1-subtle border-v1-action-border-ghost text-v1-action-text-tertiary",
      primary: "bg-v1-brand-500 text-v1-action-text-brand",
      secondary:
        "bg-v1-action-background-secondary text-v1-action-text-secondary",
      utility: "text-v1-action-text-tertiary",
    },
  },
});

function ButtonIcon({
  children,
  className,
}: Readonly<{ children?: ReactNode; className?: string }>) {
  if (!children) {
    return null;
  }
  return <span className={cn(className)}>{children}</span>;
}

function ButtonContent({
  children,
  isText,
  size,
  className,
}: Readonly<{
  children?: ReactNode;
  isText: boolean;
  size?: VariantProps<typeof buttonVariants>["size"];
  className?: string;
}>) {
  if (!children) {
    return null;
  }

  if (!isText) {
    return children;
  }
  if (size !== "l" && size !== "xl") {
    return children;
  }

  return (
    <span
      className={cn(
        "py-v1-optical-subtle px-v1-structural-content-micro",
        className
      )}
    >
      {children}
    </span>
  );
}

export interface ButtonProps
  extends
    HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  iconOnly?: boolean;
  disabled?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      prefixIcon,
      suffixIcon,
      variant,
      size,
      iconOnly,
      disabled,
      ...rest
    },
    ref
  ) => {
    const isTextChildren = typeof children === "string";
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={cn(buttonVariants({ iconOnly, size, variant }), className)}
        {...rest}
      >
        <ButtonIcon>{prefixIcon}</ButtonIcon>
        <ButtonContent isText={isTextChildren} size={size}>
          {children}
        </ButtonContent>
        <ButtonIcon>{suffixIcon}</ButtonIcon>
      </button>
    );
  }
);

Button.displayName = "Button";

/* ---------------------------------- */
/* Micro Button */
/* ---------------------------------- */

const buttonMicroVariants = tv({
  base: cn(
    "inline-flex items-center justify-center",
    "rounded-v1-circle",
    "p-v1-optical-subtle",
    "text-v1-action-icon-tertiary",
    "[&>svg]:size-v1-4"
  ),
  defaultVariants: {
    type: "default",
  },
  extend: BASE_STATE_WRAPPER_BASE_STYLES,
  variants: {
    type: {
      default: "bg-v1-action-background-secondary",
      utility: "",
    },
  },
});

export interface ButtonMicroProps
  extends
    HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonMicroVariants> {}

const ButtonMicro = forwardRef<HTMLButtonElement, ButtonMicroProps>(
  ({ className, type, children, ...rest }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(buttonMicroVariants({ type }), className)}
      {...rest}
    >
      {children}
    </button>
  )
);

ButtonMicro.displayName = "ButtonMicro";

export interface ButtonLinkProps extends HTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  iconWrapperClassName?: string;
  contentClassName?: string;
}

const ButtonLink = forwardRef<HTMLButtonElement, ButtonLinkProps>(
  (
    {
      className,
      children,
      icon,
      iconWrapperClassName,
      contentClassName,
      ...rest
    },
    ref
  ) => {
    const isTextChildren = typeof children === "string";

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          tv({ extend: BASE_STATE_WRAPPER_BASE_STYLES })(),
          "bg-v1-surface-conversation-user-material p-v1-optical-subtle rounded-v1-pill",
          "typo-v1-action-md-light",
          "inline-flex items-center justify-center",
          className
        )}
        {...rest}
      >
        {icon && (
          <ButtonIcon
            className={cn(
              "p-v1-optical-subtle bg-v1-surface-hierarchy-raised rounded-v1-circle",
              iconWrapperClassName
            )}
          >
            {icon}
          </ButtonIcon>
        )}

        {children && (
          <ButtonContent isText={isTextChildren} className={contentClassName}>
            {children}
          </ButtonContent>
        )}
      </button>
    );
  }
);

ButtonLink.displayName = "ButtonLink";

export interface ButtonDisclosureProps extends HTMLAttributes<HTMLButtonElement> {
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  prefixIconWrapperClassName?: string;
  suffixIconWrapperClassName?: string;
  contentClassName?: string;
}

const ButtonDisclosure = forwardRef<HTMLButtonElement, ButtonDisclosureProps>(
  (
    {
      className,
      children,
      prefixIcon,
      suffixIcon,
      prefixIconWrapperClassName,
      suffixIconWrapperClassName,
      contentClassName,
      ...rest
    },
    ref
  ) => {
    const isTextChildren = typeof children === "string";

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          tv({ extend: BASE_STATE_WRAPPER_BASE_STYLES })(),
          "cursor-pointer",
          "typo-v1-action-md-light",
          "inline-flex items-center",
          "px-v1-structural-component-micro py-v1-structural-content-tight",
          "text-v1-action-text-secondary",
          className
        )}
        {...rest}
      >
        {prefixIcon && (
          <ButtonIcon className={prefixIconWrapperClassName}>
            {prefixIcon}
          </ButtonIcon>
        )}

        {children && (
          <ButtonContent isText={isTextChildren} className={contentClassName}>
            {children}
          </ButtonContent>
        )}

        {suffixIcon && (
          <ButtonIcon className={suffixIconWrapperClassName}>
            {suffixIcon}
          </ButtonIcon>
        )}
      </button>
    );
  }
);

ButtonDisclosure.displayName = "ButtonDisclosure";

/* ---------------------------------- */
/* Compound Export */
/* ---------------------------------- */

const ButtonWithCompound = Button as typeof Button & {
  Micro: typeof ButtonMicro;
  Link: typeof ButtonLink;
  Disclosure: typeof ButtonDisclosure;
};

ButtonWithCompound.Micro = ButtonMicro;
ButtonWithCompound.Link = ButtonLink;
ButtonWithCompound.Disclosure = ButtonDisclosure;

export default ButtonWithCompound;
