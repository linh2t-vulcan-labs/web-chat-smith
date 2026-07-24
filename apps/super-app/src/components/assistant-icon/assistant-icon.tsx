import React from "react";

import { compositeStyles } from "@/utils/commons/styles";

import { SVGIcon } from "../svg-icon";
import type { TAssistantIconProps } from "./types";

export default function AssistantIcon({
  name,
  size = "medium",
  className,
  iconSize,
}: TAssistantIconProps) {
  const sizeMap: Record<typeof size, [number, number]> = {
    large: [44, 44],
    medium: [32, 32],
    small: [16, 16],
  };

  const iconMap = {
    grammar: "/icons/assistants/grammar.svg",
    lyric: "",
    writing: "/icons/assistants/writing.svg",
  };

  const bgMap = {
    grammar: "bg-gradient-grammar-icon",
    lyric: "",
    writing: "bg-gradient-writing-icon",
  };

  const [width, height] = sizeMap[size];

  return (
    <div
      className={compositeStyles(
        `${bgMap[name]} p-small-0.75 rounded-rounded`,
        className
      )}
    >
      <SVGIcon
        className="text-text-general-primary"
        src={iconMap[name]}
        width={iconSize || width}
        height={iconSize || height}
      />
    </div>
  );
}
