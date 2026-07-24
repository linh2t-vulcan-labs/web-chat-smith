import { cn } from "@/features/suite/utils/classnames";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-v1-surface-glass-dark-mist rounded-v1-medium animate-pulse",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
