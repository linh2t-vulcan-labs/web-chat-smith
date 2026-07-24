import { useEffect, useRef, useState } from "react";

import { compositeStyles } from "@/utils/commons/styles";

interface MarqueeTextProps {
  containerRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  className?: string;
}

export default function MarqueeText({
  containerRef,
  children,
  className,
}: MarqueeTextProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const container = containerRef.current;
      const text = textRef.current;
      if (!container || !text) {
        return;
      }
      const diff = text.scrollWidth - container.clientWidth;
      if (diff > 0) {
        setIsOverflowing(true);
        text.style.setProperty("--shift", `-${diff}px`);
        // Calculate animation duration based on text width
        // Base speed: 50px per second, minimum 3s, maximum 15s
        const baseSpeed = 50; // pixels per second
        const duration = Math.max(3, Math.min(15, diff / baseSpeed));
        text.style.setProperty("--duration", `${duration}s`);
      } else {
        setIsOverflowing(false);
        text.style.removeProperty("--shift");
        text.style.removeProperty("--duration");
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [containerRef, children]);

  return (
    <span
      ref={textRef}
      className={compositeStyles(
        "inline-block whitespace-nowrap",
        isOverflowing && "animate-marquee-x",
        className
      )}
    >
      {children}
    </span>
  );
}
