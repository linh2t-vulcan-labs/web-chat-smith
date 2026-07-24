import Image from "next/image";

import type { TCommonPreviewProps } from "./types";

const PreviewImage: React.FC<TCommonPreviewProps> = (props) => {
  const { displayFile } = props;

  const imageUrl = displayFile.file
    ? URL.createObjectURL(displayFile.file)
    : (displayFile.fileUrl ?? "");

  return (
    <div className="relative aspect-square max-h-[428.75px] max-w-[343px] md:max-h-[600px] md:max-w-[480px]">
      <Image
        src={imageUrl}
        alt={displayFile.fileName}
        width={500}
        height={500}
        className="max-h-[428.75px] max-w-[343px] object-contain  md:size-full md:max-h-[600px] md:max-w-[480px]"
      />
    </div>
  );
};

export default PreviewImage;
