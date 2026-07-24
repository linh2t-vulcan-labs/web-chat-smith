export interface TImageLimitAlertProps {
  className?: string;
  title: string;
  description: React.ReactNode | string;
  imageUrl: string | null;
  children: React.ReactNode;
  open?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}
