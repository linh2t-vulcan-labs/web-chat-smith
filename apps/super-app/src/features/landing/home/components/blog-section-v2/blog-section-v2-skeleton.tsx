import React from "react";

import { Skeleton } from "@/components/skeleton";
import { LANDING_SECTION } from "@/config/landing-page";

export const BlogSectionV2Skeleton = () => (
  <section
    className="py-large-5 md:px-medium-2 md:py-large-10 mx-auto max-w-[1200px]"
    id={LANDING_SECTION.BLOG}
  >
    {/* Header skeleton */}
    <div className="gap-medium-1.5 px-medium-2 flex flex-col items-center">
      <Skeleton className="h-8 w-24 md:h-10 md:w-32" />
      <Skeleton className="h-5 w-64 md:h-6 md:w-96" />
    </div>

    {/* Top blog post skeleton */}
    <div className="gap-large-4 pt-large-4 md:pt-large-6 w-full lg:flex">
      {/* Large card skeleton (left) */}
      <div className="px-medium-2 md:px-small-0 flex-1">
        <div className="gap-medium-2 rounded-default p-medium-2 flex h-full flex-col bg-white/5">
          <Skeleton className="rounded-default aspect-568/321 h-1/2 w-full" />
          <div className="gap-medium-1.5 flex flex-col">
            <Skeleton className="rounded-soft h-6 w-24" />
            <Skeleton className="h-8 w-full md:h-10" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Small cards skeleton (right, desktop only) */}
      <div className="gap-medium-2 hidden flex-1 flex-col md:flex">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="gap-medium-2 rounded-default p-medium-2 flex bg-white/5"
          >
            <Skeleton className="rounded-default aspect-318/180 h-3/4 w-1/2 shrink-0" />
            <div className="gap-medium-1.5 flex flex-1 flex-col">
              <Skeleton className="rounded-soft h-5 w-20" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Bottom blog posts skeleton */}
    <div className="mt-large-4 ps-medium-2 md:pl-0">
      {/* Mobile: horizontal scrolling carousel */}
      <div className="gap-large-4 flex overflow-x-auto md:hidden [&::-webkit-scrollbar]:hidden">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="gap-medium-2 rounded-default p-medium-2 flex min-w-[80%] flex-col bg-white/5"
          >
            <Skeleton className="rounded-default aspect-568/321 h-1/2 w-full" />
            <div className="gap-medium-1.5 flex flex-col">
              <Skeleton className="rounded-soft h-5 w-20" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
      {/* Desktop: grid layout */}
      <div className="gap-large-4 hidden grid-cols-3 md:grid">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="gap-medium-2 rounded-default p-medium-2 flex flex-col bg-white/5"
          >
            <Skeleton className="rounded-default aspect-568/321 h-1/2 w-full" />
            <div className="gap-medium-1.5 flex flex-col">
              <Skeleton className="rounded-soft h-5 w-20" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Button skeleton */}
    <div className="pt-large-4 md:pt-large-6 flex justify-center">
      <Skeleton className="rounded-default h-12 w-[177px]" />
    </div>
  </section>
);
