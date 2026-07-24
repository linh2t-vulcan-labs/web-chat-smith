import { useCopyToClipboard } from "@uidotdev/usehooks";
import { useLocale, useTranslations } from "next-intl";
import { QRCodeCanvas } from "qrcode.react";
import { forwardRef } from "react";
import { toast } from "sonner";

import { ButtonV2 } from "@/components/button-v2";
import { Icon } from "@/components/icon";
import { SVGIcon } from "@/components/svg-icon";
import { LIST_LANGUAGE_SUPPORTED } from "@/i18n/constant";
import { getAppQRUrl } from "@/utils/commons/request";
import { compositeStyles } from "@/utils/commons/styles";
import {
  APPLE_SMITHCHAT_APP_URL,
  GOOGLE_PLAY_SMITHCHAT_APP_URL,
} from "@/utils/constants/url";

import type { TQRCodePaywallProps } from "./types";

const renderBreak = () => <br className="block" />;

const QRCodePaywall = forwardRef<HTMLDivElement, TQRCodePaywallProps>(
  (props: TQRCodePaywallProps, ref) => {
    const { onOpenApp, onLinkAction } = props;
    const qrValue = getAppQRUrl();
    const [_, copyToClipboard] = useCopyToClipboard();

    const t = useTranslations("mainLayout.sidebar.qr");

    const openLink = t("openLink");
    const copyLink = t("copyLink");
    const locale = useLocale();
    const btnLinkCls =
      locale === LIST_LANGUAGE_SUPPORTED.ES ? "px-medium-1.5!" : "";
    return (
      <div
        ref={ref}
        className="gap-small-0 space-y-small-1 rounded-pillSoft border-thin p-medium-2.5 lg:gap-large-4 lg:p-small-0 flex flex-col items-center border-neutral-700 lg:flex-row lg:border-none"
      >
        <div className="lg:p-small-0 relative inline-flex items-center p-[18px]">
          <div className="start-small-1 top-small-1 absolute block size-6 border-t-[0.5px] border-s-[0.5px] border-white lg:hidden" />

          {/* Top-right corner bracket */}
          <div className="end-small-1 top-small-1 absolute block size-6 border-t-[0.5px] border-e-[0.5px] border-white lg:hidden" />

          {/* Bottom-left corner bracket */}
          <div className="bottom-small-1 start-small-1 absolute block size-6 border-b-[0.5px] border-s-[0.5px] border-white lg:hidden" />

          {/* Bottom-right corner bracket */}
          <div className="bottom-small-1 end-small-1 absolute block size-6 border-e-[0.5px] border-b-[0.5px] border-white lg:hidden" />
          <QRCodeCanvas
            value={qrValue}
            size={144}
            marginSize={2}
            bgColor="#D9D9D9"
          />
        </div>
        <div className="gap-medium-2 flex flex-col">
          <p className="text-footnoteM-neutral text-text-general-secondary text-center lg:text-left">
            {t.rich("description", {
              break: renderBreak,
            })}
          </p>
          <div className="mt-small-0.25 gap-small-1 hidden items-center lg:flex">
            <button
              type="button"
              className="bg-black-300 p-medium-1.5 hover:bg-surface-action-neutral-default flex w-max items-center justify-center rounded-full"
              onClick={() => {
                onOpenApp?.("appStore");
                window.open(APPLE_SMITHCHAT_APP_URL);
              }}
            >
              <Icon name="appStore" size={24} />
            </button>
            <button
              type="button"
              className="bg-black-300 p-medium-1.5 hover:bg-surface-action-neutral-default flex w-max items-center justify-center rounded-full"
              onClick={() => {
                onOpenApp?.("googlePlay");
                window.open(GOOGLE_PLAY_SMITHCHAT_APP_URL);
              }}
            >
              <Icon name="googleStore" size={24} />
            </button>
          </div>
        </div>
        <div className="mt-medium-3! gap-medium-2 flex w-full items-center lg:hidden">
          <ButtonV2
            color="tertiary"
            size="base"
            className={compositeStyles(
              "gap-small-0.75 text-bodyM-highlight! text-text-action-tertiary-default flex-1",
              btnLinkCls
            )}
            onClick={() => {
              onLinkAction?.("openLink");
              window.open(qrValue);
            }}
          >
            <SVGIcon
              src="/icons/outlined/external-link.svg"
              width={18}
              height={18}
            />
            <span>{openLink}</span>
          </ButtonV2>
          <ButtonV2
            color="tertiary"
            size="base"
            className={compositeStyles(
              "gap-small-0.75 text-bodyM-highlight! text-text-action-tertiary-default flex-1",
              btnLinkCls
            )}
            onClick={() => {
              onLinkAction?.("copyLink");
              copyToClipboard(qrValue);
              toast.success(null, {
                closeButton: false,
                description: t("toast.copy.successfully"),
              });
            }}
          >
            <SVGIcon
              src="/icons/outlined/action-link.svg"
              width={22}
              height={22}
            />
            <span>{copyLink}</span>
          </ButtonV2>
        </div>
      </div>
    );
  }
);

QRCodePaywall.displayName = "QRCodePaywall";
export default QRCodePaywall;
