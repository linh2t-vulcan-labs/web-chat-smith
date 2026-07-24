"use client";

import React from "react";

import { AssistantBanner } from "@/components/assistant-banner";
import { AssistantCard } from "@/components/assistant-card";
import type { TAssistantType } from "@/core/models/assistant";
import { useRouter } from "@/i18n/navigation";

import { ASSISTANT_LIST } from "./consts";

export default function AssistantMain() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-large-4">
      <AssistantBanner
        title="Academic Writing"
        description="Expert Support for Research & Academic Papers – Elevate your writing with structured guidance and professional insights."
        onClick={() => {
          router.push("/assistant/writing");
        }}
      />
      <div className="grid grid-cols-1 gap-large-4 md:grid-cols-1 lg:grid-cols-2">
        {ASSISTANT_LIST.map(({ name, title, description }, index) => (
          <AssistantCard
            key={index}
            name={name as TAssistantType}
            title={title}
            description={description}
            onClick={() => {
              router.push(`/assistant/${name}`);
            }}
          />
        ))}
      </div>
    </div>
  );
}
