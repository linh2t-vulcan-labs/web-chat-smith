export interface TQRCodePaywallProps {
  className?: string;
  onOpenApp?: (storeType: "appStore" | "googlePlay") => void;
  onLinkAction?: (action: "openLink" | "copyLink") => void;
}
