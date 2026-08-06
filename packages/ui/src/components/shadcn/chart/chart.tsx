"use client";

import * as React from "react";
// oxlint-disable-next-line react-doctor/prefer-dynamic-import -- ChartTooltip/ChartLegend re-export recharts primitives directly and ChartContainer renders ResponsiveContainer synchronously in its return; dynamic-importing recharts here would turn every exported component async and break the synchronous public API consumers rely on.
import * as RechartsPrimitive from "recharts";
import type { TooltipValueType } from "recharts";

import { cn } from "#lib/utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { dark: ".dark", light: "" } as const;

const INITIAL_DIMENSION = { height: 200, width: 320 } as const;
type TooltipNameType = number | string;

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
>;

interface ChartContextProps {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextProps | null>(null);

const useChart = () => {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
};

/** The nested `payload.payload` object recharts attaches to each tooltip/legend item, when present and itself an object. */
const getNestedPayload = (payload: object): object | undefined =>
  "payload" in payload &&
  typeof payload.payload === "object" &&
  payload.payload !== null
    ? payload.payload
    : undefined;

/** A string value at `key` on `source`, used to resolve which config entry a payload item's label maps to. */
const getStringField = (source: object, key: string): string | undefined =>
  key in source && typeof source[key as keyof typeof source] === "string"
    ? (source[key as keyof typeof source] as string)
    : undefined;

/** The config key a payload item's label should use — its own `key` field, falling back to the nested payload's, falling back to `key` itself. */
const resolveConfigLabelKey = (payload: object, key: string): string => {
  const ownKey = getStringField(payload, key);
  if (ownKey) {
    return ownKey;
  }

  const nestedPayload = getNestedPayload(payload);
  const nestedKey = nestedPayload && getStringField(nestedPayload, key);

  return nestedKey ?? key;
};

const getPayloadConfigFromPayload = (
  config: ChartConfig,
  payload: unknown,
  key: string
) => {
  if (typeof payload !== "object" || payload === null) {
    return;
  }

  const configLabelKey = resolveConfigLabelKey(payload, key);

  return configLabelKey in config ? config[configLabelKey] : config[key];
};

const DEFAULT_PAYLOAD_KEY = "value";

/** The first defined candidate, stringified — used across the tooltip/legend to resolve a payload item's config key (explicit key, then item name/dataKey, then a shared fallback). */
const resolvePayloadKey = (...candidates: unknown[]): string => {
  for (const candidate of candidates) {
    if (candidate !== undefined) {
      return `${candidate}`;
    }
  }
  return DEFAULT_PAYLOAD_KEY;
};

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, itemConfig]) => itemConfig.theme ?? itemConfig.color
  );

  if (!colorConfig.length) {
    return null;
  }

  const css = Object.entries(THEMES)
    .map(
      ([theme, prefix]) =>
        `${prefix} [data-chart=${id}] {\n${colorConfig
          .flatMap(([key, itemConfig]) => {
            const color =
              itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ??
              itemConfig.color;
            return color ? [`  --color-${key}: ${color};`] : [];
          })
          .join("\n")}\n}`
    )
    .join("\n");

  return <style>{css}</style>;
};

const ChartContainer = ({
  id,
  className,
  children,
  config,
  initialDimension = INITIAL_DIMENSION,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
  initialDimension?: {
    width: number;
    height: number;
  };
}) => {
  const uniqueId = React.useId();
  const chartId = `chart-${(id ?? uniqueId).replaceAll(/[^a-zA-Z0-9_-]/gu, "")}`;
  const contextValue = { config };

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values -- handled by React Compiler
    <ChartContext value={contextValue}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer
          initialDimension={initialDimension}
        >
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext>
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

type IndicatorType = "line" | "dot" | "dashed";

/** The tooltip/legend row's indicator styling — grouped since callers always pass these together. */
interface ChartTooltipIndicatorSettings {
  hideIndicator: boolean;
  indicator: IndicatorType;
  indicatorColor: string | undefined;
}

const ChartTooltipIndicator = ({
  hideIndicator,
  icon: Icon,
  indicator,
  indicatorColor,
  nestLabel,
}: ChartTooltipIndicatorSettings & {
  icon?: React.ComponentType;
  nestLabel: boolean;
}) => {
  if (Icon) {
    return <Icon />;
  }

  if (hideIndicator) {
    return null;
  }

  return (
    <div
      className={cn(
        "shrink-0 rounded-xs border-(--color-border) bg-(--color-bg)",
        {
          "h-2.5 w-2.5": indicator === "dot",
          "my-0.5": nestLabel && indicator === "dashed",
          "w-0 border-[1.5px] border-dashed bg-transparent":
            indicator === "dashed",
          "w-1": indicator === "line",
        }
      )}
      style={
        {
          "--color-bg": indicatorColor,
          "--color-border": indicatorColor,
        } as React.CSSProperties
      }
    />
  );
};

type ChartTooltipContentProps = React.ComponentProps<
  typeof RechartsPrimitive.Tooltip
> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
  } & Omit<
    RechartsPrimitive.DefaultTooltipContentProps<
      TooltipValueType,
      TooltipNameType
    >,
    "accessibilityLayer"
  >;

/** How the tooltip's label value is resolved — against which `config` and (optionally) which explicit `labelKey`. */
type ChartTooltipLabelSource = Pick<
  ChartTooltipContentProps,
  "labelKey" | "payload"
> & { config: ChartConfig };

/** How the tooltip's label value is displayed once resolved. */
type ChartTooltipLabelDisplay = Pick<
  ChartTooltipContentProps,
  "label" | "labelClassName" | "labelFormatter"
>;

interface ChartTooltipLabelProps {
  display: ChartTooltipLabelDisplay;
  hideLabel?: boolean;
  source: ChartTooltipLabelSource;
}

type ChartTooltipPayloadItem = NonNullable<
  ChartTooltipContentProps["payload"]
>[number];

/** The config key a tooltip label should resolve against — `labelKey` if given, else the first payload item's `dataKey`/`name`. */
const resolveTooltipLabelKey = (
  labelKey: string | undefined,
  item: ChartTooltipPayloadItem | undefined
): string => resolvePayloadKey(labelKey, item?.dataKey, item?.name);

/** `config`'s label for a plain string `label`, falling back to `label` itself when it has no config entry. */
const resolveConfigLabelText = (
  config: ChartConfig,
  label: string
): React.ReactNode => config[label]?.label ?? label;

/** The tooltip's label content — the plain `label` prop (resolved against `config` by name) unless a `labelKey` opts into resolving it against the first payload item's config entry instead. */
const resolveTooltipLabelValue = (
  source: ChartTooltipLabelSource,
  payload: NonNullable<ChartTooltipLabelSource["payload"]>,
  label: ChartTooltipLabelDisplay["label"]
): React.ReactNode => {
  const [item] = payload;

  if (!source.labelKey && typeof label === "string") {
    return resolveConfigLabelText(source.config, label);
  }

  const key = resolveTooltipLabelKey(source.labelKey, item);
  const itemConfig = getPayloadConfigFromPayload(source.config, item, key);
  return itemConfig?.label;
};

const ChartTooltipLabel = ({
  display,
  hideLabel,
  source,
}: ChartTooltipLabelProps) => {
  const { payload } = source;

  if (hideLabel || !payload?.length) {
    return null;
  }

  const value = resolveTooltipLabelValue(source, payload, display.label);

  if (display.labelFormatter) {
    return (
      <div className={cn("font-medium", display.labelClassName)}>
        {display.labelFormatter(value, payload)}
      </div>
    );
  }

  if (!value) {
    return null;
  }

  return (
    <div className={cn("font-medium", display.labelClassName)}>{value}</div>
  );
};

/** The tooltip row content that passes through every `<ChartTooltipItem>`/`<ChartTooltipItemDefault>` unchanged. */
type ChartTooltipItemContent = Pick<ChartTooltipContentProps, "formatter"> & {
  nestLabel: boolean;
  tooltipLabel: React.ReactNode;
};

interface ChartTooltipItemProps {
  index: number;
  indicatorSettings: ChartTooltipIndicatorSettings;
  item: ChartTooltipPayloadItem;
  itemConfig: ReturnType<typeof getPayloadConfigFromPayload>;
  itemContent: ChartTooltipItemContent;
}

/** `item.value` formatted for display — grouped digits for numbers, as-is otherwise. Returns `null` when there's no value to show. */
const formatTooltipItemValue = (
  value: ChartTooltipPayloadItem["value"]
): React.ReactNode => {
  if (value === null || value === undefined) {
    return null;
  }
  return typeof value === "number" ? value.toLocaleString() : String(value);
};

type ChartTooltipItemDefaultProps = Pick<
  ChartTooltipItemProps,
  "indicatorSettings" | "item" | "itemConfig" | "itemContent"
>;

/** The tooltip row's display label — the resolved config label, falling back to the item's raw `name`. */
const resolveTooltipItemLabel = (
  itemConfig: ChartTooltipItemDefaultProps["itemConfig"],
  item: ChartTooltipItemDefaultProps["item"]
): React.ReactNode => itemConfig?.label ?? item.name;

/** The tooltip row's built-in rendering (indicator + label + formatted value), used whenever the caller doesn't supply a custom `formatter`. */
const ChartTooltipItemDefault = ({
  indicatorSettings,
  item,
  itemConfig,
  itemContent,
}: ChartTooltipItemDefaultProps) => {
  const { nestLabel, tooltipLabel } = itemContent;
  const formattedValue = formatTooltipItemValue(item.value);
  const hasFormattedValue = formattedValue !== null;

  return (
    <>
      <ChartTooltipIndicator
        {...indicatorSettings}
        icon={itemConfig?.icon}
        nestLabel={nestLabel}
      />
      <div
        className={cn(
          "flex flex-1 justify-between leading-none",
          nestLabel ? "items-end" : "items-center"
        )}
      >
        <div className="grid gap-1.5">
          {nestLabel ? tooltipLabel : null}
          <span className="text-muted-foreground">
            {resolveTooltipItemLabel(itemConfig, item)}
          </span>
        </div>
        {hasFormattedValue && (
          <span className="font-mono font-medium text-foreground tabular-nums">
            {formattedValue}
          </span>
        )}
      </div>
    </>
  );
};

const ChartTooltipItem = ({
  index,
  indicatorSettings,
  item,
  itemConfig,
  itemContent,
}: ChartTooltipItemProps) => {
  const { formatter } = itemContent;
  const className = cn(
    "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
    indicatorSettings.indicator === "dot" && "items-center"
  );

  if (formatter && item.value !== undefined && item.name) {
    return (
      <div className={className}>
        {formatter(item.value, item.name, item, index, item.payload)}
      </div>
    );
  }

  return (
    <div className={className}>
      <ChartTooltipItemDefault
        indicatorSettings={indicatorSettings}
        item={item}
        itemConfig={itemConfig}
        itemContent={itemContent}
      />
    </div>
  );
};

/** The tooltip-wide indicator styling, shared by every row (the per-row color is resolved from `color` and the item itself). */
type ChartTooltipIndicatorConfig = Pick<ChartTooltipContentProps, "color"> & {
  hideIndicator: boolean;
  indicator: IndicatorType;
};

type ChartTooltipItemsProps = Pick<
  ChartTooltipContentProps,
  "nameKey" | "payload"
> & {
  config: ChartConfig;
  indicatorConfig: ChartTooltipIndicatorConfig;
  itemContent: ChartTooltipItemContent;
};

/** The indicator color for a tooltip row — the chart-level override if given, else the item's own fill/color. */
const resolveIndicatorColor = (
  color: ChartTooltipIndicatorConfig["color"],
  item: ChartTooltipPayloadItem
): string | undefined => color ?? item.payload?.fill ?? item.color;

const ChartTooltipItems = ({
  config,
  indicatorConfig,
  itemContent,
  nameKey,
  payload,
}: ChartTooltipItemsProps) => {
  const items: React.ReactNode[] = [];
  let visibleIndex = 0;

  for (const item of payload ?? []) {
    if (item.type === "none") {
      continue;
    }

    const index = visibleIndex;
    visibleIndex += 1;

    const itemKey = resolvePayloadKey(nameKey, item.name, item.dataKey);
    const itemConfig = getPayloadConfigFromPayload(config, item, itemKey);
    const indicatorSettings: ChartTooltipIndicatorSettings = {
      hideIndicator: indicatorConfig.hideIndicator,
      indicator: indicatorConfig.indicator,
      indicatorColor: resolveIndicatorColor(indicatorConfig.color, item),
    };

    items.push(
      <ChartTooltipItem
        index={index}
        indicatorSettings={indicatorSettings}
        item={item}
        itemConfig={itemConfig}
        itemContent={itemContent}
        key={itemKey}
      />
    );
  }

  return items;
};

const ChartTooltipContent = ({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: ChartTooltipContentProps) => {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== "dot";
  const tooltipLabel = (
    <ChartTooltipLabel
      display={{ label, labelClassName, labelFormatter }}
      hideLabel={hideLabel}
      source={{ config, labelKey, payload }}
    />
  );

  return (
    <div
      className={cn(
        "grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {nestLabel ? null : tooltipLabel}
      <div className="grid gap-1.5">
        <ChartTooltipItems
          config={config}
          indicatorConfig={{ color, hideIndicator, indicator }}
          itemContent={{ formatter, nestLabel, tooltipLabel }}
          nameKey={nameKey}
          payload={payload}
        />
      </div>
    </div>
  );
};

const ChartLegend = RechartsPrimitive.Legend;

type ChartLegendPayloadItem = NonNullable<
  RechartsPrimitive.DefaultLegendContentProps["payload"]
>[number];

interface ChartLegendItemProps {
  hideIcon: boolean;
  item: ChartLegendPayloadItem;
  itemConfig: ReturnType<typeof getPayloadConfigFromPayload>;
}

const ChartLegendItem = ({
  hideIcon,
  item,
  itemConfig,
}: ChartLegendItemProps) => (
  <div className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground">
    {itemConfig?.icon && !hideIcon ? (
      <itemConfig.icon />
    ) : (
      <div
        className="h-2 w-2 shrink-0 rounded-xs"
        style={{
          backgroundColor: item.color,
        }}
      />
    )}
    {itemConfig?.label}
  </div>
);

interface ChartLegendItemsProps {
  config: ChartConfig;
  hideIcon: boolean;
  nameKey?: string;
  payload: RechartsPrimitive.DefaultLegendContentProps["payload"];
}

const ChartLegendItems = ({
  config,
  hideIcon,
  nameKey,
  payload,
}: ChartLegendItemsProps) => {
  const items: React.ReactNode[] = [];

  for (const item of payload ?? []) {
    if (item.type === "none") {
      continue;
    }

    const itemKey = resolvePayloadKey(nameKey, item.dataKey);
    const itemConfig = getPayloadConfigFromPayload(config, item, itemKey);

    items.push(
      <ChartLegendItem
        hideIcon={hideIcon}
        item={item}
        itemConfig={itemConfig}
        key={itemKey}
      />
    );
  }

  return items;
};

const ChartLegendContent = ({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> & {
  hideIcon?: boolean;
  nameKey?: string;
} & RechartsPrimitive.DefaultLegendContentProps) => {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      <ChartLegendItems
        config={config}
        hideIcon={hideIcon}
        nameKey={nameKey}
        payload={payload}
      />
    </div>
  );
};

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
