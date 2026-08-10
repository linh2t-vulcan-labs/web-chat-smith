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
      <main className="bg-muted/30 min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-background text-muted-foreground mx-auto max-w-7xl rounded-lg border p-4 text-sm">
          Loading @cs/ui examples...
        </div>
      </main>
    ),
    ssr: false,
  }
);

export const ShadcnGallery = () => <ShadcnUIGallery />;
