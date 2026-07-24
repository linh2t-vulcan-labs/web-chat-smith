import React from "react";

import { SVGIcon } from "@/components/svg-icon";

export default function LoginAiModel() {
  // GU-1573
  return (
    <div className="mx-auto flex w-full max-w-[416px] items-center justify-between">
      <div className="gap-small-0.5 flex flex-1 flex-col items-center">
        <SVGIcon src="/images/login/openai.svg" width={32} height={32} />
        <span className="text-footnoteS-neutral text-text-general-inverse dark:text-text-general-primary">
          GPT-5
        </span>
      </div>
      <div className="gap-small-0.5 flex flex-1 flex-col items-center">
        <SVGIcon src="/images/login/grok.svg" width={32} height={32} />
        <span className="text-footnoteS-neutral text-text-general-inverse dark:text-text-general-primary">
          Grok 3
        </span>
      </div>
      <div className="gap-small-0.5 flex flex-1 flex-col items-center">
        <SVGIcon src="/images/login/deepseek.svg" width={32} height={32} />
        <span className="text-footnoteS-neutral text-text-general-inverse dark:text-text-general-primary">
          Deepseek R1
        </span>
      </div>
      <div className="gap-small-0.5 flex flex-1 flex-col items-center">
        <SVGIcon src="/images/login/gemini.svg" width={32} height={32} />
        <span className="text-footnoteS-neutral text-text-general-inverse dark:text-text-general-primary">
          Gemini 2.0
        </span>
      </div>
      <div className="gap-small-0.5 flex flex-1 flex-col items-center">
        <SVGIcon src="/images/login/claude.svg" width={32} height={32} />
        <span className="text-footnoteS-neutral text-text-general-inverse dark:text-text-general-primary">
          Claude
        </span>
      </div>
    </div>
  );
}
