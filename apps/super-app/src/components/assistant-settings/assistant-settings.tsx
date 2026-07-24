import { useTranslations } from "next-intl";

import { useTranslatedOptions } from "@/components/assistant-writing/use-translated-options";
import { Button } from "@/components/button";
import { ButtonGroup } from "@/components/button-group";
import { Divider } from "@/components/divider";
import { Input } from "@/components/input";
import { defaultAssistantSetting } from "@/utils/constants/assistant";

import { lengthOptions, techniqueOptions, toneOptions } from "./consts";
import type { TAssistantSettingsProps } from "./types";

const renderFeedbackLabelSpan = (chunks: React.ReactNode) => (
  <span className="font-normal">{chunks}</span>
);

export default function AssistantSettings({
  isShowFeedBack = false,
  isGuestMode = false,
  settingData,
  onChange,
  onReset,
}: TAssistantSettingsProps) {
  const isEqualSetting =
    JSON.stringify(defaultAssistantSetting) === JSON.stringify(settingData);

  const t = useTranslations("assistantWriting.settings");
  const title = t("title");
  const resetCta = t("resetCta");
  const lengthTitle = t("length.title");
  const toneTitle = t("tone.title");
  const techniqueTitle = t("technique.title");
  const feedbackLabel = t.rich("feedback.label", {
    span: renderFeedbackLabelSpan,
  });
  const feedbackPlaceholder = t("feedback.placeholder");

  // Translate options
  const translatedLengthOptions = useTranslatedOptions(
    lengthOptions,
    "assistantWriting.settings"
  );
  const translatedToneOptions = useTranslatedOptions(
    toneOptions,
    "assistantWriting.settings"
  );
  const translatedTechniqueOptions = useTranslatedOptions(
    techniqueOptions,
    "assistantWriting.settings"
  );

  return (
    <div className="flex h-full flex-col gap-medium-2 p-large-4">
      <div className="flex flex-col gap-medium-2">
        <div className="flex items-center justify-between">
          <h4 className="text-bodyL-highlight text-text-general-tertiary">
            {title}
          </h4>
          <Button
            color="neutral"
            size="small"
            onClick={onReset}
            disabled={isEqualSetting || isGuestMode}
          >
            {resetCta}
          </Button>
        </div>
        <Divider direction="horizontal" />
      </div>

      {/* LENGTH SETTING */}
      <div className="flex flex-col gap-medium-2">
        <div className="flex flex-col gap-medium-1.5">
          <p className="text-bodyS-highlight text-text-general-tertiary">
            {lengthTitle}
          </p>
          <ButtonGroup
            value={settingData.length}
            options={translatedLengthOptions}
            onChange={(value) => {
              onChange("length", value);
            }}
          />
        </div>
        <Divider direction="horizontal" />
      </div>

      {/* TONE SETTING */}
      <div className="flex flex-col gap-medium-2">
        <div className="flex flex-col gap-medium-1.5">
          <p className="text-bodyS-highlight text-text-general-tertiary">
            {toneTitle}
          </p>
          <ButtonGroup
            value={settingData.tone}
            options={translatedToneOptions}
            onChange={(value) => {
              onChange("tone", value);
            }}
          />
        </div>
        <Divider direction="horizontal" />
      </div>

      {/* TECHNIQUE SETTING */}
      <div className="flex flex-col gap-medium-2">
        <div className="flex flex-col gap-medium-1.5">
          <p className="text-bodyS-highlight text-text-general-tertiary">
            {techniqueTitle}
          </p>
          <ButtonGroup
            value={settingData.technique}
            options={translatedTechniqueOptions}
            onChange={(value) => {
              onChange("technique", value);
            }}
          />
        </div>
        <Divider direction="horizontal" />
      </div>

      {/* FEEDBACK */}
      {isShowFeedBack && (
        <div className="flex flex-col gap-medium-2 pb-8">
          <div className="flex flex-col gap-medium-1.5">
            <p className="text-bodyM-neutral font-bold text-white">
              {feedbackLabel}
            </p>
            <Input
              typeInput="multiple"
              placeholder={feedbackPlaceholder}
              rows={4}
              value={settingData.feedback}
              onChange={(e) => {
                onChange("feedback", e.target.value);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
