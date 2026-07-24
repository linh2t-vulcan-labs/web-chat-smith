import { tv } from "tailwind-variants";

export const statusBadge = tv({
  base: "px-small-0.75 py-small-0.5 rounded-soft inline-flex items-center gap-2 text-xs font-semibold",
  defaultVariants: {
    status: "available",
  },
  variants: {
    status: {
      available: "bg-[#E2FCF0] text-[#0A9C55]",
      away: "bg-yellow-100 text-yellow-800",
      busy: "text-themeli bg-red-100",
      offline: "bg-gray-100 text-gray-800",
    },
  },
});

export const statusDot = tv({
  base: "size-2 rounded-full",
  defaultVariants: {
    status: "available",
  },
  variants: {
    status: {
      available: "bg-[#0A9C55]",
      away: "bg-yellow-500",
      busy: "bg-red-500",
      offline: "bg-gray-500",
    },
  },
});
