import type { ReactNode } from "react";

import type { ConversationModel } from "@/core/models/conversation";
import type { TThread } from "@/core/models/thread";

export interface TThreadHistory {
  isError?: boolean;
  onRetry?: () => void;
  threads: ConversationModel[];
}

export interface ThreadListProps {
  id: string;
  isError?: boolean;
  threads: TThread[];
  onRetry: () => void;
  onClick: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, title: string) => void;
}

export interface TSidebarMenuItem {
  id: string;
  icon: ReactNode;
  label: string;
  active: boolean;
}

export interface TSidebarBodyProps {
  menuItems?: TSidebarMenuItem[];
  activeMenuId?: string;
  onMenuChange?: (menuItem: TSidebarMenuItem) => void;
  onNewChat?: () => void;
}

export interface SidebarContentProps {
  isExpanded: boolean;
  menuItems?: TSidebarMenuItem[];
  activeMenuId?: string;
  onMenuClick?: (menuId: string) => void;
  onHistoryOpen?: (open: boolean) => void;
  isCreativeSuiteEnabled?: boolean;
}
