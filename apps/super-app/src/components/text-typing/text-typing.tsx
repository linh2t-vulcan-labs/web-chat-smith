"use client";

import { motion } from "motion/react";
import React, { useCallback, useEffect, useState } from "react";

import type { TTextTypingProps } from "./types";

export default function TextTyping({
  stop = false,
  infinite = false,
  text,
  delay = 50, // Speed in milliseconds (lower is faster)
  onDone,
}: TTextTypingProps) {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const resetTyping = useCallback(() => {
    setCurrentText("");
    setCurrentIndex(0);
  }, []);

  useEffect(() => {
    if (!isAnimating) {
      return;
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    } else if (infinite) {
      setTimeout(() => {
        resetTyping();
      }, delay * 3);
    } else {
      // oxlint-disable-next-line react/react-compiler -- marks the typing animation finished once the full text has been typed out; sequential animation-state machine driven by a timer, not a render derivation
      setIsAnimating(false);
      onDone?.();
    }
  }, [currentIndex, isAnimating, infinite, delay, text, resetTyping, onDone]);

  useEffect(() => {
    if (stop) {
      // oxlint-disable-next-line react/react-compiler -- jumps typing animation to completion when the stop prop flips true; external prop-driven state transition, not a render derivation
      setCurrentIndex(text.length);
      setCurrentText(text);
    }
  }, [stop, text]);

  useEffect(
    () => () => {
      onDone?.();
    },
    [onDone]
  );

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {currentText}
    </motion.span>
  );
}
