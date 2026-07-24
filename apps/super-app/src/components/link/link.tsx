import { forwardRef } from "react";

import { linkVariants } from "./consts";
import type { TLinkProps } from "./types";

const Link = forwardRef<HTMLAnchorElement, TLinkProps>(
  (
    {
      className,
      startIcon,
      endIcon,
      color,
      size,
      rounded,
      disabled,
      fullWidth,
      children,
      ...props
    },
    ref
  ) => (
    <a
      ref={ref}
      className={linkVariants({
        className,
        color,
        disabled,
        fullWidth,
        rounded,
        size,
      })}
      {...props}
    >
      {startIcon}
      {children}
      {endIcon}
    </a>
  )
);

Link.displayName = "Link";

export default Link;
