"use client";

import { ReactSVG } from "react-svg";

import { compositeStyles } from "@/utils/commons/styles";

import type { TSVGIconProps } from "./types";

export const SVGIcon: React.FC<TSVGIconProps> = (props) => {
  const {
    width = 24,
    height = 24,
    className = "",
    src,
    loading,
    fallback,
    onClick,
    style,
  } = props;

  return (
    <ReactSVG
      src={src}
      width={width}
      height={height}
      fallback={() => fallback}
      loading={() => loading}
      style={style}
      className={compositeStyles(className)}
      onClick={onClick}
      beforeInjection={(svg) => {
        svg.setAttribute("width", String(width));
        svg.setAttribute("height", String(height));
      }}
    />
  );
};
