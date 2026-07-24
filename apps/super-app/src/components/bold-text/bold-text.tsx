import React from "react";

import { compositeStyles } from "@/utils/commons/styles";

import type { TBoldTextProps } from "./types";

export default function BoldText({
  text,
  boldText,
  boldTextClassName = "",
}: TBoldTextProps) {
  const regex = new RegExp(boldText, "igu");
  const plainParts = text.replaceAll("- ", "").replaceAll(".", "").split(regex);
  const matchedParts = [...text.matchAll(regex)].map((match) => match[0]);

  const makeBold = (content: string) => (
    <strong
      className={compositeStyles(
        "text-bodyM-highlight text-white",
        boldTextClassName
      )}
    >
      {content}
    </strong>
  );

  const renderTextWithBold = plainParts.map((part, index) => (
    <React.Fragment key={index}>
      {index > 0 && makeBold(matchedParts[index - 1] ?? "")}
      {part}
    </React.Fragment>
  ));

  return renderTextWithBold;
}
