import type { Swiper } from "swiper/react";

export interface TAIArtSliderProps {
  className?: string;
  slides: React.ReactNode[];
  swiperProps?: Omit<React.ComponentProps<typeof Swiper>, "children">;
  resetKey?: string | number;
  disabled?: boolean;
}
