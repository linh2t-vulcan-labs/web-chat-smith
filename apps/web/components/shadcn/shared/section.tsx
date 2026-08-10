import { cn } from "@cs/ui/lib/utils";
import * as React from "react";

export const ShadcnSection = ({
  children,
  className,
  description,
  title,
}: React.ComponentProps<"section"> & {
  title: string;
  description?: string;
}) => (
  <section className={cn("space-y-4", className)}>
    <div className="space-y-1">
      <h2 className="text-xl font-semibold tracking-normal">{title}</h2>
      {description ? (
        <p className="text-muted-foreground max-w-3xl text-sm">{description}</p>
      ) : null}
    </div>
    {children}
  </section>
);

export const ShadcnPanel = ({
  children,
  className,
  title,
  ...props
}: React.ComponentProps<"div"> & {
  title: string;
}) => (
  <div
    {...props}
    className={cn(
      "bg-background min-w-0 rounded-lg border p-4 shadow-xs",
      className
    )}
  >
    <div className="mb-3 text-sm font-medium">{title}</div>
    {children}
  </div>
);

export const ShadcnGrid = ({
  children,
  className,
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3",
      className
    )}
  >
    {children}
  </div>
);
