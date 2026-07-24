"use client";

import "./globals.css";
import { ErrorPageContent } from "@/components/error-page";
import { LoggerError } from "@/components/logger-error";
import { RootFallbackShell } from "@/components/root-fallback-shell";
import { CORALOGIX_LABELS } from "@/libs/coralogix";

export default function GlobalError({
  error,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <RootFallbackShell>
      <ErrorPageContent />
      <LoggerError
        error={error}
        namespace={CORALOGIX_LABELS.GLOBAL_ERROR_PAGE}
      />
    </RootFallbackShell>
  );
}
