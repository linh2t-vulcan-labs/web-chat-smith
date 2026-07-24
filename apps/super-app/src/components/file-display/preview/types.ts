import type { TSelectedFile } from "@/core/models/conversation";

export interface TCommonPreviewProps {
  displayFile: TSelectedFile;
}

export interface TPreviewPDFProps {
  displayFile: TSelectedFile;
  onClose?: () => void;
}

export type TPreviewProps = TCommonPreviewProps & {
  open: boolean;
  onClose?: () => void;
};
