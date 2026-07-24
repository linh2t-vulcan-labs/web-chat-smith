import type { Dispatch, SetStateAction } from "react";

import type { TSelectedFile } from "@/core/models/conversation";

export interface TEditImageModalProps {
  open: boolean;
  selectedFile: TSelectedFile;
  onClose?: () => void;
}

export interface TEditImageListProps {
  modalContainerRef: React.RefObject<HTMLDivElement | null>;
  selectedFile: TSelectedFile;
  setSelectedFile: Dispatch<SetStateAction<TSelectedFile>>;
}
