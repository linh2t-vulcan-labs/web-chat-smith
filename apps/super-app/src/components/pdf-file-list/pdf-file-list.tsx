import Image from "next/image";

import type { TSelectedFile } from "@/core/models/conversation";
import { compositeStyles } from "@/utils/commons/styles";

interface TPdfFileListProps {
  pdfFiles: TSelectedFile[];
  onSelectFile: (file: TSelectedFile) => void;
}

const PdfFileList = ({ pdfFiles, onSelectFile }: TPdfFileListProps) => {
  if (pdfFiles.length === 0) {
    return null;
  }

  return (
    <div className="inline-flex w-full flex-wrap justify-end gap-small-0.75">
      {pdfFiles.map((file) => {
        const splitName = file.fileName.split(".");
        const ext = splitName.length > 1 ? (splitName.pop() ?? "") : "";
        const displayName = splitName.join(".");

        return (
          <div
            key={file.fileId}
            className={compositeStyles(
              "group inline-flex items-center rounded-rounded bg-surface-general-secondary hover:cursor-pointer hover:bg-surface-input-hover",
              "space-x-small-1 p-small-0.75 pr-small-1"
            )}
            onClick={() => onSelectFile(file)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                onSelectFile(file);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div
              className={compositeStyles(
                "relative inline-flex max-w-full items-center justify-center overflow-hidden rounded-soft",
                "size-8 min-h-8 min-w-8"
              )}
            >
              <Image
                src="/icons/outlined/file.svg"
                width={16}
                height={16}
                alt="file"
              />
            </div>
            {displayName && (
              <div className="inline-flex h-full max-w-[176px] flex-1 items-center overflow-hidden text-bodyS-highlight text-text-general-secondary">
                <span className="min-w-0 truncate">{displayName}</span>
                <span className="shrink-0">.{ext}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PdfFileList;
