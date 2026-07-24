export interface TSidebarProps {
  width?: number;
  collapsible?: "offcanvas" | "icon" | "none";
  side?: "left" | "right";
  open: boolean;
  isDesktop?: boolean;
  /** Syncs Radix Sheet (mobile) when dismissing via overlay / Escape; keeps controlled `open` in sync. */
  onSheetOpenChange?: (open: boolean) => void;
}

export interface TSidebarHeaderProps {
  sidebarTitle?: React.ReactNode;
  onClosed?: () => void;
}
