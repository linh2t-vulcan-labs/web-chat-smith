"use client";

import { useEffect, useState } from "react";

import { compositeStyles } from "@/utils/commons/styles";

import type { TTextAnimation } from "./types";

import styles from "./styles.module.css";

export default function TextAnimation({
  children,
  className = "",
}: TTextAnimation) {
  const [animationStyles, setAnimationStyles] = useState<string | null>(null);

  useEffect(() => {
    // oxlint-disable-next-line react/react-compiler -- applies the CSS module animation class only after mount to avoid an SSR/client class mismatch, not a render derivation
    setAnimationStyles(styles.animation ?? null);
  }, []);

  return (
    <div className={compositeStyles(styles.text, animationStyles, className)}>
      {children}
    </div>
  );
}
