"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { LoadingProcessing } from "@/components/loading-icon";
import { Modal } from "@/components/modal";
import { Sheet } from "@/components/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useZIndex } from "@/libs/z-index-manager";

import type { TManageAccountModalProps } from "./types";
import { EManageAccountModalTab } from "./types";

const ManageAccountSheetContent = dynamic(
  () => import("./manage-account-sheet-content"),
  {
    loading: () => <LoadingProcessing isSpinning />,
  }
);
const ManageAccountPanel = dynamic(() => import("./manage-account-panel"), {
  loading: () => <LoadingProcessing isSpinning />,
});

function ManageAccountModal(props: TManageAccountModalProps) {
  const {
    open,
    onClose,
    isShowManageSubscription: _isShowManageSubscription,
    defaultTab = EManageAccountModalTab.GENERAL,
    activeTab: controlledActiveTab,
    onChangeTab,
  } = props;

  const isLargeScreen = useMediaQuery("md");

  // Use z-index manager for proper stacking order
  const zIndex = useZIndex({
    enabled: open,
    priority: "normal",
    type: "modal",
  });

  const [uncontrolledTab, setUncontrolledTab] =
    useState<EManageAccountModalTab>(defaultTab);

  useEffect(() => {
    // oxlint-disable-next-line react/react-compiler -- syncs uncontrolled tab state to the controlled prop when it changes; standard controlled/uncontrolled sync pattern
    setUncontrolledTab(controlledActiveTab ?? defaultTab);
  }, [controlledActiveTab, defaultTab]);

  const activeTab = controlledActiveTab ?? uncontrolledTab;

  const handleTabChange = (tab: EManageAccountModalTab) => {
    if (!controlledActiveTab) {
      setUncontrolledTab(tab);
    }

    onChangeTab?.(tab);
  };

  if (isLargeScreen) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        isPreventClickOutside
        zIndex={zIndex}
        containerClassName="rounded-v1-xl thickness-thin! bg-v1-surface-hierarchy-raised! border-v1-border-structural-default md:w-273.25 md:max-w-full md:h-154"
        className="flex flex-col p-0!"
      >
        <ManageAccountPanel
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onClose={onClose}
        />
      </Modal>
    );
  }

  return (
    <Sheet open={open}>
      <ManageAccountSheetContent
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onClose={onClose}
      />
    </Sheet>
  );
}

export default ManageAccountModal;
