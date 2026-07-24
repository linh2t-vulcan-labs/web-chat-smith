declare module "*.svg" {
  import type { FC, SVGProps } from "react";
  const content: FC<SVGProps<SVGElement>>;
  export default content;
}

declare module "*.svg?url" {
  const content: string;
  export default content;
}

/** Explicit SVGR import (same component as `*.svg`; use when you want `?react` in the path). */
declare module "*.svg?react" {
  import type { FC, SVGProps } from "react";
  const content: FC<SVGProps<SVGElement>>;
  export default content;
}
declare module "*.css";

// Swiper ships CSS-only subpath exports with no type declarations.
declare module "swiper/css";
declare module "swiper/css/*";
