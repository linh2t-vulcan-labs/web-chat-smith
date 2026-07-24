import type { EAIValueModel } from "@/core/models/model";
import type { TAIArtOptions } from "@/core/ports/chat-features/image-creation";

export type TRemoteConfigStyles = Partial<
  Record<EAIValueModel, TAIArtOptions[]>
>;

export interface TRemoteConfigListStyleOptions {
  config: {
    version: string;
  };
  styles: TRemoteConfigStyles;
}

export interface TRemoteConfigUIImageConfig {
  enabled: boolean;
  data?: {
    home_background: {
      dark: string;
      light: string;
    };
  };
}
