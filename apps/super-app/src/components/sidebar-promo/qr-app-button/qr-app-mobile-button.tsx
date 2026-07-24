"use client";

import { useToggle } from "@uidotdev/usehooks";

import { Button } from "@/components/button-ds";
import ModalV2 from "@/components/modal/modal-v-2";
import { SvgIcon } from "@/components/svg-icon-ds";
import { cn } from "@/components/utils/cn";

import { useClickQrAppButton } from "./hooks/use-click-qr-app-button";
import QRApp from "./qr-app-content";

export default function QrAppMobileButton() {
  const [isOpenGetAppModal, toggleOpenGetAppModal] = useToggle(false);
  const { handleClickQrAppButton, handleActionQrAppButton } =
    useClickQrAppButton();

  const handleClickButton = () => {
    toggleOpenGetAppModal();
    handleClickQrAppButton();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="s"
        className={cn(
          "text-v1-icons-hierarchy-primary -m-1.5 w-max bg-transparent",
          "box-border rounded-xl border border-transparent",
          { "border-v1-border-structural-default": isOpenGetAppModal }
        )}
        iconOnly
        prefixIcon={<SvgIcon name="phone" size={20} />}
        onClick={handleClickButton}
      />
      <ModalV2
        zIndex={90}
        containerClassName="w-full flex items-center rounded-v1-xl! bg-v1-surface-hierarchy-raised! p-v1-structural-content-relaxed border-v1-border-structural-subtle border-4"
        className="gap-v1-structural-content-relaxed flex w-full flex-col items-center p-0!"
        open={isOpenGetAppModal}
        onClose={toggleOpenGetAppModal}
      >
        <div className="p-v1-structural-content-tight absolute -top-1 -right-1">
          <Button
            variant="ghost"
            size="l"
            className="text-v1-icons-hierarchy-primary w-max bg-transparent"
            iconOnly
            prefixIcon={<SvgIcon name="x" size={24} />}
            onClick={() => toggleOpenGetAppModal()}
          />
        </div>
        <QRApp onLinkAction={handleActionQrAppButton} />
      </ModalV2>
    </>
  );
}
