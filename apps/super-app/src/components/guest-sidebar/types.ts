import type { TSidebarMenuItem } from "../main-sidebar/types";

export interface GuestSidebarContentProps {
  isExpanded: boolean;
  menuItems?: TSidebarMenuItem[];
  onMenuClick?: (menuId: string) => void;
}
