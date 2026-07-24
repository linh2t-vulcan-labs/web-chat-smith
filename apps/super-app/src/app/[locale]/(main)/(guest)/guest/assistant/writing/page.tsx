"use client";

import React from "react";

import { AssistantSettings } from "@/components/assistant-settings";
import AssistantWritingContainer from "@/components/assistant-writing/assistant-writing-container";
import { ContentLayout } from "@/components/content-layout";
import { emptyFn } from "@/utils/commons/helpers";
import {
  defaultAssistantSetting,
  defaultAssistantWriting,
} from "@/utils/constants/assistant";

export default function Page() {
  return (
    <ContentLayout
      rightFeature={
        <AssistantSettings
          isGuestMode
          isShowFeedBack={false}
          settingData={defaultAssistantSetting}
          onChange={emptyFn}
          onReset={emptyFn}
        />
      }
    >
      <div className="px-medium-1.5 sm:px-large-10 mx-auto h-full max-w-[calc(580px+160px)]">
        <AssistantWritingContainer
          isGuestMode={true}
          status="idle"
          prompt={defaultAssistantSetting.prompt}
          selectedWriting={defaultAssistantWriting}
          suggestions={[]}
          onStopGenerating={emptyFn}
          onChangePrompt={emptyFn}
          onClickSuggestion={emptyFn}
          onSubmit={emptyFn}
        />
      </div>
    </ContentLayout>
  );
}
