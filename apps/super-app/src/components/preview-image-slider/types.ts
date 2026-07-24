import type { Swiper } from "swiper/react";

export interface TPreviewImageSliderProps {
  slides: React.ReactNode[];
  swiperProps?: Omit<React.ComponentProps<typeof Swiper>, "children">;
  className?: string;
}
