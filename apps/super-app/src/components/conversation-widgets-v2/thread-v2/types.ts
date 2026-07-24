export interface TThreadProps {
  id: string;
  title: string;
  content: string;
  platform: string;
  isActive?: boolean;
  isDisabled?: boolean;
  isChatSyncEnabled?: boolean;
  isMigrated?: boolean;
  href: string;
  onClick: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, title: string) => void;
}

export interface TMenuThread {
  id: string;
  isActive?: boolean;
  className?: string;
  contentClassName?: string;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
  onRemove: (id: string) => void;
  onEdit: (e: React.MouseEvent<HTMLElement>) => void;
  onClick?: () => void;
}
