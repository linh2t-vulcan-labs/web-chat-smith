"use client";

import { useEffect } from "react";

import { compositeStyles } from "@/utils/commons/styles";

import type { TCharacterCountProps, TCharacterCountStatus } from "./types";

const colorStatus: Record<TCharacterCountStatus, string> = {
  error: "text-text-system-error",
  success: "text-text-system-success",
};

export default function CharacterCount({
  total,
  current,
  onStatus,
}: TCharacterCountProps) {
  const status: TCharacterCountStatus = current <= total ? "success" : "error";
  const color = colorStatus[status];

  useEffect(
    () => () => {
      onStatus?.("success");
    },
    [onStatus]
  );

  useEffect(() => {
    if (status && onStatus) {
      onStatus(status);
    }
  }, [status, onStatus]);

  return (
    <div
      className={compositeStyles(
        "text-footnoteM-highlight flex flex-row gap-1",
        color
      )}
    >
      <span>{current}</span>
      <span>/</span>
      <span>{total}</span>
    </div>
  );
}
