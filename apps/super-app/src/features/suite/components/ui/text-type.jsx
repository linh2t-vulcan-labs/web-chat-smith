"use client";

import { animate } from "motion";
import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const DEFAULT_TEXT_COLORS = [];

function useElementVisibility(enabled) {
  const [isVisible, setIsVisible] = useState(!enabled);
  const elementRef = useRef(null);

  useEffect(() => {
    if (!enabled || !elementRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [enabled]);

  return [isVisible, elementRef];
}

function useCursorBlink(cursorRef, showCursor, cursorBlinkDuration) {
  useEffect(() => {
    if (!(showCursor && cursorRef.current)) {
      return;
    }

    const controls = animate(
      cursorRef.current,
      { opacity: [1, 0] },
      {
        duration: cursorBlinkDuration,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      }
    );

    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCursor, cursorBlinkDuration]);
}

function useTypewriter({
  textArray,
  isVisible,
  typingSpeed,
  deletingSpeed,
  pauseDuration,
  initialDelay,
  loop,
  reverseMode,
  variableSpeed,
  onSentenceComplete,
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const getRandomSpeed = useCallback(() => {
    if (!variableSpeed) {
      return typingSpeed;
    }
    const { min, max } = variableSpeed;
    return Math.random() * (max - min) + min;
  }, [variableSpeed, typingSpeed]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    let timeout;
    const currentText = textArray[currentTextIndex];
    const processedText = reverseMode
      ? [...currentText].toReversed().join("")
      : currentText;

    const finishDeleting = () => {
      setIsDeleting(false);
      if (currentTextIndex === textArray.length - 1 && !loop) {
        return;
      }

      onSentenceComplete?.(textArray[currentTextIndex], currentTextIndex);

      setCurrentTextIndex((prev) => (prev + 1) % textArray.length);
      setCurrentCharIndex(0);
      timeout = setTimeout(() => setDisplayedText(""), pauseDuration);
    };

    const executeTypingAnimation = () => {
      if (isDeleting) {
        if (displayedText === "") {
          finishDeleting();
        } else {
          timeout = setTimeout(() => {
            setDisplayedText(displayedText.slice(0, -1));
          }, deletingSpeed);
        }
        return;
      }

      if (currentCharIndex < processedText.length) {
        timeout = setTimeout(
          () => {
            setDisplayedText(displayedText + processedText[currentCharIndex]);
            setCurrentCharIndex(currentCharIndex + 1);
          },
          variableSpeed ? getRandomSpeed() : typingSpeed
        );
        return;
      }

      const isLastTextWithoutLoop =
        !loop && currentTextIndex === textArray.length - 1;
      if (textArray.length >= 1 && !isLastTextWithoutLoop) {
        timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
      }
    };

    if (currentCharIndex === 0 && !isDeleting && displayedText === "") {
      timeout = setTimeout(executeTypingAnimation, initialDelay);
    } else {
      executeTypingAnimation();
    }

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentCharIndex,
    displayedText,
    isDeleting,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    textArray,
    currentTextIndex,
    loop,
    initialDelay,
    isVisible,
    reverseMode,
    variableSpeed,
    getRandomSpeed,
    onSentenceComplete,
  ]);

  return { currentCharIndex, currentTextIndex, displayedText, isDeleting };
}

const DEFAULT_PROPS = {
  as: "div",
  className: "",
  cursorBlinkDuration: 0.5,
  cursorCharacter: "|",
  cursorClassName: "",
  deletingSpeed: 30,
  hideCursorWhileTyping: false,
  initialDelay: 0,
  loop: true,
  pauseDuration: 2000,
  reverseMode: false,
  showCursor: true,
  startOnVisible: false,
  textColors: DEFAULT_TEXT_COLORS,
  typingSpeed: 50,
};

const TextType = (rawProps) => {
  const {
    text,
    as: Component,
    typingSpeed,
    initialDelay,
    pauseDuration,
    deletingSpeed,
    loop,
    className,
    showCursor,
    hideCursorWhileTyping,
    cursorCharacter,
    cursorClassName,
    cursorBlinkDuration,
    textColors,
    variableSpeed,
    onSentenceComplete,
    startOnVisible,
    reverseMode,
    ...props
  } = { ...DEFAULT_PROPS, ...rawProps };

  const cursorRef = useRef(null);
  const [isVisible, containerRef] = useElementVisibility(startOnVisible);

  const textArray = useMemo(
    () => (Array.isArray(text) ? text : [text]),
    // oxlint-disable-next-line react/react-compiler -- compiler flags `text` as possibly mutated later since it may be an externally-owned array/prop; verifying immutability across all callers is out of scope here
    [text]
  );

  const { displayedText, currentCharIndex, isDeleting, currentTextIndex } =
    useTypewriter({
      deletingSpeed,
      initialDelay,
      isVisible,
      loop,
      onSentenceComplete,
      pauseDuration,
      reverseMode,
      textArray,
      typingSpeed,
      variableSpeed,
    });

  useCursorBlink(cursorRef, showCursor, cursorBlinkDuration);

  const currentTextColor =
    textColors.length === 0
      ? "inherit"
      : textColors[currentTextIndex % textColors.length];

  const shouldHideCursor =
    hideCursorWhileTyping &&
    (currentCharIndex < textArray[currentTextIndex].length || isDeleting);

  return createElement(
    Component,
    {
      className: `inline-block whitespace-pre-wrap ${className}`,
      ref: containerRef,
      ...props,
    },
    <span style={{ color: currentTextColor || "inherit" }}>
      {displayedText}
    </span>,
    showCursor && (
      <span
        ref={cursorRef}
        className={`ms-1 inline-block opacity-100 ${cursorClassName} ${shouldHideCursor ? "hidden" : ""}`}
      >
        {cursorCharacter}
      </span>
    )
  );
};

export default TextType;
