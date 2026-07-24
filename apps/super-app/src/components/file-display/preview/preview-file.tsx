import dynamic from "next/dynamic";

import { ModalV2 } from "@/components/modal";
import { checkImageFileType } from "@/utils/commons/helpers";

import type { TPreviewProps } from "./types";

const PreviewImage = dynamic(() => import("./preview-image"));
const PreviewPDF = dynamic(() => import("./preview-pdf"));

export default function PreviewFile(props: TPreviewProps) {
  const { displayFile, open, onClose } = props;

  const { mimeType, fileName } = displayFile;

  const renderContent = () => {
    const isImageFile = checkImageFileType(fileName, mimeType);
    if (isImageFile) {
      return (
        <ModalV2
          open={open}
          onClose={onClose}
          className="p-0!"
          containerClassName="bg-transparent max-w-[calc(100vw-32px)]!"
          zIndex={100}
        >
          <PreviewImage displayFile={displayFile} />
        </ModalV2>
      );
    }

    return (
      <ModalV2
        open={open}
        onClose={onClose}
        containerClassName="bg-surface-general-tertiary md:max-w-xl w-full h-[600px]"
        className="gap-medium-2 p-medium-1.5! flex size-full flex-1 flex-col"
        zIndex={100}
      >
        <PreviewPDF displayFile={displayFile} onClose={onClose} />
      </ModalV2>
    );
  };

  return renderContent();
}
