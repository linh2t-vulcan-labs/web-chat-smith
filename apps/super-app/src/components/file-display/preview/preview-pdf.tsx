"use client";

import { SVGIcon } from "@/components/svg-icon";

import type { TPreviewPDFProps } from "./types";

const PreviewPDF: React.FC<TPreviewPDFProps> = (props) => {
  const { displayFile, onClose } = props;

  const pdfUrl = displayFile.file
    ? URL.createObjectURL(displayFile.file)
    : (displayFile.fileUrl ?? "");

  return (
    <>
      <div className="flex items-center justify-between">
        <h4 className="text-bodyS-highlight">{displayFile.fileName}</h4>
        <SVGIcon
          src="/icons/outlined/closed.svg"
          width={16}
          height={16}
          className="text-text-general-tertiary hover:text-text-general-secondary hover:cursor-pointer"
          onClick={onClose}
        />
      </div>
      <div className="size-full">
        <iframe
          className="rounded-rounded size-full"
          src={pdfUrl}
          title="PDF Preview"
          sandbox=""
        />
      </div>
    </>
  );
};

export default PreviewPDF;
