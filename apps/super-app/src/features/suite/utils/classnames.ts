import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const isFontSizeToken = (v: string) =>
  /^(?<tokenGroup>body|heading|display|functional|meta)-scale-/u.test(v);
const isRadiusToken = (v: string) => v.startsWith("v1-");

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [isFontSizeToken] }],
      rounded: [{ rounded: [isRadiusToken] }],
      "rounded-b": [{ "rounded-b": [isRadiusToken] }],
      "rounded-bl": [{ "rounded-bl": [isRadiusToken] }],
      "rounded-br": [{ "rounded-br": [isRadiusToken] }],
      "rounded-e": [{ "rounded-e": [isRadiusToken] }],
      "rounded-ee": [{ "rounded-ee": [isRadiusToken] }],
      "rounded-es": [{ "rounded-es": [isRadiusToken] }],
      "rounded-l": [{ "rounded-l": [isRadiusToken] }],
      "rounded-r": [{ "rounded-r": [isRadiusToken] }],
      "rounded-s": [{ "rounded-s": [isRadiusToken] }],
      "rounded-se": [{ "rounded-se": [isRadiusToken] }],
      "rounded-ss": [{ "rounded-ss": [isRadiusToken] }],
      "rounded-t": [{ "rounded-t": [isRadiusToken] }],
      "rounded-tl": [{ "rounded-tl": [isRadiusToken] }],
      "rounded-tr": [{ "rounded-tr": [isRadiusToken] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
