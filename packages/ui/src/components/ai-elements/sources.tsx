"use client";

import { BookIcon, ChevronDownIcon } from "lucide-react";
import type { ComponentProps } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#components/shadcn/collapsible";
import { cn } from "#lib/utils";

export type SourcesProps = ComponentProps<"div">;

export const Sources = ({ className, ...props }: SourcesProps) => (
  <Collapsible
    className={cn("not-prose text-primary mb-4 text-xs", className)}
    {...props}
  />
);

export type SourcesTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  count: number;
};

export const SourcesTrigger = ({
  className,
  count,
  children,
  ...props
}: SourcesTriggerProps) => (
  <CollapsibleTrigger
    className={cn("flex items-center gap-2", className)}
    {...props}
  >
    {children ?? (
      <>
        <p className="font-medium">Used {count} sources</p>
        <ChevronDownIcon className="h-4 w-4" />
      </>
    )}
  </CollapsibleTrigger>
);

export type SourcesContentProps = ComponentProps<typeof CollapsibleContent>;

export const SourcesContent = ({
  className,
  children,
  ...props
}: SourcesContentProps) => (
  <CollapsibleContent className={cn("mt-3 outline-none", className)} {...props}>
    {/* `w-fit` (shrink-to-fit) lives on this inner wrapper, not the panel
        Base UI is animating `height` on — sizing that box by its content's
        intrinsic width is a materially more expensive layout computation
        than the plain full-width block `ToolContent`/`ReasoningContent`
        use, and re-deriving it every frame of the height transition is what
        made this specific panel visibly janky while the other two stayed
        smooth. */}
    <div className="flex w-fit flex-col gap-2">{children}</div>
  </CollapsibleContent>
);

export type SourceProps = ComponentProps<"a">;

export const Source = ({ href, title, children, ...props }: SourceProps) => (
  <a
    className="flex items-center gap-2"
    href={href}
    rel="noreferrer"
    target="_blank"
    {...props}
  >
    {children ?? (
      <>
        <BookIcon className="h-4 w-4" />
        <span className="block font-medium">{title}</span>
      </>
    )}
  </a>
);
