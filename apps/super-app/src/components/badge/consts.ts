import { tv } from "tailwind-variants";

export const badgeVariant = tv({
  base: "px-small-0.5 py-small-0.25 inline-flex items-center",
  defaultVariants: {
    color: "blue",
    rounded: "soft",
  },
  variants: {
    color: {
      blue: "bg-[#145F99] text-[#D3ECFF]",
      blueV2: "px-small-0.75 py-small-0.5 bg-[#0084FF] text-[#F7F7F7]",
      darkGreen: "bg-[#175559] text-[#D7F6F9]",
      green:
        "dark:text-text-general-inverse text-text-general-secondary bg-[#A4F6D7]",
      lightBlue: "bg-[#4EB1FF] text-[#0A2F4D]",
      purple: "bg-[#9D2EA7] text-[#FEEDFF]",
      red: "px-small-0.75 py-small-0.5 bg-[#F03D3D] text-[#F7F7F7]",
      white: "bg-surface-action-inverse-default text-text-general-inverse",
      yellow: "bg-[#664800] text-[#FFD266]",
      yellowV2: "bg-[#FFCB45] text-[#1E1E1E]",
    },
    rounded: {
      half: "rounded-half",
      soft: "rounded-soft",
      subtle: "rounded-subtle",
    },
  },
});

export const dotBadgeVariant = tv({
  base: "rounded-circle bg-border-inputControls-neutral-default  inline-flex items-center justify-center not-italic",
  defaultVariants: {
    size: "small",
  },
  variants: {
    size: {
      medium: "px-small-0.75 py-small-0.25 text-footnoteM-neutral",
      small: "text-footnoteS-neutral min-h-[18px] min-w-[18px] px-[4.5px]",
    },
  },
});
