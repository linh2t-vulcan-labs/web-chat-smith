"use client";

import { ErrorPageContent } from "@/components/error-page";
import { LoggerError } from "@/components/logger-error";
import { useChunkErrorAutoReload } from "@/components/providers/chunk-error-recovery";
import { CORALOGIX_LABELS } from "@/libs/coralogix";

export default function LocaleErrorBoundary({
  error,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useChunkErrorAutoReload(error);

  return (
    <>
      <ErrorPageContent />
      <LoggerError
        error={error}
        namespace={CORALOGIX_LABELS.ERROR_LOCALE_LAYOUT}
      />
    </>
  );
}
