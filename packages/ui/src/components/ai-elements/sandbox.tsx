"use client";

import type { ToolUIPart } from "ai";
import { ChevronDownIcon, Code } from "lucide-react";
import type { ComponentProps } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#components/shadcn/collapsible";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "#components/shadcn/tabs";
import { cn } from "#lib/utils";

import { getStatusBadge } from "./tool";

export type SandboxRootProps = ComponentProps<typeof Collapsible>;

export const Sandbox = ({ className, ...props }: SandboxRootProps) => (
  <Collapsible
    className={cn(
      "not-prose group mb-4 w-full overflow-hidden rounded-md border",
      className
    )}
    defaultOpen
    {...props}
  />
);

export interface SandboxHeaderProps {
  title?: string;
  state: ToolUIPart["state"];
  className?: string;
}

export const SandboxHeader = ({
  className,
  title,
  state,
  ...props
}: SandboxHeaderProps) => (
  <CollapsibleTrigger
    className={cn(
      "flex w-full items-center justify-between gap-4 p-3",
      className
    )}
    {...props}
  >
    <div className="flex items-center gap-2">
      <Code className="text-muted-foreground size-4" />
      <span className="text-sm font-medium">{title}</span>
      {getStatusBadge(state)}
    </div>
    <ChevronDownIcon className="text-muted-foreground size-4 transition-transform group-data-open:rotate-180" />
  </CollapsibleTrigger>
);

export type SandboxContentProps = ComponentProps<typeof CollapsibleContent>;

export const SandboxContent = ({
  className,
  ...props
}: SandboxContentProps) => (
  <CollapsibleContent className={cn("outline-none", className)} {...props} />
);

export type SandboxTabsProps = ComponentProps<typeof Tabs>;

export const SandboxTabs = ({ className, ...props }: SandboxTabsProps) => (
  <Tabs className={cn("w-full gap-0", className)} {...props} />
);

export type SandboxTabsBarProps = ComponentProps<"div">;

export const SandboxTabsBar = ({
  className,
  ...props
}: SandboxTabsBarProps) => (
  <div
    className={cn(
      "border-border flex w-full items-center border-t border-b",
      className
    )}
    {...props}
  />
);

export type SandboxTabsListProps = ComponentProps<typeof TabsList>;

export const SandboxTabsList = ({
  className,
  ...props
}: SandboxTabsListProps) => (
  <TabsList
    className={cn("h-auto rounded-none border-0 bg-transparent p-0", className)}
    {...props}
  />
);

export type SandboxTabsTriggerProps = ComponentProps<typeof TabsTrigger>;

export const SandboxTabsTrigger = ({
  className,
  ...props
}: SandboxTabsTriggerProps) => (
  <TabsTrigger
    className={cn(
      "text-muted-foreground data-active:border-primary data-active:text-foreground rounded-none border-0 border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-colors data-active:bg-transparent data-active:shadow-none",
      className
    )}
    {...props}
  />
);

export type SandboxTabContentProps = ComponentProps<typeof TabsContent>;

export const SandboxTabContent = ({
  className,
  ...props
}: SandboxTabContentProps) => (
  <TabsContent className={cn("mt-0 text-sm", className)} {...props} />
);
