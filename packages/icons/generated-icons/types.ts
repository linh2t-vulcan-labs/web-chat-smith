import type { ComponentPropsWithRef } from "react";

export type IconProps = ComponentPropsWithRef<"svg"> & {
  /** Sets both width and height. Defaults to 24 (the source viewBox size). */
  size?: number | string;
};
