import { useState } from "react";

import type { TSelectedFile } from "@/core/models/conversation";

import PreviewFile from "../file-display/preview/preview-file";
import { ImageFileList } from "../image-file-list";
import { PdfFileList } from "../pdf-file-list";

interface TAttachmentFilesProps {
  imageFiles: TSelectedFile[];
  pdfFiles: TSelectedFile[];
}
const AttachmentFiles = ({ imageFiles, pdfFiles }: TAttachmentFilesProps) => {
  const [selectedFile, setSelectedFile] = useState<TSelectedFile | null>(null);

  return (
    <>
      {selectedFile && (
        <PreviewFile
          open
          displayFile={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
      <ImageFileList imageFiles={imageFiles} onSelectFile={setSelectedFile} />
      <PdfFileList pdfFiles={pdfFiles} onSelectFile={setSelectedFile} />
    </>
  );
};

export default AttachmentFiles;
