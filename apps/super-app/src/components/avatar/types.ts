import type { TDefaultSizes } from "@/utils/commons/types";

export type TAvatarSize = TDefaultSizes;

export interface TAvatarProps {
  imageURL?: string;
  alt: string;
  children?: string;
  size?: TAvatarSize;
  color?: string;
  className?: string;
  subItem?: React.ReactNode;
}

export type TStringAvatar = (value: string, num?: number) => string;
