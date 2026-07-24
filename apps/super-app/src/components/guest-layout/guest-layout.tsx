"use client";

import type { PropsWithChildren } from "react";
import React from "react";

import {
  CaptchaLoadingProcessing,
  GuestModalManager,
} from "@/components/guest-modal-manager";
import { GuestNavbar } from "@/components/guest-navbar";
import { GuestSidebar } from "@/components/guest-sidebar";
import { cn } from "@/components/utils/cn";
import { SuiteNavbar } from "@/features/suite/components/custom/suite-navbar";
import { usePathname } from "@/i18n/navigation";
import { DASHBOARD_ID } from "@/utils/constants/common";
import { GUEST_DESIGN_STUDIO_URL } from "@/utils/constants/url";

const GuestLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const pathname = usePathname();
  const isGuestSuite = pathname.startsWith(GUEST_DESIGN_STUDIO_URL);

  return (
    <>
      <div
        id={DASHBOARD_ID}
        className="relative flex size-full max-h-screen flex-col overflow-hidden transition-all duration-200 ease-in-out md:flex-row"
      >
        <CaptchaLoadingProcessing />
        <GuestSidebar />
        <div
          className={cn(
            "relative z-1 flex size-full min-w-0 flex-1 flex-col",
            // Guest suite: navbar scrolls WITH content (overflow on the wrapper),
            // matching the logged-in suite layout. Other guest pages keep the
            // sticky navbar (overflow on <main> only).
            isGuestSuite && "overflow-y-auto"
          )}
        >
          {isGuestSuite ? <SuiteNavbar isGuest /> : <GuestNavbar />}
          <main
            className={cn("min-h-0 flex-1", !isGuestSuite && "overflow-y-auto")}
          >
            {children}
          </main>
        </div>
      </div>
      <GuestModalManager />
    </>
  );
};

export default GuestLayout;
