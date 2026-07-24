export interface TSidebarProps {
  width?: number;
  collapsible?: "offcanvas" | "icon" | "none";
  side?: "left" | "right";
  open: boolean;
  isDesktop?: boolean;
}

export interface TSidebarHeaderProps {
  sidebarTitle?: React.ReactNode;
  onClosed?: () => void;
}
