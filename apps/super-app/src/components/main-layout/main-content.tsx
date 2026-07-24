"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import type { PropsWithChildren } from "react";
import React from "react";

import MainNavbar from "@/components/main-navbar/main-navbar";
import { SuiteNavbar } from "@/features/suite/components/custom/suite-navbar";
import { DESIGN_STUDIO_URL } from "@/utils/constants/url";

// The (main)/(auth) layout owns the @modal interceptor (manage-account), so the suite tool surface
// lives under the same group to share that modal. Both surfaces use MainLayout; only the navbar +
// scroll wrapper differ. We branch on the active child segment (NOT usePathname) so the chrome stays
// stable when the manage-account modal intercepts — the modal renders in the @modal slot, leaving
// the children segment unchanged. The segment is the route root without its leading slash.
export function MainContent({ children }: PropsWithChildren) {
  const isSuite = `/${useSelectedLayoutSegment()}` === DESIGN_STUDIO_URL;

  if (isSuite) {
    return (
      <div className="relative z-1 flex size-full min-w-0 flex-1 flex-col overflow-y-auto">
        <SuiteNavbar />
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="relative z-1 flex size-full min-w-0 flex-1 flex-col">
      <MainNavbar />
      <main className="flex-1 overflow-y-scroll">{children}</main>
    </div>
  );
}

export default MainContent;
