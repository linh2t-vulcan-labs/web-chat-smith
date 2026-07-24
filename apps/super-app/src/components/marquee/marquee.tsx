import { compositeStyles } from "@/utils/commons/styles";

import type { TMarqueeProps } from "./type";

function Marquee({
  children,
  className,
  speed = "normal",
  pauseOnHover = false,
}: TMarqueeProps) {
  const speedClasses = {
    normal: "animate-marquee",
    slow: "animate-marquee-slow",
  };

  return (
    <div
      className={compositeStyles(
        "overflow-hidden whitespace-nowrap",
        className
      )}
    >
      <div
        className={compositeStyles(
          "inline-block",
          speedClasses[speed],
          pauseOnHover && "hover:paused"
        )}
      >
        {children}
        {/* Duplicate content for seamless loop */}
        <span className="ms-4">{children}</span>
      </div>
    </div>
  );
}

export default Marquee;
