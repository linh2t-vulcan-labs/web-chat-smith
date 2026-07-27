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

const getPayloadConfigFromPayload = (
  config: ChartConfig,
  payload: unknown,
  key: string
) => {
  if (typeof payload !== "object" || payload === null) {
    return;
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
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

const ChartTooltipIndicator = ({
  hideIndicator,
  icon: Icon,
  indicator,
  indicatorColor,
  nestLabel,
}: {
  hideIndicator: boolean;
  icon?: React.ComponentType;
  indicator: "line" | "dot" | "dashed";
  indicatorColor: string | undefined;
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

type ChartTooltipLabelProps = Pick<
  ChartTooltipContentProps,
  | "hideLabel"
  | "label"
  | "labelClassName"
  | "labelFormatter"
  | "labelKey"
  | "payload"
> & { config: ChartConfig };

const ChartTooltipLabel = ({
  config,
  hideLabel,
  label,
  labelClassName,
  labelFormatter,
  labelKey,
  payload,
}: ChartTooltipLabelProps) => {
  if (hideLabel || !payload?.length) {
    return null;
  }

  const [item] = payload;
  const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`;
  const itemConfig = getPayloadConfigFromPayload(config, item, key);
  const value =
    !labelKey && typeof label === "string"
      ? (config[label]?.label ?? label)
      : itemConfig?.label;

  if (labelFormatter) {
    return (
      <div className={cn("font-medium", labelClassName)}>
        {labelFormatter(value, payload)}
      </div>
    );
  }

  if (!value) {
    return null;
  }

  return <div className={cn("font-medium", labelClassName)}>{value}</div>;
};

type ChartTooltipPayloadItem = NonNullable<
  ChartTooltipContentProps["payload"]
>[number];

type ChartTooltipItemProps = Pick<
  ChartTooltipContentProps,
  "color" | "formatter" | "hideIndicator" | "indicator"
> & {
  config: ChartConfig;
  index: number;
  item: ChartTooltipPayloadItem;
  itemKey: string;
  nestLabel: boolean;
  tooltipLabel: React.ReactNode;
};

const ChartTooltipItem = ({
  color,
  config,
  formatter,
  hideIndicator = false,
  index,
  indicator = "dot",
  item,
  itemKey,
  nestLabel,
  tooltipLabel,
}: ChartTooltipItemProps) => {
  const itemConfig = getPayloadConfigFromPayload(config, item, itemKey);
  const indicatorColor = color ?? item.payload?.fill ?? item.color;

  return (
    <div
      className={cn(
        "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
        indicator === "dot" && "items-center"
      )}
    >
      {formatter && item?.value !== undefined && item.name ? (
        formatter(item.value, item.name, item, index, item.payload)
      ) : (
        <>
          <ChartTooltipIndicator
            hideIndicator={hideIndicator}
            icon={itemConfig?.icon}
            indicator={indicator}
            indicatorColor={indicatorColor}
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
                {itemConfig?.label ?? item.name}
              </span>
            </div>
            {item.value !== null && item.value !== undefined && (
              <span className="font-mono font-medium text-foreground tabular-nums">
                {typeof item.value === "number"
                  ? item.value.toLocaleString()
                  : String(item.value)}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

type ChartTooltipItemsProps = Pick<
  ChartTooltipContentProps,
  "color" | "formatter" | "hideIndicator" | "indicator" | "nameKey" | "payload"
> & {
  config: ChartConfig;
  nestLabel: boolean;
  tooltipLabel: React.ReactNode;
};

const ChartTooltipItems = ({
  color,
  config,
  formatter,
  hideIndicator,
  indicator,
  nameKey,
  nestLabel,
  payload,
  tooltipLabel,
}: ChartTooltipItemsProps) => {
  const items: React.ReactNode[] = [];
  let visibleIndex = 0;

  for (const item of payload ?? []) {
    if (item.type === "none") {
      continue;
    }

    const index = visibleIndex;
    visibleIndex += 1;

    const itemKey = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`;

    items.push(
      <ChartTooltipItem
        color={color}
        config={config}
        formatter={formatter}
        hideIndicator={hideIndicator}
        index={index}
        indicator={indicator}
        item={item}
        itemKey={itemKey}
        key={itemKey}
        nestLabel={nestLabel}
        tooltipLabel={tooltipLabel}
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
      config={config}
      hideLabel={hideLabel}
      label={label}
      labelClassName={labelClassName}
      labelFormatter={labelFormatter}
      labelKey={labelKey}
      payload={payload}
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
          color={color}
          config={config}
          formatter={formatter}
          hideIndicator={hideIndicator}
          indicator={indicator}
          nameKey={nameKey}
          nestLabel={nestLabel}
          payload={payload}
          tooltipLabel={tooltipLabel}
        />
      </div>
    </div>
  );
};

const ChartLegend = RechartsPrimitive.Legend;

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

  const items: React.ReactNode[] = [];

  for (const item of payload) {
    if (item.type === "none") {
      continue;
    }

    const key = `${nameKey ?? item.dataKey ?? "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);

    items.push(
      <div
        key={key}
        className={cn(
          "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
        )}
      >
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
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {items}
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
