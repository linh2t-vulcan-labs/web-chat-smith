import { useCopyToClipboard } from "@uidotdev/usehooks";
import { useTranslations } from "next-intl";
import { memo, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/button";
import { SVGIcon } from "@/components/svg-icon";
import { ToolTip } from "@/components/tooltip";

import { COPY_DELAY_TIME } from "./consts";
import type { TCopyButtonProps } from "./types";

const CopyButton = ({
  content,
  delay = COPY_DELAY_TIME,
  isShowToast = true,
  onCopy,
}: TCopyButtonProps) => {
  let timeoutId: NodeJS.Timeout | undefined;
  const commonT = useTranslations("common");
  const conversationT = useTranslations("conversationPage");
  const [isCopied, setIsCopied] = useState(false);
  const [, copyToClipboard] = useCopyToClipboard();

  const handleCopy = () => {
    if (isCopied) {
      return;
    }

    setIsCopied(true);
    copyToClipboard(content);

    if (onCopy) {
      onCopy(content);
    }

    if (isShowToast) {
      toast.success(null, {
        closeButton: true,
        description: commonT("toast.copy.successfully"),
        duration: COPY_DELAY_TIME,
      });
    }

    // oxlint-disable-next-line react/react-compiler -- timeoutId is a plain closure variable used only to track/clear the pending timeout within this render's handler, not persisted state
    timeoutId = setTimeout(() => {
      setIsCopied(false);
    }, delay);
  };

  useEffect(
    () => () => clearTimeout(timeoutId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <ToolTip
      content={conversationT("tooltip.copy")}
      side="bottom"
      align="center"
    >
      <Button
        color="negative"
        size="smallIcon"
        rounded="soft"
        // oxlint-disable-next-line react/react-compiler -- handleCopy closes over the module-local timeoutId variable used only to clear a pending timeout; it is invoked from an event handler, not during render
        onClick={handleCopy}
      >
        {/* GU-1573 */}
        <span className="relative size-5">
          <SVGIcon
            src="/icons/copy-v2.svg"
            className={`text-text-general-tertiary absolute transition-all duration-300 ease-in-out ${isCopied ? "scale-50 opacity-0" : "scale-100 opacity-100"}`}
            width={20}
            height={20}
          />
          <SVGIcon
            src="/icons/checked.svg"
            className={`text-text-general-tertiary absolute transition-all duration-300 ease-in-out ${isCopied ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
            width={20}
            height={20}
          />
        </span>
      </Button>
    </ToolTip>
  );
};

export default memo(CopyButton);
