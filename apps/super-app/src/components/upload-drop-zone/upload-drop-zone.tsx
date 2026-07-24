import { useTranslations } from "next-intl";
import { useDropzone } from "react-dropzone";

import { SVGIcon } from "@/components/svg-icon";
import { mbToBytes } from "@/utils/commons/helpers";
import { compositeStyles } from "@/utils/commons/styles";

import { ACCEPT_FILES_COMMON } from "../file-upload-area/consts";
import type { TUploadDropzoneProps } from "./types";

function UploadDropzone({
  className,
  children,
  acceptFiles: acceptFilesProps = ACCEPT_FILES_COMMON,
  maxFiles,
  maxSizeInMB,
  isDisabled = false,
  multiple = true,
  fileUploadContent,
  onFilesSelected,
}: TUploadDropzoneProps) {
  const conversationT = useTranslations("conversationPage");
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    // maxFiles,
    maxSize: mbToBytes(maxSizeInMB),
    accept: acceptFilesProps,
    multiple,
    disabled: isDisabled,
    onDrop: onFilesSelected,
  });

  const renderFileUploadContent = () => {
    if (fileUploadContent) {
      return fileUploadContent;
    }

    const listAcceptFiles = Object.values(acceptFilesProps)
      .flat()
      .map((ext) => ext.replace(".", ""))
      .join(", ");

    return conversationT("modal.attachFiles.desc", {
      listAcceptFiles,
      maxFiles,
      maxSizeInMB,
    });
  };

  return (
    <div
      {...getRootProps({
        className: compositeStyles(className),
      })}
    >
      <input className="hidden" {...getInputProps} />
      {children}
      {isDragActive && (
        <div className="bg-surface-general-shade-overlay absolute inset-0 flex items-center justify-center">
          <div className="m-medium-3 gap-medium-1.5 rounded-default bg-surface-general-tertiary flex h-[200px] w-[650px] flex-col items-center justify-center">
            <h3 className="text-app-Title1">
              {conversationT("modal.attachFiles.dragdrop")}
            </h3>
            <div className="gap-small-0.5 text-text-general-tertiary flex items-center">
              <SVGIcon src="/icons/filled/info.svg" width={16} height={16} />
              <span className="text-footnoteM-neutral">
                {renderFileUploadContent()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadDropzone;
