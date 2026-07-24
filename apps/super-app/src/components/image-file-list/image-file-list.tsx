import Image from "next/image";
import React from "react";

import type { TSelectedFile } from "@/core/models/conversation";

interface TImageFileListProps {
  imageFiles: TSelectedFile[];
  onSelectFile: (file: TSelectedFile) => void;
}

const ImageFileList = ({ imageFiles, onSelectFile }: TImageFileListProps) => {
  if (imageFiles.length === 0) {
    return null;
  }

  return (
    <div className="gap-small-0.75 inline-flex w-full flex-wrap justify-end">
      {imageFiles.map((file) => (
        <button
          key={file.fileId}
          type="button"
          className="rounded-default relative size-[80px] overflow-hidden transition duration-300 hover:cursor-pointer hover:brightness-40"
          onClick={() => onSelectFile(file)}
        >
          <Image
            style={{ objectFit: "cover" }}
            src={file.fileUrl ?? ""}
            alt={file.fileName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </button>
      ))}
    </div>
  );
};

export default ImageFileList;
