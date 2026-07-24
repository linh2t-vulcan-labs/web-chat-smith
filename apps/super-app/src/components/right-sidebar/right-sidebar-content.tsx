"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useShallow } from "zustand/react/shallow";

import { SidebarContent } from "@/components/right-sidebar-panel";
import { useGlobalState } from "@/store/global/hooks";

const MetadataCard = dynamic(
  () => import("@/components/metadata-card/metadata-card")
);
const ToastCitationError = dynamic(
  () => import("@/components/toast-citation-error/toast-citation-error")
);

export default function RightSidebarContent() {
  const contentSetting = useGlobalState(
    useShallow((state) => state.rightSidebarConfig.contentSetting)
  );

  const renderContent = () => {
    if (!contentSetting) {
      return;
    }

    switch (contentSetting.type) {
      case "loading": {
        return (
          <div className="flex size-full flex-col items-center justify-center overflow-hidden">
            <div className="flex size-8 animate-spin items-center justify-center">
              <Image
                src="/images/generating.png"
                alt="loading..."
                width={32}
                height={32}
              />
            </div>
          </div>
        );
      }
      case "error": {
        const { onRetry, retryExhausted } = contentSetting;
        return (
          <ToastCitationError
            onClick={onRetry}
            isShowButton={!retryExhausted}
          />
        );
      }
      case "sources": {
        const { data, isShowPosition } = contentSetting;

        return data.map((item, index) => (
          <MetadataCard
            key={item.url}
            title={item.title}
            url={item.url}
            logoUrl={item.imageUrl}
            description={item.description}
            isShowPosition={isShowPosition}
            position={index + 1}
          />
        ));
      }
      default: {
        return null;
      }
    }
  };

  return <SidebarContent>{renderContent()}</SidebarContent>;
}
