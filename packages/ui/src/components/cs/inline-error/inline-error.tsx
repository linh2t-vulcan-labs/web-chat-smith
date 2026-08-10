import { IconAlert } from "@cs/icons/alert";

import { Button } from "#components/shadcn/button";
import { cn } from "#lib/utils";

export interface InlineErrorProps {
  title: string;
  description?: string;
  /** Omit entirely to render without a retry action (e.g. a non-retryable 404). */
  onRetry?: () => void;
  retryLabel: string;
  className?: string;
}

/**
 * Standard inline failure state for a data-fetching region: an alert card with
 * a title, optional description, and an optional retry action — used in place
 * of a toast so the error stays anchored to the region that failed.
 */
export const InlineError = ({
  title,
  description,
  onRetry,
  retryLabel,
  className,
}: InlineErrorProps) => (
  <div
    className={cn(
      "border-destructive/30 bg-destructive/10 flex flex-col gap-3 rounded-lg border p-4 text-sm",
      className
    )}
    role="alert"
  >
    <div className="text-destructive flex items-center gap-2 font-medium">
      <IconAlert aria-hidden="true" className="size-4 shrink-0" />
      <span>{title}</span>
    </div>
    {description && <p className="text-muted-foreground">{description}</p>}
    {onRetry && (
      <Button
        className="self-start"
        onClick={onRetry}
        size="sm"
        type="button"
        variant="outline"
      >
        {retryLabel}
      </Button>
    )}
  </div>
);
