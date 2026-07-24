import { useState } from "react";
import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

import { Badge } from "../badge-ds";
import { cn } from "../utils/cn";

const BadgeInfo = Badge.Info;

const DEFAULT_IMAGE_SRC = "/public/images/placeholder-image.png";

const atomicOptionItemVariants = tv({
  variants: {
    type: {
      inline: "gap-v1-structural-content-tight inline-flex items-center",
      rick: "flex items-start",
      stacked:
        "gap-v1-optical-subtle flex w-fit flex-col items-center justify-center",
    },
  },
});

const labelContainerVariants = tv({
  variants: {
    base: "text-v1-text-hierarchy-primary flex-1",
    type: {
      inline:
        "typo-v1-support-default text-v1-text-hierarchy-primary line-clamp-2",
      rick: "py-v1-optical-subtle px-v1-structural-content-micro typo-v1-title-sm flex flex-col items-start",
      stacked:
        "gap-v1-optical-subtle typo-v1-caption-smsecondary-helper w-full items-center justify-center text-center",
    },
  },
});

const badgeVariants = tv({
  base: "top-v1-0 absolute",
  variants: {
    type: {
      inline: "",
      rick: "right-v1-0",
      stacked: "-right-v1-2",
    },
  },
});

export interface IAtomicOptionItemProps extends VariantProps<
  typeof atomicOptionItemVariants
> {
  icon: React.ReactNode;
  label: string;
  isShowBadge?: boolean;
  description?: string;
  className?: string;
  suffixNode?: React.ReactNode;
  iconContainerClassName?: string;
  badgeClassName?: string;
  labelContainerClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export const AtomicOptionItem: React.FC<IAtomicOptionItemProps> = (props) => {
  const {
    icon,
    label,
    suffixNode,
    description,
    isShowBadge,
    className,
    type = "inline",
    iconContainerClassName,
    badgeClassName,
    labelContainerClassName,
    labelClassName,
    descriptionClassName,
    onClick,
    onKeyDown: _onKeyDown,
    onMouseEnter: _onMouseEnter,
    onMouseLeave: _onMouseLeave,
  } = props;
  return (
    <div
      className={cn(atomicOptionItemVariants({ type }), className)}
      onClick={onClick}
    >
      <span className={cn("relative", iconContainerClassName)}>
        {icon}
        {isShowBadge && (
          <BadgeInfo
            type="dot"
            className={cn(badgeVariants({ type }), badgeClassName)}
          />
        )}
      </span>
      <div
        className={cn(
          labelContainerVariants({ type }),
          labelContainerClassName
        )}
      >
        <h3 className={cn(labelClassName)}>{label}</h3>
        {description && (
          <p
            className={cn(
              "typo-v1-support-micro text-v1-text-hierarchy-tertiary",
              descriptionClassName
            )}
          >
            {description}
          </p>
        )}
      </div>
      {suffixNode}
    </div>
  );
};

AtomicOptionItem.displayName = "AtomicOptionItem";

const atomicOptionItemWithMediaVariants = tv({
  base: "flex",
  variants: {
    type: {
      inline: "flex-row",
      rick: "flex-row",
      stacked:
        "gap-v1-structural-content-micro w-fit flex-col items-center justify-center",
    },
  },
});

const mediaVariants = tv({
  compoundVariants: [
    {
      class:
        "rounded-v1-large max-h-[100px] min-h-[100px] min-w-[100px] max-w-[100px]",
      size: "medium",
      type: "inline",
    },
    {
      class:
        "rounded-v1-medium max-h-[48px] min-h-[48px] min-w-[48px] max-w-[48px]",
      size: "small",
      type: "inline",
    },
  ],
  defaultVariants: {
    size: "medium",
  },
  variants: {
    size: {
      medium: "",
      small: "",
    },
    type: {
      inline: "",
      rick: "rounded-tl-v1-xl  rounded-bl-v1-xl min-h-[180px] min-w-[156px] max-w-[156px]",
      stacked: "rounded-v1-medium min-h-[100px] min-w-[100px] max-w-[100px]",
    },
  },
});

const mediaContentContainerVariants = tv({
  base: "text-v1-text-hierarchy-primary flex flex-col",
  compoundVariants: [
    {
      class: "px-v1-structural-component-medium",
      size: "medium",
      type: "inline",
    },
    {
      class: "px-v1-structural-component-medium",
      size: "medium",
      type: "rick",
    },
    {
      class: "px-v1-structural-component-micro",
      size: "small",
      type: "inline",
    },
    {
      class: "px-v1-structural-component-micro",
      size: "small",
      type: "rick",
    },
  ],
  defaultVariants: {
    size: "medium",
  },
  variants: {
    size: {
      medium: "",
      small: "",
    },
    type: {
      inline:
        "py-v1-structural-content-micro md:py-v1-structural-component-small typo-v1-title-lg",
      rick: "py-v1-structural-component-small typo-v1-title-lg",
      stacked: "typo-v1-support-secondary-normal",
    },
  },
});

export interface IAtomicOptionItemWithMediaProps {
  type: "stacked" | "inline" | "rick";
  size?: "medium" | "small";
  imageSrc?: string;
  fallbackSrc?: string;
  fallback?: React.ReactNode;
  mediaWrapperClassName?: string;
  labelContainerClassName?: string;
  label?: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
  onClick?: () => void;
}

export const AtomicOptionItemWithMedia: React.FC<
  IAtomicOptionItemWithMediaProps
> = (props) => {
  const {
    type,
    size = "medium",
    imageSrc = DEFAULT_IMAGE_SRC,
    fallbackSrc,
    fallback,
    mediaWrapperClassName,
    labelContainerClassName,
    label,
    description,
    className,
    action,
    onClick,
  } = props;
  const [hasError, setHasError] = useState(false);

  const shouldShowFallback = hasError || !imageSrc;
  const imageClassName = cn(
    "absolute inset-0 h-full w-full object-cover",
    mediaVariants({ size, type })
  );

  const renderContent = () => {
    if (!shouldShowFallback) {
      return (
        <img
          src={imageSrc}
          alt=""
          className={imageClassName}
          onError={() => setHasError(true)}
        />
      );
    }

    if (fallback) {
      return (
        <div className="bg-v1-surface-muted absolute inset-0 flex items-center justify-center">
          {fallback}
        </div>
      );
    }

    return <img src={fallbackSrc} alt="" className={imageClassName} />;
  };

  return (
    <div
      className={cn(atomicOptionItemWithMediaVariants({ type }), className)}
      onClick={onClick}
    >
      <div
        className={cn(
          mediaVariants({ size, type }),
          "relative flex items-center justify-center",
          mediaWrapperClassName
        )}
      >
        {renderContent()}
      </div>
      <div
        className={cn(
          mediaContentContainerVariants({ size, type }),
          labelContainerClassName
        )}
      >
        {label && <h3 className={cn("line-clamp-1")}>{label}</h3>}
        {description && (
          <p
            className={cn("typo-v1-support-default line-clamp-3", {
              "line-clamp-2": size === "small",
              "line-clamp-3": size === "medium",
            })}
          >
            {description}
          </p>
        )}
        {action && <div className="mt-auto flex justify-end">{action}</div>}
      </div>
    </div>
  );
};

AtomicOptionItemWithMedia.displayName = "AtomicOptionItemWithMedia";
