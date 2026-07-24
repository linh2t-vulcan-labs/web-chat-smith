import type { TSizes } from "@/utils/commons/types";

export type TLoadingSize = TSizes;

export interface TLoadingIcon {
  size?: TLoadingSize;
  isSpinning?: boolean;
  text?: string;
}
