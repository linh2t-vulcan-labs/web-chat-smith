import { useTranslations } from "next-intl";
import Image from "next/image";

import { ButtonV2 } from "@/components/button-v2";
import { ModalV2 } from "@/components/modal";
import { SVGIcon } from "@/components/svg-icon";
import { useMediaQuery } from "@/hooks/use-media-query";
import useMobileDetect from "@/hooks/use-mobile-detect";
import { useGlobalState } from "@/store/global/hooks";
import {
  APPLE_SMITHCHAT_APP_URL,
  GOOGLE_PLAY_SMITHCHAT_APP_URL,
} from "@/utils/constants/url";

const WebReminderModal = () => {
  const commonT = useTranslations("common");
  const mainLayoutT = useTranslations("mainLayout.webReminder.modal");
  const { isIos, isAndroid } = useMobileDetect();
  const isDesktop = useMediaQuery("md");
  const isOpenWebReminderModal = useGlobalState(
    (state) => state.isOpenWebReminderModal
  );
  const toggleWebReminderModal = useGlobalState(
    (state) => state.toggleWebReminderModal
  );

  const handleDownloadApp = () => {
    if (isIos) {
      globalThis.window.open(APPLE_SMITHCHAT_APP_URL, "_blank");
      return;
    }

    if (isAndroid) {
      globalThis.window.open(GOOGLE_PLAY_SMITHCHAT_APP_URL, "_blank");
    }
  };

  if (isDesktop) {
    return null;
  }

  return (
    <ModalV2
      containerClassName="md:max-w-[488px] bg-neutral-150! w-full"
      className="p-0!"
      open={isOpenWebReminderModal}
      onClose={toggleWebReminderModal}
    >
      <div className="px-medium-3 py-medium-1.5 flex items-center justify-between">
        <div className="text-bodyS-highlight dark:text-text-general-inverse">
          <p className="gap-small-1 text-bodyS-highlight dark:text-text-general-inverse flex items-center">
            <span className="bg-surface-action-inverse-default flex size-[28px] items-center justify-center rounded-[50%]">
              <SVGIcon
                src="/icons/outlined/info.svg"
                className="text-icon-general-inverse"
                width={16}
                height={16}
              />
            </span>
            {mainLayoutT("subTitle")}
          </p>
        </div>
        <SVGIcon
          src="/icons/close.svg"
          className="dark:text-icon-general-inverse hover:brightness-95"
          width={16}
          height={16}
          onClick={toggleWebReminderModal}
        />
      </div>
      <div className="relative aspect-3/2 w-full">
        <Image
          src="/images/remind-desktop.png"
          alt="thumbnail"
          style={{
            objectFit: "cover",
          }}
          fill
        />
      </div>
      <div className="gap-medium-2.5 p-medium-3 flex flex-col">
        <div className="gap-small-1 flex flex-col">
          <h4 className="text-title1 dark:text-text-general-inverse">
            {" "}
            {mainLayoutT("title")}
          </h4>
          <p className="text-footnoteM-neutral dark:text-text-general-inverse">
            {mainLayoutT("desc")}
          </p>
        </div>
        <div className="gap-small-1 flex">
          <ButtonV2
            className="dark:text-text-general-inverse outline-[#3B3B3B] hover:outline-[#3B3B3B]"
            color="outline"
            onClick={handleDownloadApp}
            fullWidth
          >
            {commonT("downloadApp")}
          </ButtonV2>
          <ButtonV2 fullWidth onClick={toggleWebReminderModal}>
            {" "}
            {commonT("cta.gotIt")}
          </ButtonV2>
        </div>
      </div>
    </ModalV2>
  );
};

export default WebReminderModal;
