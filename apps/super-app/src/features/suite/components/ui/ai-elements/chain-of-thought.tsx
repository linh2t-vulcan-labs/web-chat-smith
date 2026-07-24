"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import type { LucideIcon } from "lucide-react";
import { DotIcon } from "lucide-react";
import type {
  ComponentProps,
  CSSProperties,
  FC,
  ReactNode,
  SVGProps,
} from "react";
import {
  createContext,
  isValidElement,
  memo,
  useContext,
  useMemo,
} from "react";

import ChevronDownIcon from "@/features/suite/assets/icons/arrow-down-icon.svg";
import { Badge } from "@/features/suite/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/features/suite/components/ui/collapsible";
import { cn } from "@/features/suite/utils/classnames";

import { TextShimmer } from "../text-shimmer";
import { useTextRevealLine } from "./use-text-reveal-line";

interface ChainOfThoughtContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ChainOfThoughtContext = createContext<ChainOfThoughtContextValue | null>(
  null
);

const useChainOfThought = () => {
  const context = useContext(ChainOfThoughtContext);
  if (!context) {
    throw new Error(
      "ChainOfThought components must be used within ChainOfThought"
    );
  }
  return context;
};

export type ChainOfThoughtProps = ComponentProps<"div"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const ChainOfThought = memo(
  ({
    className,
    open,
    defaultOpen = false,
    onOpenChange,
    children,
    ...props
  }: ChainOfThoughtProps) => {
    const [isOpen, setIsOpen] = useControllableState({
      defaultProp: defaultOpen,
      onChange: onOpenChange,
      prop: open,
    });

    const chainOfThoughtContext = useMemo(
      () => ({ isOpen, setIsOpen }),
      [isOpen, setIsOpen]
    );

    return (
      <ChainOfThoughtContext value={chainOfThoughtContext}>
        <div className={cn("not-prose w-full", className)} {...props}>
          {children}
        </div>
      </ChainOfThoughtContext>
    );
  }
);

export type ChainOfThoughtHeaderProps = ComponentProps<
  typeof CollapsibleTrigger
> & {
  icon?: LucideIcon | FC<SVGProps<SVGSVGElement>> | ReactNode | null;
  status?: "generating" | "complete" | "error";
  hasArrowIcon: boolean;
};

export const ChainOfThoughtHeader = memo(
  ({
    className,
    children,
    icon,
    status = "generating",
    hasArrowIcon = true,
    ...props
  }: ChainOfThoughtHeaderProps) => {
    const { isOpen, setIsOpen } = useChainOfThought();
    const shimmerLabel =
      typeof children === "string" ? children : "Chain of Thought";
    let leadingIcon: ReactNode;
    if (icon === undefined) {
      leadingIcon = <DotIcon className="size-4" />;
    } else if (isValidElement(icon)) {
      leadingIcon = icon;
    } else if (typeof icon === "function") {
      const IconComponent = icon;
      leadingIcon = <IconComponent className="size-4" />;
    } else {
      leadingIcon = null;
    }

    return (
      <Collapsible onOpenChange={setIsOpen} open={isOpen}>
        <CollapsibleTrigger
          className={cn(
            "p-v1-structural-content-tight flex w-full cursor-pointer items-center",
            className
          )}
          {...props}
        >
          {leadingIcon}

          {status === "complete" ? (
            <span className="typo-v1-action-md-light text-v1-action-text-secondary px-v1-structural-content-micro py-v1-optical-subtle text-start">
              {children ?? "Chain of Thought"}
            </span>
          ) : (
            <TextShimmer
              as="span"
              className="typo-v1-action-md-light px-v1-structural-content-micro py-v1-optical-subtle text-start"
              style={
                {
                  "--base-color": "var(--color-v1-text-hierarchy-secondary)",
                  "--base-gradient-color":
                    "var(--color-v1-text-hierarchy-primary)",
                } as CSSProperties
              }
              duration={1}
            >
              {shimmerLabel}
            </TextShimmer>
          )}
          {hasArrowIcon && (
            <ChevronDownIcon
              className={cn(
                "text-v1-action-icon-tertiary size-6 transition-transform",
                isOpen ? "rotate-180" : "rotate-0"
              )}
            />
          )}
        </CollapsibleTrigger>
      </Collapsible>
    );
  }
);

export type ChainOfThoughtStepProps = ComponentProps<"div"> & {
  icon?: LucideIcon;
  label: ReactNode;
  description?: ReactNode;
  status?: "complete" | "active" | "pending";
  labelDurationMs?: number;
  descDurationMs?: number;
};

const stepStatusStyles = {
  active: "text-foreground",
  complete: "text-muted-foreground",
  pending: "text-muted-foreground/50",
};

export const ChainOfThoughtStep = memo(
  ({
    className,
    label,
    description,
    status = "complete",
    labelDurationMs,
    descDurationMs,
    children,
    ...props
  }: ChainOfThoughtStepProps) => {
    const { lineRef, contentRef } = useTextRevealLine(
      Boolean(labelDurationMs ?? descDurationMs),
      Boolean(description)
    );

    return (
      <div
        className={cn(
          "flex text-sm",
          stepStatusStyles[status],
          "animate-in fade-in-0 slide-in-from-top-2",
          className
        )}
        {...props}
      >
        <div className="relative mt-0.5">
          <div
            ref={lineRef}
            className={cn(
              "bg-v1-border-structural-default absolute inset-s-1/2 -mx-px w-[2px]",
              (labelDurationMs ?? descDurationMs) ? "top-0" : "inset-y-0"
            )}
          />
        </div>
        <div ref={contentRef} className="flex-1 overflow-hidden">
          <div className="typo-v1-title-sm text-v1-text-hierarchy-primary py-v1-structural-content-micro px-v1-structural-content-relaxed font-medium">
            {label}
          </div>
          {description && (
            <div className="typo-v1-support-secondary-normal text-v1-text-hierarchy-primary px-v1-structural-content-relaxed font-normal">
              {description}
            </div>
          )}
          {children}
        </div>
      </div>
    );
  }
);

export type ChainOfThoughtSearchResultsProps = ComponentProps<"div">;

const ChainOfThoughtSearchResults = memo(
  ({ className, ...props }: ChainOfThoughtSearchResultsProps) => (
    <div
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  )
);

export type ChainOfThoughtSearchResultProps = ComponentProps<typeof Badge>;

const ChainOfThoughtSearchResult = memo(
  ({ className, children, ...props }: ChainOfThoughtSearchResultProps) => (
    <Badge
      className={cn("gap-1 px-2 py-0.5 text-xs font-normal", className)}
      variant="secondary"
      {...props}
    >
      {children}
    </Badge>
  )
);

export type ChainOfThoughtContentProps = ComponentProps<
  typeof CollapsibleContent
>;

export const ChainOfThoughtContent = memo(
  ({ className, children, ...props }: ChainOfThoughtContentProps) => {
    const { isOpen } = useChainOfThought();

    return (
      <Collapsible open={isOpen}>
        <CollapsibleContent
          className={cn("mt-2 space-y-3", className)}
          {...props}
        >
          {children}
        </CollapsibleContent>
      </Collapsible>
    );
  }
);

export type ChainOfThoughtImageProps = ComponentProps<"div"> & {
  caption?: string;
};

const ChainOfThoughtImage = memo(
  ({ className, children, caption, ...props }: ChainOfThoughtImageProps) => (
    <div className={cn("mt-2 space-y-2", className)} {...props}>
      <div className="bg-muted relative flex max-h-88 items-center justify-center overflow-hidden rounded-lg p-3">
        {children}
      </div>
      {caption && <p className="text-muted-foreground text-xs">{caption}</p>}
    </div>
  )
);

ChainOfThought.displayName = "ChainOfThought";
ChainOfThoughtHeader.displayName = "ChainOfThoughtHeader";
ChainOfThoughtStep.displayName = "ChainOfThoughtStep";
ChainOfThoughtSearchResults.displayName = "ChainOfThoughtSearchResults";
ChainOfThoughtSearchResult.displayName = "ChainOfThoughtSearchResult";
ChainOfThoughtContent.displayName = "ChainOfThoughtContent";
ChainOfThoughtImage.displayName = "ChainOfThoughtImage";
