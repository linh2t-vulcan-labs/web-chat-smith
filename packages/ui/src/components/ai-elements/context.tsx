"use client";

import type { LanguageModelUsage } from "ai";
import type { ComponentProps } from "react";
import { createContext, useContext } from "react";
import { getUsage } from "tokenlens";

import { Button } from "#components/shadcn/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "#components/shadcn/hover-card";
import { Progress } from "#components/shadcn/progress";
import { cn } from "#lib/utils";

const PERCENT_MAX = 100;
const ICON_RADIUS = 10;
const ICON_VIEWBOX = 24;
const ICON_CENTER = 12;
const ICON_STROKE_WIDTH = 2;

type ModelId = string;

interface ContextSchema {
  usedTokens: number;
  maxTokens: number;
  usage?: LanguageModelUsage;
  modelId?: ModelId;
}

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  style: "percent",
});
const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
});
const usdFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

const ContextContext = createContext<ContextSchema | null>(null);

const useContextValue = () => {
  const context = useContext(ContextContext);

  if (!context) {
    throw new Error("Context components must be used within Context");
  }

  return context;
};

export type ContextProps = ComponentProps<typeof HoverCard> & ContextSchema;

export const Context = ({
  usedTokens,
  maxTokens,
  usage,
  modelId,
  ...props
}: ContextProps) => {
  const contextValue = { maxTokens, modelId, usage, usedTokens };

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values -- handled by React Compiler
    <ContextContext.Provider value={contextValue}>
      <HoverCard {...props} />
    </ContextContext.Provider>
  );
};

const ContextIcon = () => {
  const { usedTokens, maxTokens } = useContextValue();
  const circumference = 2 * Math.PI * ICON_RADIUS;
  const usedPercent = usedTokens / maxTokens;
  const dashOffset = circumference * (1 - usedPercent);

  return (
    <svg
      aria-label="Model context usage"
      height="20"
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- inline SVG icon, role="img" + aria-label is the standard accessible-name pattern
      role="img"
      style={{ color: "currentcolor" }}
      viewBox={`0 0 ${ICON_VIEWBOX} ${ICON_VIEWBOX}`}
      width="20"
    >
      <circle
        cx={ICON_CENTER}
        cy={ICON_CENTER}
        fill="none"
        opacity="0.25"
        r={ICON_RADIUS}
        stroke="currentColor"
        strokeWidth={ICON_STROKE_WIDTH}
      />
      <circle
        cx={ICON_CENTER}
        cy={ICON_CENTER}
        fill="none"
        opacity="0.7"
        r={ICON_RADIUS}
        stroke="currentColor"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        strokeWidth={ICON_STROKE_WIDTH}
        style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
      />
    </svg>
  );
};

export type ContextTriggerProps = ComponentProps<typeof Button>;

export const ContextTrigger = ({ children, ...props }: ContextTriggerProps) => {
  const { usedTokens, maxTokens } = useContextValue();
  const usedPercent = usedTokens / maxTokens;
  const renderedPercent = percentFormatter.format(usedPercent);

  return (
    <HoverCardTrigger
      render={
        children ? (
          (children as React.ReactElement)
        ) : (
          <Button type="button" variant="ghost" {...props} />
        )
      }
    >
      {children ? undefined : (
        <>
          <span className="text-muted-foreground font-medium">
            {renderedPercent}
          </span>
          <ContextIcon />
        </>
      )}
    </HoverCardTrigger>
  );
};

export type ContextContentProps = ComponentProps<typeof HoverCardContent>;

export const ContextContent = ({
  className,
  ...props
}: ContextContentProps) => (
  <HoverCardContent
    className={cn("min-w-60 divide-y overflow-hidden p-0", className)}
    {...props}
  />
);

export type ContextContentHeaderProps = ComponentProps<"div">;

export const ContextContentHeader = ({
  children,
  className,
  ...props
}: ContextContentHeaderProps) => {
  const { usedTokens, maxTokens } = useContextValue();
  const usedPercent = usedTokens / maxTokens;
  const displayPct = percentFormatter.format(usedPercent);
  const used = compactNumberFormatter.format(usedTokens);
  const total = compactNumberFormatter.format(maxTokens);

  return (
    <div className={cn("w-full space-y-2 p-3", className)} {...props}>
      {children ?? (
        <>
          <div className="flex items-center justify-between gap-3 text-xs">
            <p>{displayPct}</p>
            <p className="text-muted-foreground font-mono">
              {used} / {total}
            </p>
          </div>
          <div className="space-y-2">
            <Progress className="bg-muted" value={usedPercent * PERCENT_MAX} />
          </div>
        </>
      )}
    </div>
  );
};

export type ContextContentBodyProps = ComponentProps<"div">;

export const ContextContentBody = ({
  children,
  className,
  ...props
}: ContextContentBodyProps) => (
  <div className={cn("w-full p-3", className)} {...props}>
    {children}
  </div>
);

type UsageKind = "cache" | "input" | "output" | "reasoning";

// Lookup table instead of a switch: each kind reads a different nested
// path off `usage`, so a table of accessors keeps the branching in data
// rather than in control flow.
const usageTokenReaders: Record<
  UsageKind,
  (usage: LanguageModelUsage | undefined) => number | undefined
> = {
  cache: (usage) => usage?.inputTokenDetails?.cacheReadTokens,
  input: (usage) => usage?.inputTokens,
  output: (usage) => usage?.outputTokens,
  reasoning: (usage) => usage?.outputTokenDetails?.reasoningTokens,
};

const getUsageTokens = (
  usage: LanguageModelUsage | undefined,
  kind: UsageKind
): number => usageTokenReaders[kind](usage) ?? 0;

// Extracted so ContextContentFooter's own branching stays limited to the
// children-fallback ternary; reuses getUsageTokens instead of re-reading
// usage fields inline to avoid stacking optional-chain/nullish operators.
const computeModelCostUSD = (
  modelId: ModelId | undefined,
  usage: LanguageModelUsage | undefined
): number | undefined => {
  if (!modelId) {
    return undefined;
  }

  return getUsage({
    modelId,
    usage: {
      input: getUsageTokens(usage, "input"),
      output: getUsageTokens(usage, "output"),
    },
  }).costUSD?.totalUSD;
};

export type ContextContentFooterProps = ComponentProps<"div">;

export const ContextContentFooter = ({
  children,
  className,
  ...props
}: ContextContentFooterProps) => {
  const { modelId, usage } = useContextValue();
  const costUSD = computeModelCostUSD(modelId, usage);
  const totalCost = usdFormatter.format(costUSD ?? 0);

  return (
    <div
      className={cn(
        "bg-secondary flex w-full items-center justify-between gap-3 p-3 text-xs",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <span className="text-muted-foreground">Total cost</span>
          <span>{totalCost}</span>
        </>
      )}
    </div>
  );
};

const TokensWithCost = ({
  tokens,
  costText,
}: {
  tokens?: number;
  costText?: string;
}) => (
  <span>
    {tokens === undefined ? "—" : compactNumberFormatter.format(tokens)}
    {costText ? (
      <span className="text-muted-foreground ml-2">• {costText}</span>
    ) : null}
  </span>
);

const USAGE_LABELS: Record<UsageKind, string> = {
  cache: "Cache",
  input: "Input",
  output: "Output",
  reasoning: "Reasoning",
};

const getUsageCostUSD = (
  modelId: ModelId | undefined,
  kind: UsageKind,
  tokens: number
): number | undefined => {
  if (!modelId) {
    return undefined;
  }

  const usageByKind: Record<
    UsageKind,
    Parameters<typeof getUsage>[0]["usage"]
  > = {
    cache: { cacheReads: tokens, input: 0, output: 0 },
    input: { input: tokens, output: 0 },
    output: { input: 0, output: tokens },
    reasoning: { reasoningTokens: tokens },
  };

  return getUsage({ modelId, usage: usageByKind[kind] }).costUSD?.totalUSD;
};

type ContextUsageRowProps = ComponentProps<"div"> & {
  kind: UsageKind;
};

const ContextUsageRow = ({
  kind,
  className,
  children,
  ...props
}: ContextUsageRowProps) => {
  const { usage, modelId } = useContextValue();
  const tokens = getUsageTokens(usage, kind);

  if (children) {
    return children;
  }

  if (!tokens) {
    return null;
  }

  const costText = usdFormatter.format(
    getUsageCostUSD(modelId, kind, tokens) ?? 0
  );

  return (
    <div
      className={cn("flex items-center justify-between text-xs", className)}
      {...props}
    >
      <span className="text-muted-foreground">{USAGE_LABELS[kind]}</span>
      <TokensWithCost costText={costText} tokens={tokens} />
    </div>
  );
};

export type ContextInputUsageProps = ComponentProps<"div">;

export const ContextInputUsage = (props: ContextInputUsageProps) => (
  <ContextUsageRow kind="input" {...props} />
);

export type ContextOutputUsageProps = ComponentProps<"div">;

export const ContextOutputUsage = (props: ContextOutputUsageProps) => (
  <ContextUsageRow kind="output" {...props} />
);

export type ContextReasoningUsageProps = ComponentProps<"div">;

export const ContextReasoningUsage = (props: ContextReasoningUsageProps) => (
  <ContextUsageRow kind="reasoning" {...props} />
);

export type ContextCacheUsageProps = ComponentProps<"div">;

export const ContextCacheUsage = (props: ContextCacheUsageProps) => (
  <ContextUsageRow kind="cache" {...props} />
);
