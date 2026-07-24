"use client";

import { useTranslations } from "next-intl";
import { memo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/button";
import { LoadingProcessing } from "@/components/loading-icon";
import { SVGIcon } from "@/components/svg-icon";
import { ToolTip } from "@/components/tooltip";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";
import { getFirstMarkdownTitle } from "@/utils/commons/helpers";
import { Logger } from "@/utils/commons/logger";
import { EFileExtension } from "@/utils/constants/file";
import { FileManager } from "@/utils/file-manager";

import type { TDownloadButtonProps } from "./types";

function DownloadButton(props: TDownloadButtonProps) {
  const { content } = props;
  const conversationT = useTranslations("conversationPage");
  const [isLoading, setIsLoading] = useState(false);
  // For Tracking
  const user = useGlobalState((state) => state.user);
  const { sendTrackingEvent } = useSendTrackingEvent();

  const label = conversationT("tooltip.export");

  const handleDownloadButton = async () => {
    setIsLoading(true);
    try {
      // Tracking ChatDeepResearchExport
      sendTrackingEvent({
        name: EventKeys.ChatDeepResearchExport,
        payload: {
          vulcan_user_id: user.id,
        },
      });

      const getTitle = getFirstMarkdownTitle(content) || "export";
      await FileManager.clientExportFile(
        getTitle,
        EFileExtension.DOCX,
        content
      );
    } catch (error) {
      const logger = new Logger("DownloadButton");
      logger.sendError(error);
      toast.error("", {
        description: "Failed to export file. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <LoadingProcessing isSpinning />}
      <ToolTip content={label} side="bottom" align="center">
        <Button
          color="negative"
          size="smallIcon"
          rounded="soft"
          onClick={handleDownloadButton}
        >
          <span className="relative size-5">
            <SVGIcon
              src="/icons/outlined/export.svg"
              className="text-text-general-tertiary"
              width={20}
              height={20}
            />
          </span>
        </Button>
      </ToolTip>
    </>
  );
}

export default memo(DownloadButton);
