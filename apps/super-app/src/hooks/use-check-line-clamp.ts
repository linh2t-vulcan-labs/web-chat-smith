import { useEffect, useState } from "react";

function useCheckLineClamp(
  textRef: React.RefObject<HTMLDivElement | null>,
  title: string
) {
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const checkClamping = () => {
      const element = textRef.current;
      if (element) {
        const currentStyle = window.getComputedStyle(element);
        const lineClamp = Math.trunc(
          Number(currentStyle.getPropertyValue("-webkit-line-clamp"))
        );
        const textOverflow = currentStyle.getPropertyValue("text-overflow");
        const whiteSpace = currentStyle.getPropertyValue("white-space");
        const overflow = currentStyle.getPropertyValue("overflow");

        if (lineClamp > 0 && overflow === "hidden") {
          // Check for -webkit-line-clamp approach
          setIsClamped(element.scrollHeight > element.clientHeight);
        } else if (textOverflow === "ellipsis" && overflow === "hidden") {
          // Check for Tailwind's truncate class
          setIsClamped(
            whiteSpace === "nowrap"
              ? element.scrollWidth > element.clientWidth // Single line truncation
              : element.scrollHeight > element.clientHeight // Multi-line truncation
          );
        } else {
          setIsClamped(false);
        }
      }
    };

    checkClamping();

    window.addEventListener("resize", checkClamping); // Handle resizing
    return () => window.removeEventListener("resize", checkClamping);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  return isClamped;
}

export default useCheckLineClamp;
