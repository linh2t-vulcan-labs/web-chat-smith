"use client";

import AlertIcon from "@/features/suite/assets/icons/alert-icon.svg";
import { cn } from "@/features/suite/utils/classnames";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

import type { SuiteMessageBotErrorProps } from "./types";

export function SuiteMessageBotError({
  title = "Chat Smith was unable to reply to your last message",
  description = "Please try again later or reload page",
  className,
}: SuiteMessageBotErrorProps) {
  return (
    <div
      data-testid={DATA_TEST_ID.suite.custom.messageBotError}
      className={cn("flex flex-col self-stretch", className)}
    >
      <div className="outline-v1-border-structural-subtle bg-v1-surface-hierarchy-raised rounded-v1-2xl flex h-fit flex-col self-stretch outline-4 outline-solid">
        <div className="p-v1-structural-content-relaxed flex h-fit flex-row self-stretch">
          <div className="bg-v1-surface-status-error-subtle p-v1-structural-content-micro rounded-v1-circle flex size-fit flex-row items-center overflow-hidden">
            <AlertIcon
              className="text-v1-icons-hierarchy-primary size-6"
              aria-hidden
            />
          </div>

          <div className="gap-v1-structural-content-tight px-v1-structural-content-tight flex h-fit min-w-0 flex-1 flex-col">
            <p className="text-v1-text-hierarchy-primary typo-v1-heading-h5 h-fit self-stretch capitalize">
              {title}
            </p>
            <p className="text-v1-text-hierarchy-tertiary typo-v1-body-secondary h-fit self-stretch">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
