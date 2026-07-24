import { Button } from "@/components/button";
import { SVGIcon } from "@/components/svg-icon";

import type { TButtonGenerateProps } from "./types";

export default function ButtonGenerate(props: TButtonGenerateProps) {
  const { disabled, onClick } = props;
  // GU-1573
  return (
    <Button
      type="button"
      className="transition-none"
      color="neutral"
      rounded="default"
      size="baseIcon"
      disabled={disabled}
      startIcon={
        <SVGIcon
          className="text-text-action-tertiary-default"
          src="/icons/filled/stop-generate.svg"
          width={24}
          height={24}
        />
      }
      onClick={onClick}
    />
  );
}
