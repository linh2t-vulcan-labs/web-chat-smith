import { useEffect, useRef, useState } from "react";
import { Navigation } from "swiper/modules";
import type { SwiperClass } from "swiper/react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperCore } from "swiper/types";
import "swiper/css";

import { Button } from "@/components/button";
import { SVGIcon } from "@/components/svg-icon";
import { compositeStyles } from "@/utils/commons/styles";

import type { TAIArtSliderProps } from "./types";

const AIArtSlider = ({
  slides,
  className,
  swiperProps,
  resetKey,
  disabled = false,
}: TAIArtSliderProps) => {
  const swiperRef = useRef<SwiperCore | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const handleSlideChange = (swiper: SwiperClass) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const handleInit = (swiper: SwiperClass) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  useEffect(() => {
    if (swiperRef.current && resetKey !== undefined) {
      // Make sure the swiper is at the first index when the reset key changes (e.g., model changes)
      swiperRef.current.slideTo(0);
    }
  }, [resetKey]);

  return (
    <div className={compositeStyles("group relative w-full", className)}>
      <Swiper
        slidesPerView="auto"
        className="px-small-1! md:px-medium-2! w-full"
        spaceBetween={8}
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper;
        }}
        onInit={handleInit}
        onSlideChange={handleSlideChange}
        modules={[Navigation]}
        {...swiperProps}
      >
        {slides.map((slide, index) => {
          if (!slide) {
            return null;
          }

          return (
            <SwiperSlide key={index} className="size-fit!">
              {slide}
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div
        className={compositeStyles(
          "bg-gradient-navigation-previous pointer-events-none absolute inset-y-0 left-0 z-10 w-[92px] items-center justify-start transition group-hover:opacity-100 md:opacity-0",
          {
            hidden: isBeginning,
          }
        )}
      >
        <Button
          className="bg-surface-general-secondary p-small-0.5 text-icon-general-tertiary pointer-events-auto absolute top-1/2 start-2 z-10 -translate-y-1/2 rounded-full hover:brightness-90"
          color="none"
          size="none"
          disabled={disabled}
          onClick={() => swiperRef.current && swiperRef.current.slidePrev()}
          startIcon={
            <SVGIcon
              src="/icons/outlined/arrow-left.svg"
              width={24}
              height={24}
            />
          }
        />
      </div>
      <div
        className={compositeStyles(
          "bg-gradient-navigation-next pointer-events-none absolute inset-y-0 right-0 z-10 w-[92px] items-center justify-end transition group-hover:opacity-100 md:opacity-0",
          {
            hidden: isEnd,
          }
        )}
      >
        <Button
          className="bg-surface-general-secondary p-small-0.5 text-icon-general-tertiary pointer-events-auto absolute top-1/2 end-2 z-10 -translate-y-1/2 rounded-full opacity-100 transition group-hover:opacity-100 hover:brightness-90"
          color="none"
          size="none"
          disabled={disabled}
          onClick={() => swiperRef.current && swiperRef.current.slideNext()}
          startIcon={
            <SVGIcon
              src="/icons/outlined/arrow-right.svg"
              width={24}
              height={24}
            />
          }
        />
      </div>
    </div>
  );
};

export default AIArtSlider;
