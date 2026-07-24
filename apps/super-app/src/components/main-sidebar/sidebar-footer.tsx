import dynamic from "next/dynamic";
import React from "react";

import { GetProDesktop, QrAppDesktopButton } from "@/components/sidebar-promo";

import { UserDropdown } from "../user-dropdown";

const NotificationCenter = dynamic(
  () =>
    import("@/features/notification/components/notification-center/notification-center")
);

export const SidebarFooter = () => (
  <div className="gap-v1-structural-section-compact max-lg:landscape:gap-v1-structural-component-micro flex flex-col items-center">
    <NotificationCenter />
    <QrAppDesktopButton />
    <GetProDesktop />
    <UserDropdown />
  </div>
);
