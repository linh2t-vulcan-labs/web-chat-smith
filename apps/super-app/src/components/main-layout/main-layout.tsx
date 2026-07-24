import type { PropsWithChildren } from "react";
import React from "react";

import { MainModalManager } from "@/components/main-modal-manager";
import { MainSidebar } from "@/components/main-sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import { DASHBOARD_ID } from "@/utils/constants/common";

import { MainContent } from "./main-content";

const MainLayout: React.FC<PropsWithChildren> = ({ children }) => (
  <div
    id={DASHBOARD_ID}
    className="relative flex size-full max-h-screen flex-col overflow-hidden transition-all duration-200 ease-in-out md:flex-row"
  >
    <MainSidebar />
    <MainContent>{children}</MainContent>
    <RightSidebar />
    <MainModalManager />
  </div>
);

export default MainLayout;
