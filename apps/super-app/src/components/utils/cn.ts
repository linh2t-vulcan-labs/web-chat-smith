import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BASE_STATE_WRAPPER_BASE_STYLES = tv({
  base: cn(
    "relative isolate overflow-hidden",
    "before:content-[''] before:absolute before:inset-v1-0 before:rounded-[inherit] before:pointer-events-none",
    "before:bg-v1-surface-overlay-interactive-hover before:opacity-v1-0 before:transition-opacity before:duration-300 before:ease-out",
    "hover:before:opacity-v1-100 focus-visible:before:opacity-v1-100",
    "active:before:bg-v1-surface-overlay-interactive-selected active:before:opacity-v1-100",
    "disabled:before:bg-v1-surface-overlay-emphasis-muted disabled:before:opacity-v1-100 disabled:cursor-not-allowed",
    "data-disabled:before:bg-v1-surface-overlay-emphasis-muted data-disabled:before:opacity-v1-100 data-disabled:cursor-not-allowed"
  ),
});
