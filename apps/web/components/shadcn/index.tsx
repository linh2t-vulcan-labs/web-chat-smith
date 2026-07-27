// export { ShadcnUIGallery, ShadcnOverlays } from "./main";

"use client";

import dynamic from "next/dynamic";

const ShadcnUIGallery = dynamic(
  async () => {
    const mod = await import("./main");
    return mod.ShadcnUIGallery;
  },
  {
    loading: () => (
      <main className="min-h-screen bg-muted/30 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-lg border bg-background p-4 text-sm text-muted-foreground">
          Loading @cs/ui examples...
        </div>
      </main>
    ),
    ssr: false,
  }
);

export const ShadcnGallery = () => <ShadcnUIGallery />;
