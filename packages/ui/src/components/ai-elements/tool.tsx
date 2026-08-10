"use client";

import { IconChevronDown } from "@cs/icons/chevron-down";
import { IconCircle } from "@cs/icons/circle";
import { IconCircleCheck } from "@cs/icons/circle-check";
import { IconCircleX } from "@cs/icons/circle-x";
import { IconClock } from "@cs/icons/clock";
import type { DynamicToolUIPart, ToolUIPart } from "ai";
import { WrenchIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { isValidElement } from "react";

import { Badge } from "#components/shadcn/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#components/shadcn/collapsible";
import { cn } from "#lib/utils";

import { CodeBlock } from "./code-block";

export type ToolProps = ComponentProps<typeof Collapsible>;

export const Tool = ({ className, ...props }: ToolProps) => (
  <Collapsible
    className={cn("group not-prose mb-4 w-full rounded-md border", className)}
    {...props}
  />
);

export type ToolPart = ToolUIPart | DynamicToolUIPart;

export type ToolHeaderProps = {
  title?: string;
  className?: string;
} & (
  | { type: ToolUIPart["type"]; state: ToolUIPart["state"]; toolName?: never }
  | {
      type: DynamicToolUIPart["type"];
      state: DynamicToolUIPart["state"];
      toolName: string;
    }
);

const statusLabels: Record<ToolPart["state"], string> = {
  "approval-requested": "Awaiting Approval",
  "approval-responded": "Responded",
  "input-available": "Running",
  "input-streaming": "Pending",
  "output-available": "Completed",
  "output-denied": "Denied",
  "output-error": "Error",
};

const statusIcons: Record<ToolPart["state"], ReactNode> = {
  "approval-requested": <IconClock className="size-4 text-yellow-600" />,
  "approval-responded": <IconCircleCheck className="size-4 text-blue-600" />,
  "input-available": <IconClock className="size-4 animate-pulse" />,
  "input-streaming": <IconCircle className="size-4" />,
  "output-available": <IconCircleCheck className="size-4 text-green-600" />,
  "output-denied": <IconCircleX className="size-4 text-orange-600" />,
  "output-error": <IconCircleX className="size-4 text-red-600" />,
};

export const getStatusBadge = (status: ToolPart["state"]) => (
  <Badge className="gap-1.5 rounded-full text-xs" variant="secondary">
    {statusIcons[status]}
    {statusLabels[status]}
  </Badge>
);

export const ToolHeader = ({
  className,
  title,
  type,
  state,
  toolName,
  ...props
}: ToolHeaderProps) => {
  const derivedName =
    type === "dynamic-tool" ? toolName : type.split("-").slice(1).join("-");

  return (
    <CollapsibleTrigger
      className={cn(
        "flex w-full items-center justify-between gap-4 p-3",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <WrenchIcon className="text-muted-foreground size-4" />
        <span className="text-sm font-medium">{title ?? derivedName}</span>
        {getStatusBadge(state)}
      </div>
      <IconChevronDown className="text-muted-foreground size-4 transition-transform group-data-open:rotate-180" />
    </CollapsibleTrigger>
  );
};

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = ({ className, ...props }: ToolContentProps) => (
  <CollapsibleContent
    className={cn(
      "text-popover-foreground space-y-4 p-4 outline-none",
      className
    )}
    {...props}
  />
);

export type ToolInputProps = ComponentProps<"div"> & {
  input: ToolPart["input"];
};

export const ToolInput = ({ className, input, ...props }: ToolInputProps) => (
  <div className={cn("space-y-2 overflow-hidden", className)} {...props}>
    <h4 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
      Parameters
    </h4>
    <div className="bg-muted/50 rounded-md">
      <CodeBlock code={JSON.stringify(input, null, 2)} language="json" />
    </div>
  </div>
);

const isPlainObjectOutput = (
  output: ToolPart["output"]
): output is Record<string, unknown> =>
  typeof output === "object" && output !== null && !isValidElement(output);

const resolveToolOutput = (output: ToolPart["output"]): ReactNode => {
  if (isPlainObjectOutput(output)) {
    return <CodeBlock code={JSON.stringify(output, null, 2)} language="json" />;
  }

  if (typeof output === "string") {
    return <CodeBlock code={output} language="json" />;
  }

  return <div>{output as ReactNode}</div>;
};

const getToolOutputContentClassName = (hasError: boolean) =>
  cn(
    "overflow-x-auto rounded-md text-xs [&_table]:w-full",
    hasError
      ? "bg-destructive/10 text-destructive"
      : "bg-muted/50 text-foreground"
  );

export type ToolOutputProps = ComponentProps<"div"> & {
  output: ToolPart["output"];
  errorText: ToolPart["errorText"];
};

type ToolOutputBodyProps = Pick<ToolOutputProps, "output" | "errorText">;

const ToolOutputBody = ({ output, errorText }: ToolOutputBodyProps) => {
  const hasError = Boolean(errorText);

  return (
    <>
      <h4 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {hasError ? "Error" : "Result"}
      </h4>
      <div className={getToolOutputContentClassName(hasError)}>
        {errorText && <div>{errorText}</div>}
        {resolveToolOutput(output)}
      </div>
    </>
  );
};

export const ToolOutput = ({
  className,
  output,
  errorText,
  ...props
}: ToolOutputProps) => {
  if (!(output || errorText)) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <ToolOutputBody errorText={errorText} output={output} />
    </div>
  );
};
