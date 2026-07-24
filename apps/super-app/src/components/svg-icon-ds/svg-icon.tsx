import { forwardRef } from "react";

import { iconContentList } from "./icon-data";

/** Icon paths are authored in 24×24 user units; display size is independent (see `size`). */
const DEFAULT_VIEW_BOX = "0 0 24 24";

function resolveIcon(entry: (typeof iconContentList)[string] | undefined): {
  content: string;
  viewBox: string;
} | null {
  if (!entry) {
    return null;
  }
  if (typeof entry === "string") {
    return { content: entry, viewBox: DEFAULT_VIEW_BOX };
  }
  return { content: entry.svg, viewBox: entry.viewBox };
}

export type TIconName = keyof typeof iconContentList;

export type SvgIconPropsWithName = Omit<
  React.SVGAttributes<SVGSVGElement>,
  "viewBox" | "width" | "height"
> & {
  name: TIconName;
  path?: never;
  /** Rendered width/height in CSS pixels. Scales the 24×24 viewBox uniformly; default 24. */
  size?: number;
};

/** Props when using path (span with background-image). Mutually exclusive with name. */
export type SvgIconPropsWithPath = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "width" | "height"
> & {
  path: string;
  name?: never;
  size?: number;
};

/** Discriminated union: `name` for SVG from icon-data, or `path` for image URL. */
export type SvgIconProps = SvgIconPropsWithName | SvgIconPropsWithPath;

/**
 * Renders an icon: use name for SVG or path for an image.
 * Named SVGs use a fixed 24×24 viewBox; `size` only sets output dimensions (uniform scale).
 */
export const SvgIcon = forwardRef<
  SVGSVGElement | HTMLSpanElement,
  SvgIconProps
>((props, ref) => {
  const { size = 24 } = props;

  if ("path" in props && props.path !== undefined) {
    const { path, size: _size, style, ...rest } = props;
    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        aria-hidden
        {...rest}
        style={{
          backgroundImage: `url(${path})`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          display: "inline-block",
          height: size,
          width: size,
          ...style,
        }}
      />
    );
  }

  const { name, size: _size, style, ...rest } = props;
  const resolved = resolveIcon(name ? iconContentList[name] : undefined);
  if (!resolved) {
    return null;
  }

  return (
    <svg
      ref={ref as React.Ref<SVGSVGElement>}
      viewBox={resolved.viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...rest}
      width={size}
      height={size}
      style={style}
      // oxlint-disable-next-line react/no-danger -- resolved.content comes from the local, build-time iconContentList (./icon-data), not user input
      dangerouslySetInnerHTML={{ __html: resolved.content }}
    />
  );
});

SvgIcon.displayName = "SvgIcon";
