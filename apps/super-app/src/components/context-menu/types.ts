export interface TContextMenuProps {
  open: boolean;
  items: TContextMenuItem[];
  children?: React.ReactNode;
  portalContainer?: Element | null;
  position?: { left: number; bottom: number } | null;
  selectedOption?: TContextMenuItem;
  onSelect?: (item: TContextMenuItem) => void;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

export interface TContextMenuItem {
  id: string;
  icon: string;
  title: React.ReactNode;
  description: React.ReactNode;
  badge?: React.ReactNode;
}

export interface TContextMenuItemProps {
  item: TContextMenuItem;
  isHighlighted?: boolean;
  tabIndex: number;
  onClick?: (item: TContextMenuItem) => void;
}
