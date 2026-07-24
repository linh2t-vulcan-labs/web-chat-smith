import { useRef, useState } from "react";
import {
  FreeMode,
  Keyboard,
  Mousewheel,
  Navigation,
  Virtual,
} from "swiper/modules";
import type { SwiperClass } from "swiper/react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperCore } from "swiper/types";
import "swiper/css";

import { Button } from "@/components/button";
import { SVGIcon } from "@/components/svg-icon";
import { useMediaQuery } from "@/hooks/use-media-query";
import { compositeStyles } from "@/utils/commons/styles";

import type { TPreviewImageSliderProps } from "./types";

const PreviewImageSlider = ({
  className,
  slides,
  swiperProps,
}: TPreviewImageSliderProps) => {
  const isDesktop = useMediaQuery("md");
  const swiperRef = useRef<SwiperCore | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const handleSlideChange = (swiper: SwiperClass) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  return (
    <div
      className={compositeStyles(
        "group relative h-[64px] w-full md:h-[318px] md:w-[60px]",
        className
      )}
    >
      <Swiper
        className="h-full shadow-2xl"
        direction={isDesktop ? "vertical" : "horizontal"}
        slidesPerView={5}
        spaceBetween={4}
        mousewheel={{
          forceToAxis: true,
          releaseOnEdges: true,
          sensitivity: 1,
        }}
        keyboard={{
          enabled: true,
        }}
        freeMode={{
          enabled: true,
          sticky: false,
        }}
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper;
        }}
        onInit={handleSlideChange}
        onSlideChange={handleSlideChange}
        onScroll={handleSlideChange}
        modules={[Virtual, Keyboard, Navigation, Mousewheel, FreeMode]}
        centerInsufficientSlides
        {...swiperProps}
      >
        {slides.map((slide, index) => (
          <SwiperSlide
            key={index}
            virtualIndex={index}
            className="md:size-[unset]"
          >
            {slide}
          </SwiperSlide>
        ))}
      </Swiper>
      <div
        className={compositeStyles(
          "bg-gradient-navigation-previous md:bg-gradient-navigation-top absolute inset-y-0 left-0 z-10 w-[50px] items-center justify-start transition md:h-[20px] md:w-full",
          {
            hidden: isBeginning,
          }
        )}
      >
        <Button
          className="text-icon-general-tertiary p-small-0.5 bg-surface-general-secondary absolute start-2 top-1/2 z-10 -translate-y-1/2 rounded-full hover:brightness-90 md:left-1/2 md:top-0 md:-translate-x-1/2"
          color="none"
          size="none"
          onClick={() => swiperRef.current && swiperRef.current.slidePrev()}
          startIcon={
            <SVGIcon
              src="/icons/outlined/arrow-left.svg"
              className="md:rotate-90"
              width={24}
              height={24}
            />
          }
        />
      </div>
      <div
        className={compositeStyles(
          "bg-gradient-navigation-next md:bg-gradient-navigation-bottom absolute inset-y-0 right-0 z-10 w-[50px] items-center justify-end transition md:bottom-0 md:top-[unset] md:h-[20px] md:w-full",
          {
            hidden: isEnd,
          }
        )}
      >
        <Button
          className="text-icon-general-tertiary p-small-0.5 bg-surface-general-secondary absolute end-2 top-1/2 z-10 -translate-y-1/2 rounded-full opacity-100 transition hover:brightness-90 group-hover:opacity-100 md:right-1/2 md:top-full md:translate-x-1/2"
          color="none"
          size="none"
          onClick={() => swiperRef.current && swiperRef.current.slideNext()}
          startIcon={
            <SVGIcon
              src="/icons/outlined/arrow-right.svg"
              className="md:rotate-90"
              width={24}
              height={24}
            />
          }
        />
      </div>
    </div>
  );
};

export default PreviewImageSlider;
