import type {
  TAssistantSetting,
  TAssistantSettingKeys,
} from "@/core/models/assistant-writing";

export interface TAssistantSettingsProps {
  isShowFeedBack?: boolean;
  isGuestMode?: boolean;
  settingData: TAssistantSetting;
  onChange: (type: TAssistantSettingKeys, value: string) => void;
  onReset: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
