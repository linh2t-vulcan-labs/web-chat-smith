import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { rgbDataURL } from "@/utils/commons/helpers";

interface TPreviewImageProps {
  imageUrl: string;
  width?: number;
  height?: number;
  onEdit?: () => void;
  onDownload?: () => void;
  onClick?: () => void;
}

const PreviewImage = ({
  imageUrl,
  width = 310,
  height = 310,
  onEdit,
  onDownload,
  onClick,
}: TPreviewImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      className="rounded-default p-small-1 relative flex items-end overflow-hidden hover:cursor-pointer"
      style={{ height, width }}
      initial={{
        filter: "blur(5px)",
        opacity: 0.3,
      }}
      animate={
        imageLoaded
          ? {
              filter: "blur(0px)",
              opacity: 1,
            }
          : {}
      }
      transition={{
        delay: 0.5,
        duration: 0.8,
        ease: "easeOut",
      }}
      onClick={onClick}
    >
      <Image
        src={imageUrl}
        placeholder="blur"
        blurDataURL={rgbDataURL(255, 255, 255)}
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        alt="preview image"
        onLoad={() => setImageLoaded(true)}
        fill
        priority
      />
      <div className="z-10 flex w-full justify-between">
        {onEdit && (
          <Button
            className="bg-surface-inputControl-basic-default hover:bg-surface-inputControl-basic-default/70 dark:hover:bg-surface-action-neutral-hover font-normal"
            color="none"
            size="small"
            rounded="rounded"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            startIcon={
              <Icon
                name="editV2"
                className="text-icon-action-secondary-default"
                size={24}
              />
            }
          >
            Edit
          </Button>
        )}
        {onDownload && (
          <Button
            className="bg-surface-inputControl-basic-default hover:bg-surface-action-neutral-hover"
            color="none"
            size="smallIcon"
            rounded="rounded"
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            startIcon={
              <Icon
                name="download"
                className="text-icon-action-secondary-default"
                size={24}
              />
            }
          />
        )}
      </div>
    </motion.div>
  );
};

export default PreviewImage;
