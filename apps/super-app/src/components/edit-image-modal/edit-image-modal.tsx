import { useRef, useState } from "react";
import { toast } from "sonner";

import { AutoSizedImage } from "@/components/auto-sized-image";
import { Button } from "@/components/button";
import { ModalV2 } from "@/components/modal";
import { SVGIcon } from "@/components/svg-icon";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";
import { Logger } from "@/utils/commons/logger";
import { EFileExtension } from "@/utils/constants/file";

import EditImageList from "./edit-image-list";
import type { TEditImageModalProps } from "./types";

const EditImageModal = ({
  open,
  selectedFile: selectedFileProps,
  onClose,
}: TEditImageModalProps) => {
  // Global state
  const user = useGlobalState((state) => state.user);

  // Others
  const { sendTrackingEvent } = useSendTrackingEvent();
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState(selectedFileProps);

  const handleDownloadImage = async () => {
    try {
      const { FileManager } = await import("@/utils/file-manager");
      const fileName = `ChatSmith Image ${new Date().toISOString()}`;
      const imageUrl = selectedFile?.fileUrl || "";
      await FileManager.clientExportFile(
        fileName,
        EFileExtension.JPEG,
        imageUrl
      );
    } catch (error) {
      const logger = new Logger("AIArtMessage");
      logger.sendError(error);
      toast.error("", {
        description: "Failed to export file. Please try again.",
      });
    }
    // Tracking ChatArtDownload
    sendTrackingEvent({
      name: EventKeys.ChatArtDownload,
      payload: {
        vulcan_user_id: user.id,
      },
    });
  };

  return (
    <ModalV2
      open={open}
      onClose={onClose}
      className="flex size-full flex-col p-0! focus:outline-hidden"
      overlayClassName="bg-surface-general-primary!"
      containerClassName="bg-transparent size-full max-w-full! max-h-full"
      zIndex={100}
      ref={modalContainerRef}
    >
      <header className="p-medium-2 flex justify-end">
        <div className="gap-small-1 flex items-center">
          <Button
            className="rounded-default! p-small-1!"
            color="negative"
            size="smallIcon"
            rounded="soft"
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadImage();
            }}
            startIcon={
              <SVGIcon
                src="/icons/outlined/download.svg"
                className="text-icon-action-tertiary-default"
                width={24}
                height={24}
              />
            }
          />
          <Button color="neutral" onClick={onClose}>
            Close
          </Button>
        </div>
      </header>
      <main className="gap-medium-3 px-medium-2 flex min-h-0 flex-1 flex-col justify-between md:flex-row md:justify-center md:overflow-y-hidden">
        <div className="block md:w-[60px]" />
        <div className="flex min-h-0 items-center justify-center md:flex-1">
          <AutoSizedImage
            className="rounded-default"
            fetchPriority="high"
            loading="eager"
            src={selectedFile?.fileUrl || ""}
            alt="preview image"
          />
        </div>
        <div className="flex h-[60px] w-full items-center md:h-full md:w-[60px]">
          <EditImageList
            modalContainerRef={modalContainerRef}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
          />
        </div>
      </main>
      <footer className="p-medium-3" />
    </ModalV2>
  );
};

export default EditImageModal;
