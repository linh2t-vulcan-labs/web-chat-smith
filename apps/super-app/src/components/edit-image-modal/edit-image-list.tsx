import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Swiper as SwiperType } from "swiper";

import { EditImageCard } from "@/components/edit-image-card";
import type { TImage } from "@/core/models/conversation";
import { useGetImages } from "@/hooks/conversations/use-get-images";
import { useConversationState } from "@/store/conversation/hooks";
import { generateRandomUUIDV4 } from "@/utils/commons/helpers";
import { KEYBOARD_KEYS } from "@/utils/constants/common";

import { PreviewImageSlider } from "../preview-image-slider";
import type { TEditImageListProps } from "./types";

const IMAGE_LIMIT = 100;
const IMAGE_VIRTUAL_LIMIT = 50;

const EditImageList = ({
  modalContainerRef,
  selectedFile,
  setSelectedFile,
}: TEditImageListProps) => {
  const selectedId = useConversationState((state) => state.selectedId);
  const { data = [], isLoading } = useGetImages({
    id: selectedId,
    limit: IMAGE_LIMIT,
  });
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const imagesData = [...data].toReversed();

  const handleEditImageSelect = (image: TImage) => {
    setSelectedFile({
      fileId: image.id,
      fileName: "",
      fileSize: 0,
      fileUrl: image.url,
      mimeType: "image/png",
      mockId: generateRandomUUIDV4(),
    });
  };

  const getCurrentIndex = useCallback(
    () =>
      imagesData.findIndex((message) => message.id === selectedFile?.fileId),
    [imagesData, selectedFile]
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!swiper) {
        return;
      }
      // Don't put event.preventDefault here, as it will prevent default behavior for all keys

      switch (event.key) {
        case KEYBOARD_KEYS.ArrowUp: {
          event.preventDefault();
          event.stopPropagation(); // Prevent this keydown event from bubbling up, so Swiper's built-in keyboard handler won't run twice
          swiper.slidePrev();
          break;
        }
        case KEYBOARD_KEYS.ArrowDown: {
          event.preventDefault();
          event.stopPropagation(); // Prevent this keydown event from bubbling up, so Swiper's built-in keyboard handler won't run twice
          swiper.slideNext();
          break;
        }
        default: {
          break;
        }
      }
    };

    const container = modalContainerRef.current;
    if (container) {
      container.addEventListener("keydown", handleKeyDown);
      container.setAttribute("tabindex", "0");
    }

    return () => {
      if (container) {
        container.removeEventListener("keydown", handleKeyDown);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile, swiper]);

  // Set the initial file selected when the modal opens
  useEffect(() => {
    if (swiper) {
      const currentIndex = getCurrentIndex();
      swiper.slideTo(Math.max(0, currentIndex), 0);
    }
  }, [swiper, getCurrentIndex]);

  if (isLoading) {
    return (
      <div className="flex w-full justify-center">
        <div className="animate-spin">
          <Image
            src="/images/generating.png"
            alt="loading..."
            width={16}
            height={16}
          />
        </div>
      </div>
    );
  }

  return (
    <PreviewImageSlider
      swiperProps={{
        onSwiper: setSwiper,
        virtual: imagesData.length > IMAGE_VIRTUAL_LIMIT,
      }}
      slides={imagesData.map((image) => (
        <EditImageCard
          key={image.id}
          className="size-full"
          isActive={selectedFile.fileId === image.id}
          imageUrl={image.url}
          onClick={() => handleEditImageSelect(image)}
        />
      ))}
    />
  );
};

export default EditImageList;
