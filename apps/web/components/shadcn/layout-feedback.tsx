"use client";

import { ErrorBoundary } from "@cs/ui/components/cs/error-boundary";
import { Button } from "@cs/ui/components/shadcn/button";
import { DirectionProvider } from "@cs/ui/components/shadcn/direction";
import { Toaster, toast } from "@cs/ui/components/shadcn/toast";
import { TriangleAlertIcon } from "lucide-react";
import * as React from "react";

import { ShadcnGrid, ShadcnPanel, ShadcnSection } from "./shared/section";

const ShadcnExplodingPreview = ({ enabled }: { enabled: boolean }) => {
  if (enabled) {
    throw new Error("Example error boundary state");
  }

  return (
    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
      Click the button to verify boundary fallback and reset behavior.
    </div>
  );
};

const ShadcnErrorBoundaryFallback = ({
  error,
  onRecover,
}: {
  error: Error;
  onRecover: () => void;
}) => (
  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
    <div className="flex items-center gap-2 font-medium text-destructive">
      <TriangleAlertIcon className="size-4" aria-hidden="true" />
      Example Error Boundary State
    </div>
    <p className="mt-2 text-muted-foreground">{error.message}</p>
    <Button className="mt-3" size="sm" variant="outline" onClick={onRecover}>
      Reset Preview
    </Button>
  </div>
);

export const ShadcnLayoutFeedback = () => {
  const [explode, setExplode] = React.useState(false);
  const renderFallback = (error: Error, reset: () => void) => (
    <ShadcnErrorBoundaryFallback
      error={error}
      onRecover={() => {
        setExplode(false);
        reset();
      }}
    />
  );

  return (
    <ShadcnSection
      title="Layout, RTL, and Feedback"
      description="Direction provider, error boundary, and toast surface mounted for interaction checks."
    >
      <ShadcnGrid>
        <ShadcnPanel title="RTL direction provider">
          <DirectionProvider direction="rtl">
            <div dir="rtl" className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">RTL preview</div>
                  <p className="text-sm text-muted-foreground">
                    Inline spacing, text alignment, and icons should flip.
                  </p>
                </div>
                <Button variant="outline">إجراء</Button>
              </div>
            </div>
          </DirectionProvider>
        </ShadcnPanel>

        <ShadcnPanel title="Error boundary">
          <ErrorBoundary fallback={renderFallback}>
            <ShadcnExplodingPreview enabled={explode} />
          </ErrorBoundary>
          <Button
            className="mt-3"
            size="sm"
            variant="destructive"
            onClick={() => setExplode(true)}
          >
            Trigger error
          </Button>
        </ShadcnPanel>

        <ShadcnPanel title="Sonner toaster">
          <Toaster />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() =>
                toast.add({
                  title: "Saved successfully",
                  type: "success",
                })
              }
            >
              Success toast
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast.add({
                  description: "Check responsive spacing",
                  type: "warning",
                })
              }
            >
              Warning toast
            </Button>
          </div>
        </ShadcnPanel>
      </ShadcnGrid>
    </ShadcnSection>
  );
};
