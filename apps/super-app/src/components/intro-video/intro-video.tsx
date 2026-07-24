import { AspectRatio } from "radix-ui";
import React from "react";

import { compositeStyles } from "@/utils/commons/styles";

interface TIntroVideoProps {
  className?: string;
  src: string;
  ratio?: number;
}

function IntroVideo({ className = "", src, ratio = 16 / 9 }: TIntroVideoProps) {
  return (
    <div
      key={src}
      className={compositeStyles(
        "rounded-soft md:rounded-pill-soft border-border-system-neutral overflow-hidden border-2",
        className
      )}
    >
      <AspectRatio.Root ratio={ratio}>
        <video
          autoPlay
          muted
          loop
          playsInline
          className="size-full object-fill"
        >
          <source src={src} type="video/mp4" />
        </video>
      </AspectRatio.Root>
    </div>
  );
}

export default IntroVideo;
