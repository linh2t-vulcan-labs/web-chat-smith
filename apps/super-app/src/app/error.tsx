"use client";

import "./globals.css";
import { ErrorPageContent } from "@/components/error-page";
import { LoggerError } from "@/components/logger-error";
import { useChunkErrorAutoReload } from "@/components/providers/chunk-error-recovery";
import { RootFallbackShell } from "@/components/root-fallback-shell";
import { CORALOGIX_LABELS } from "@/libs/coralogix";

export default function ErrorBoundary({
  error,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useChunkErrorAutoReload(error);

  return (
    <RootFallbackShell>
      <ErrorPageContent />
      <LoggerError error={error} namespace={CORALOGIX_LABELS.ERROR_SOURCE} />
    </RootFallbackShell>
  );
}
