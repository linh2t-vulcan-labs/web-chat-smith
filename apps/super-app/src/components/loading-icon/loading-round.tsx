import React from "react";

import { compositeStyles } from "@/utils/commons/styles";

import styles from "./styles.module.css";

interface TLoadingRoundProps {
  className?: string;
  color?: string;
  size?: number;
}

export default function LoadingRound({
  className = "",
  color = "#fff",
  size = 8,
}: TLoadingRoundProps) {
  return (
    <span
      style={{
        color,
        fontSize: size,
      }}
      className={compositeStyles(styles.loaderRound, className)}
    />
  );
}
