"use client";

import { ChevronDownIcon, SearchIcon } from "lucide-react";
import type { ComponentProps, ReactElement } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#components/shadcn/collapsible";
import { cn } from "#lib/utils";

export type TaskItemFileProps = ComponentProps<"div">;

export const TaskItemFile = ({
  children,
  className,
  ...props
}: TaskItemFileProps) => (
  <div
    className={cn(
      "inline-flex items-center gap-1 rounded-md border bg-secondary px-1.5 py-0.5 text-foreground text-xs",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export type TaskItemProps = ComponentProps<"div">;

export const TaskItem = ({ children, className, ...props }: TaskItemProps) => (
  <div className={cn("text-muted-foreground text-sm", className)} {...props}>
    {children}
  </div>
);

export type TaskProps = ComponentProps<typeof Collapsible>;

export const Task = ({
  defaultOpen = true,
  className,
  ...props
}: TaskProps) => (
  <Collapsible className={cn(className)} defaultOpen={defaultOpen} {...props} />
);

export type TaskTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  title: string;
};

export const TaskTrigger = ({
  children,
  className,
  title,
  ...props
}: TaskTriggerProps) =>
  children ? (
    <CollapsibleTrigger
      render={children as ReactElement}
      className={cn("group", className)}
      {...props}
    />
  ) : (
    <CollapsibleTrigger
      render={
        // oxlint-disable-next-line jsx-a11y/control-has-associated-label -- accessible text comes from the icon/title/chevron children below, merged into this button by CollapsibleTrigger's render prop
        <button
          className={cn(
            "group flex w-full cursor-pointer items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground",
            className
          )}
          type="button"
        />
      }
      {...props}
    >
      <SearchIcon className="size-4" />
      <p className="text-sm">{title}</p>
      <ChevronDownIcon className="size-4 transition-transform group-data-open:rotate-180" />
    </CollapsibleTrigger>
  );

export type TaskContentProps = ComponentProps<typeof CollapsibleContent>;

export const TaskContent = ({
  children,
  className,
  ...props
}: TaskContentProps) => (
  <CollapsibleContent
    className={cn("text-popover-foreground outline-none", className)}
    {...props}
  >
    <div className="mt-4 space-y-2 border-muted border-l-2 pl-4">
      {children}
    </div>
  </CollapsibleContent>
);
