import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

import { cn } from "../utils/cn";

const badgeLevelVariants = tv({
  base: "thickness-v1-subtle inline-flex items-center",
  defaultVariants: {
    color: "gold",
    size: "md",
  },
  variants: {
    color: {
      amethyst:
        "border-v1-level-amethyst-border bg-v1-level-amethyst-background text-v1-level-amethyst-text",
      emerald:
        "border-v1-level-emerald-border bg-v1-level-emerald-background text-v1-level-emerald-text",
      free: "bg-v1-surface-hierarchy-container text-v1-text-hierarchy-secondary border-v1-border-structural-strong",
      gold: "border-v1-level-gold-border bg-v1-level-gold-background text-v1-level-gold-text",
      hierarchy:
        "border-v1-border-structural-strong bg-v1-surface-hierarchy-container text-v1-text-hierarchy-secondary",
      "hierarchy-high":
        "border-v1-border-structural-strong bg-v1-surface-hierarchy-container-high text-v1-text-hierarchy-placeholder",
      ruby: "border-v1-level-ruby-border bg-v1-level-ruby-background text-v1-level-ruby-text",
    },
    size: {
      md: "px-v1-optical-normal py-v1-structural-content-micro gap-v1-structural-component-negative-soft typo-v1-label-compact-allcap rounded-v1-large",
      sm: "p-v1-structural-content-micro gap-v1-optical-negative-subtle typo-v1-label-micro-allcap rounded-v1-standard",
    },
  },
});

export interface IBadgeLevelProps
  extends
    Omit<HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof badgeLevelVariants> {}

const BadgeLevel = forwardRef<HTMLSpanElement, IBadgeLevelProps>(
  (props, ref) => {
    const { children, size, color, className, ...restProps } = props;
    return (
      <span
        ref={ref}
        className={cn(badgeLevelVariants({ color, size }), className)}
        {...restProps}
      >
        {children}
      </span>
    );
  }
);

const badgeInfoVariants = tv({
  base: "rounded-v1-circle",
  compoundVariants: [
    {
      class:
        "px-v1-optical-normal py-v1-structural-content-micro typo-v1-label-compact-allcap",
      size: "md",
      type: "normal",
    },
    {
      class:
        "py-v1-optical-hairline px-v1-structural-content-micro typo-v1-label-nano",
      size: "sm",
      type: "normal",
    },
  ],
  defaultVariants: {
    color: "new",
    size: "md",
    type: "normal",
  },
  variants: {
    color: {
      beta: "bg-v1-badge-beta-background text-v1-badge-beta-text",
      new: "bg-v1-badge-new-background text-v1-badge-new-text",
    },
    size: {
      md: "",
      sm: "",
    },
    type: {
      dot: "w-v1-2 h-v1-2 block",
      normal: "inline-flex items-center",
    },
  },
});

export interface IBadgeInfoProps
  extends
    Omit<HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof badgeInfoVariants> {}

const BadgeInfo = forwardRef<HTMLSpanElement, IBadgeInfoProps>((props, ref) => {
  const { children, type, size, color, className, ...restProps } = props;
  return (
    <span
      ref={ref}
      className={cn(badgeInfoVariants({ color, size, type }), className)}
      {...restProps}
    >
      {children}
    </span>
  );
});

export type IBadgeFileTypeProps = HTMLAttributes<HTMLSpanElement>;
const BadgeFileType = forwardRef<HTMLSpanElement, IBadgeFileTypeProps>(
  (props, ref) => {
    const { children, className, ...restProps } = props;
    return (
      <span
        ref={ref}
        className={cn(
          "py-v1-optical-hairline px-v1-structural-content-micro text-v1-text-hierarchy-tertiary border-v1-border-structural-default rounded-v1-soft thickness-v1-subtle typo-v1-label-nano inline-flex items-center justify-center",
          className
        )}
        {...restProps}
      >
        {children}
      </span>
    );
  }
);

const badgePricingVariants = tv({
  base: "rounded-v1-pill gap-v1-structural-content-none bg-v1-surface-hierarchy-inverse text-v1-text-hierarchy-inverse flex items-center",
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      md: "p-v1-optical-normal typo-v1-label-compact-allcap",
      sm: "px-v1-optical-normal py-v1-structural-content-micro typo-v1-label-nano",
    },
  },
});

export interface IBadgePricingProps
  extends
    Omit<HTMLAttributes<HTMLSpanElement>, "size">,
    VariantProps<typeof badgePricingVariants> {
  children: React.ReactNode;
}

const BadgePricing = forwardRef<HTMLSpanElement, IBadgePricingProps>(
  (props, ref) => {
    const { children, className, size, ...restProps } = props;
    return (
      <span
        ref={ref}
        className={cn(badgePricingVariants({ size }), className)}
        {...restProps}
      >
        {children}
      </span>
    );
  }
);

export interface IBadgeUrlProps extends HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

const BadgeUrl = forwardRef<HTMLSpanElement, IBadgeUrlProps>((props, ref) => {
  const { children, className, ...restProps } = props;
  return (
    <span
      ref={ref}
      className={cn(
        "py-v1-optical-subtle px-v1-structural-content-micro bg-v1-surface-hierarchy-raised text-v1-text-hierarchy-primary gap-v1-structural-content-none rounded-v1-pill thickness-v1-subtle border-v1-border-structural-default typo-v1-label-micro-default flex items-center",
        className
      )}
      {...restProps}
    >
      {children}
    </span>
  );
});

BadgeLevel.displayName = "BadgeLevel";
BadgeInfo.displayName = "BadgeInfo";
BadgeFileType.displayName = "BadgeFileType";
BadgePricing.displayName = "BadgePricing";
BadgeUrl.displayName = "BadgeUrl";

const Badge = {
  FileType: BadgeFileType,
  Info: BadgeInfo,
  Level: BadgeLevel,
  Pricing: BadgePricing,
  Url: BadgeUrl,
};

export default Badge;
