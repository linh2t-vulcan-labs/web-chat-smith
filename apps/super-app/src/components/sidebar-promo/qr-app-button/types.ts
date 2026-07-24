import type { TLinkAction } from "@/libs/tracking-event";

export interface TQrAppContentProps {
  onLinkAction?: (action: TLinkAction) => void;
}
