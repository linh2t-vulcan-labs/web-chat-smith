import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useDropzone } from "react-dropzone";

import { SVGIcon } from "@/components/svg-icon";
import { useMediaQuery } from "@/hooks/use-media-query";
import { mbToBytes } from "@/utils/commons/helpers";
import { compositeStyles } from "@/utils/commons/styles";

import { ACCEPT_FILES_COMMON } from "./consts";
import type { TFileUploadAreaProps } from "./types";

import styles from "./styles.module.css";

const renderInstructionSpan = (chunks: ReactNode) => (
  <span className="text-bodyS-link underline">{chunks}</span>
);

function FileUploadArea({
  acceptFiles: acceptFilesProps = ACCEPT_FILES_COMMON,
  maxFiles,
  maxSizeInMB,
  multiple = true,
  fileUploadContent,
  onFilesSelected,
}: TFileUploadAreaProps) {
  const isDesktop = useMediaQuery("md");
  const conversationT = useTranslations("conversationPage");

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    // maxFiles,
    maxSize: mbToBytes(maxSizeInMB),
    accept: acceptFilesProps,
    multiple,
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
      className={compositeStyles(
        "flex cursor-pointer flex-col items-center justify-center rounded-rounded px-medium-3 py-large-6 transition-colors",
        isDragActive && "bg-surface-general-secondary",
        styles.borderDashCustomize
      )}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <div className="mb-medium-2 flex items-center justify-center rounded-rounded bg-surface-general-secondary p-small-1">
        <SVGIcon src="/icons/outlined/upload.svg" width={24} height={24} />
      </div>
      <p className="mb-small-1 text-bodyS-highlight text-text-general-secondary">
        {conversationT.rich("modal.attachFiles.instruction", {
          isDesktop: isDesktop ? "true" : "false",
          span: renderInstructionSpan,
        })}
      </p>
      <div className="flex items-start gap-small-0.5 text-text-general-tertiary">
        <SVGIcon src="/icons/filled/info.svg" width={16} height={16} />
        <span className="text-footnoteM-neutral">
          {renderFileUploadContent()}
        </span>
      </div>
    </div>
  );
}

export default FileUploadArea;
