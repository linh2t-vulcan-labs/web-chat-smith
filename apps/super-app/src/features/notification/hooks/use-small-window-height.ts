import { useEffect, useState } from "react";

import { debounce } from "@/libs/lodash-es";

export function useSmallWindowHeight(threshold = 780) {
  const [isSmallHeight, setIsSmallHeight] = useState(
    typeof window === "undefined" ? false : window.innerHeight < threshold
  );

  useEffect(() => {
    const handleResize = () => {
      setIsSmallHeight(window.innerHeight < threshold);
    };
    const debouncedHandleResize = debounce(handleResize, 1000);

    handleResize();

    window.addEventListener("resize", debouncedHandleResize);
    return () => window.removeEventListener("resize", debouncedHandleResize);
  }, [threshold]);

  return isSmallHeight;
}
