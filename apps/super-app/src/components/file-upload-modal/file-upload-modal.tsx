import { IconsCloseIcon } from "@cs/icons/icons-close";
import { useTranslations } from "next-intl";

import { ModalV2 } from "@/components/modal";
import type { TSelectedFile } from "@/core/models/conversation";

import { FileDisplay } from "../file-display";
import { FileUploadArea } from "../file-upload-area";
import type { TFileUploadProps } from "./types";

const DEFAULT_FILE_PREVIEWS: TSelectedFile[] = [];

function FileUploadModal({
  isOpen,
  filePreviews = DEFAULT_FILE_PREVIEWS,
  acceptFiles,
  maxFiles,
  maxSizeInMB,
  fileUploadContent,
  onFiles,
  onClick,
  onCancelFiles,
  onClose,
}: TFileUploadProps) {
  const conversationT = useTranslations("conversationPage");

  return (
    <ModalV2
      containerClassName="w-full md:w-[650px]"
      className="size-full"
      open={isOpen}
      onClose={onClose}
      dialogContentProps={{
        // open modal prevent default behavior
        onDragOver: (e) => e.preventDefault(),
        onDrop: (e) => e.preventDefault(),
      }}
    >
      <div className="flex flex-col gap-medium-1.5">
        {/* Upload files */}
        <div className="flex flex-col gap-medium-2">
          <div className="flex items-center justify-between gap-small-1">
            <h3 className="text-title1 text-text-general-secondary">
              {conversationT("modal.attachFiles.title")}
            </h3>
            <IconsCloseIcon
              className="text-icon-general-tertiary hover:cursor-pointer hover:brightness-90"
              width={14}
              height={14}
              onClick={onClose}
            />
          </div>
          <div className="">
            <FileUploadArea
              acceptFiles={acceptFiles}
              onFilesSelected={onFiles}
              maxFiles={maxFiles}
              maxSizeInMB={maxSizeInMB}
              fileUploadContent={fileUploadContent}
            />
          </div>
        </div>

        {/* Recent files */}
        {filePreviews.length > 0 && (
          <div className="flex flex-col gap-medium-1.5">
            <h4 className="text-headingS-Highlight uppercase text-text-general-secondary">
              {conversationT("modal.attachFiles.recentFiles")}
            </h4>
            <div className="grid grid-cols-2 gap-small-1 sm:grid-cols-3">
              {filePreviews.map((item) => (
                <FileDisplay
                  key={item.mockId}
                  displayFile={item}
                  size="large"
                  allowFetching={false}
                  allowPreview={false}
                  onClickFile={onClick}
                  onClickCancel={onCancelFiles}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </ModalV2>
  );
}

export default FileUploadModal;
