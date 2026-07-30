"use client";

import { InlineError } from "@cs/ui/components/cs/inline-error";
import { useExtracted } from "next-intl";
import { useEffect } from "react";

interface RouteErrorFallbackProps {
  error: Error & { digest?: string };
  retry: () => void;
}

/**
 * Shared body for every `(marketing|workspace)/[locale]/error.tsx` — a
 * route-segment render error isn't necessarily an `ApiError` (it can be any
 * thrown error), so this uses generic localized copy rather than
 * `useApiErrorCopy` (that hook is for known `ApiError`s from a query).
 */
export const RouteErrorFallback = ({
  error,
  retry,
}: RouteErrorFallbackProps) => {
  const t = useExtracted();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <InlineError
        className="max-w-md"
        description={t({
          id: "Common.errors.route.description",
          message: "An unexpected error occurred while loading this page.",
        })}
        onRetry={retry}
        retryLabel={t({
          id: "Common.actions.retry",
          message: "Try again",
        })}
        title={t({
          id: "Common.errors.route.title",
          message: "Something went wrong",
        })}
      />
    </div>
  );
};
