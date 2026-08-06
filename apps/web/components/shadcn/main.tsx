"use client";

import { Badge } from "@cs/ui/components/shadcn/badge";
import { Button } from "@cs/ui/components/shadcn/button";
import { Separator } from "@cs/ui/components/shadcn/separator";
import * as React from "react";

import { ShadcnDataDisplay } from "./data-display";
import { ShadcnForms } from "./forms";
import { ShadcnFoundations } from "./foundations";
import { ShadcnLayoutFeedback } from "./layout-feedback";
import { ShadcnNavigation } from "./navigation";
import { ShadcnOverlays } from "./overlays";

export const ShadcnUIGallery = () => {
  const [dir, setDir] = React.useState<"ltr" | "rtl">("ltr");

  return (
    <main
      dir={dir}
      className="min-h-screen bg-muted/30 px-4 py-6 text-foreground sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-lg border bg-background p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">@cs/ui</Badge>
              <Badge variant="secondary">manual QA</Badge>
              <Badge variant="secondary">{dir.toUpperCase()}</Badge>
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">
                Shadcn UI Examples
              </h1>
              <p className="max-w-3xl text-sm text-muted-foreground">
                A full component gallery for visual checks across responsive
                widths, portals, focus states, and RTL layout.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              setDir((current) => (current === "ltr" ? "rtl" : "ltr"))
            }
          >
            Toggle {dir === "ltr" ? "RTL" : "LTR"}
          </Button>
        </header>

        <ShadcnFoundations />
        <Separator />
        <ShadcnForms />
        <Separator />
        <ShadcnOverlays />
        <Separator />
        <ShadcnNavigation />
        <Separator />
        <ShadcnDataDisplay />
        <Separator />
        <ShadcnLayoutFeedback />
      </div>
    </main>
  );
};
