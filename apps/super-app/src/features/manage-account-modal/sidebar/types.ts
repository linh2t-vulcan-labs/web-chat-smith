import type { EManageAccountModalTab } from "../types";

export interface TManageAccountSidebarItemProps {
  title: string;
  isDesktop?: boolean;
  icon?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

export interface TManageAccountSidebarProps {
  activeTab: EManageAccountModalTab;
  isDesktop?: boolean;
  onTabChange: (tab: EManageAccountModalTab) => void;
}
