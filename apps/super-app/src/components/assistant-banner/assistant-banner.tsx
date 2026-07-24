import Image from "next/image";
import React from "react";

import { Button } from "@/components/button";

interface TAssistantBannerProps {
  title: string;
  description: string;
  onClick: () => void;
}

export default function AssistantBanner({
  title,
  description,
  onClick,
}: TAssistantBannerProps) {
  return (
    <div className="px-large-8 py-large-6 rounded-pill-soft bg-gradient-writing-banner relative">
      <div className="relative z-10 max-w-[400px]">
        <h3 className="text-web-h4 mb-medium-2 text-white">{title}</h3>
        <p className="text-bodyM-neutral mb-large-4 text-white">
          {description}
        </p>
        <Button color="tertiary" size="base" onClick={onClick}>
          Try it
        </Button>
      </div>
      <div className="end-large-8 absolute top-0 hidden h-full w-[384px] lg:block">
        <Image
          src="/images/assistants/writing-banner.png"
          quality={100}
          fill
          style={{ objectFit: "fill" }}
          alt="academic writing"
        />
      </div>
    </div>
  );
}
