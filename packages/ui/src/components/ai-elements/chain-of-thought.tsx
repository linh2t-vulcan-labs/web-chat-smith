"use client";

import { IconBrain } from "@cs/icons/brain";
import { IconChevronDown } from "@cs/icons/chevron-down";
import type { LucideIcon } from "lucide-react";
import { DotIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useContext } from "react";

import { Badge } from "#components/shadcn/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#components/shadcn/collapsible";
import { useControllableState } from "#hooks/use-controllable-state";
import { cn } from "#lib/utils";

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

export const ChainOfThought = ({
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

  const chainOfThoughtContext = { isOpen, setIsOpen };

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values -- handled by React Compiler
    <ChainOfThoughtContext.Provider value={chainOfThoughtContext}>
      <div className={cn("not-prose w-full space-y-4", className)} {...props}>
        {children}
      </div>
    </ChainOfThoughtContext.Provider>
  );
};

export type ChainOfThoughtHeaderProps = ComponentProps<
  typeof CollapsibleTrigger
>;

export const ChainOfThoughtHeader = ({
  className,
  children,
  ...props
}: ChainOfThoughtHeaderProps) => {
  const { isOpen, setIsOpen } = useChainOfThought();

  return (
    <Collapsible onOpenChange={setIsOpen} open={isOpen}>
      <CollapsibleTrigger
        className={cn(
          "text-muted-foreground hover:text-foreground flex w-full items-center gap-2 text-sm transition-colors",
          className
        )}
        {...props}
      >
        <IconBrain className="size-4" />
        <span className="flex-1 text-left">
          {children ?? "Chain of Thought"}
        </span>
        <IconChevronDown
          className={cn(
            "size-4 transition-transform",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </CollapsibleTrigger>
    </Collapsible>
  );
};

export type ChainOfThoughtStepProps = ComponentProps<"div"> & {
  icon?: LucideIcon;
  label: ReactNode;
  description?: ReactNode;
  status?: "complete" | "active" | "pending";
};

const stepStatusStyles = {
  active: "text-foreground",
  complete: "text-muted-foreground",
  pending: "text-muted-foreground/50",
};

export const ChainOfThoughtStep = ({
  className,
  icon: Icon = DotIcon,
  label,
  description,
  status = "complete",
  children,
  ...props
}: ChainOfThoughtStepProps) => (
  <div
    className={cn(
      "flex gap-2 text-sm",
      stepStatusStyles[status],
      "fade-in-0 slide-in-from-top-2 animate-in",
      className
    )}
    {...props}
  >
    <div className="relative mt-0.5">
      <Icon className="size-4" />
      <div className="bg-border absolute top-7 bottom-0 left-1/2 -mx-px w-px" />
    </div>
    <div className="flex-1 space-y-2 overflow-hidden">
      <div>{label}</div>
      {description && (
        <div className="text-muted-foreground text-xs">{description}</div>
      )}
      {children}
    </div>
  </div>
);

export type ChainOfThoughtSearchResultsProps = ComponentProps<"div">;

export const ChainOfThoughtSearchResults = ({
  className,
  ...props
}: ChainOfThoughtSearchResultsProps) => (
  <div
    className={cn("flex flex-wrap items-center gap-2", className)}
    {...props}
  />
);

export type ChainOfThoughtSearchResultProps = ComponentProps<typeof Badge>;

export const ChainOfThoughtSearchResult = ({
  className,
  children,
  ...props
}: ChainOfThoughtSearchResultProps) => (
  <Badge
    className={cn("gap-1 px-2 py-0.5 text-xs font-normal", className)}
    variant="secondary"
    {...props}
  >
    {children}
  </Badge>
);

export type ChainOfThoughtContentProps = ComponentProps<
  typeof CollapsibleContent
>;

export const ChainOfThoughtContent = ({
  className,
  children,
  ...props
}: ChainOfThoughtContentProps) => {
  const { isOpen } = useChainOfThought();

  return (
    <Collapsible open={isOpen}>
      <CollapsibleContent
        className={cn(
          "mt-2 space-y-3",
          "text-popover-foreground outline-none",
          className
        )}
        {...props}
      >
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export type ChainOfThoughtImageProps = ComponentProps<"div"> & {
  caption?: string;
};

export const ChainOfThoughtImage = ({
  className,
  children,
  caption,
  ...props
}: ChainOfThoughtImageProps) => (
  <div className={cn("mt-2 space-y-2", className)} {...props}>
    <div className="bg-muted relative flex max-h-[22rem] items-center justify-center overflow-hidden rounded-lg p-3">
      {children}
    </div>
    {caption && <p className="text-muted-foreground text-xs">{caption}</p>}
  </div>
);
