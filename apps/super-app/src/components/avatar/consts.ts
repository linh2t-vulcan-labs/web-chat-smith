import type {
  TNumberStyle,
  TSizePropStyles,
  TTailwindStyle,
} from "@/utils/commons/types";

import type { TAvatarSize } from "./types";

const avatarNumSizeStyles: TSizePropStyles<TNumberStyle, TAvatarSize> = new Map(
  [
    ["small", 36],
    ["medium", 48],
    ["large", 60],
  ]
);

const avatarFontSizeStyles: TSizePropStyles<TTailwindStyle, TAvatarSize> =
  new Map([
    ["small", "text-[10px]"],
    ["base", "text-[10px]"],
    ["medium", "text-base"],
    ["large", "text-base"],
  ]);

const avatarTailwindSizeStyles: TSizePropStyles<TTailwindStyle, TAvatarSize> =
  new Map([
    ["small", "h-[36px] w-[36px] min-w-[36px]"],
    ["medium", "h-[48px] w-[48px] min-w-[48px]"],
    ["large", "h-[60px] w-[60px] min-w-[60px]"],
  ]);

export const avatarBackgroundColor = [
  "bg-[#2D2BB1]",
  "bg-[#5900B3]",
  "bg-[#09492F]",
  "bg-[#3B4601]",
  "bg-[#7A0060]",
  "bg-[#004761]",
  "bg-[#880A01]",
  "bg-[#693402]",
];

export const avatarStyles = (size: TAvatarSize) => {
  const _numSize = avatarNumSizeStyles.get(size) || 50;
  const _tailwindSize =
    avatarTailwindSizeStyles.get(size) || "h-[50px] w-[50px]";
  const _fontSize = avatarFontSizeStyles.get(size) || "text-base";

  return {
    fontSize: _fontSize,
    numSize: _numSize,
    tailwindSize: _tailwindSize,
  };
};
