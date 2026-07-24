import { tv } from "tailwind-variants";

import { buttonVariants } from "../button/consts";

export const linkVariants = tv({
  defaultVariants: {
    color: "text",
    size: "none",
  },
  extend: buttonVariants,
});
