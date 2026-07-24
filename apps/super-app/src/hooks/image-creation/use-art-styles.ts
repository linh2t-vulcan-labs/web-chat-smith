import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { DEFAULT_LIST_STYLE_OPTIONS } from "@/components/conversation-input/features/image-creation/consts";
import type { TRemoteConfigListStyleOptions } from "@/components/conversation-input/features/image-creation/types";
import type { TAIArtOptions } from "@/core/ports/chat-features/image-creation";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { useConversationState } from "@/store/conversation/hooks";
import { safeJsonParse } from "@/utils/commons/helpers";

interface UseArtStylesReturn {
  currentAIArtOptions: TAIArtOptions[];
  allAIArtOptions: TAIArtOptions[];
}

/**
 * Custom hook to manage AI art style options based on the selected image model
 * and remote configuration.
 *
 * @returns Art style options for current model and all models
 */
function useArtStyles(): UseArtStylesReturn {
  const selectedImageModel = useConversationState(
    (state) => state.selectedImageModel
  );
  useTranslations("remoteConfig.imageCreation");
  // Remote Config
  const { getValueSyncRemoteConfig } = useRemoteConfigContext();
  const listStyleOptionsRaw = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.LIST_STYLE_OPTIONS
  );
  const listStyleOptions = useMemo(
    () =>
      safeJsonParse<TRemoteConfigListStyleOptions>(listStyleOptionsRaw) ??
      DEFAULT_LIST_STYLE_OPTIONS,
    [listStyleOptionsRaw]
  );

  // Get styles available for the currently selected model
  const currentAIArtOptions = useMemo(() => {
    const styles = listStyleOptions.styles[selectedImageModel.value];
    if (!styles) {
      return [];
    }
    return styles.map((option) => ({
      ...option,
    }));
  }, [listStyleOptions.styles, selectedImageModel.value]);

  // Get all available styles across all models
  const allAIArtOptions = useMemo(
    () =>
      Object.entries(listStyleOptions.styles)
        .filter(([, options]) => options !== undefined)
        .flatMap(([, options]) =>
          options.map((option) => ({
            ...option,
          }))
        ),
    [listStyleOptions.styles]
  );

  return {
    allAIArtOptions,
    currentAIArtOptions,
  };
}

export default useArtStyles;
