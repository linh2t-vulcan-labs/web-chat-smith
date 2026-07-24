import { useEffect } from "react";

import { DEFAULT_LIST_STYLE_OPTIONS } from "@/components/conversation-input/features/image-creation/consts";
import type { TRemoteConfigListStyleOptions } from "@/components/conversation-input/features/image-creation/types";
import useLocalStorage from "@/hooks/use-local-storage";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { clearOldVersionKeys, safeJsonParse } from "@/utils/commons/helpers";
import { HAS_CLICKED_BANANA_CREATE_IMAGE } from "@/utils/commons/keys";

interface UseHasClickedCreateImageReturn {
  hasClickedCreateImage: boolean;
  setHasClickedCreateImage: (value: boolean) => void;
  isReady: boolean;
}

/**
 * Custom hook to handle the "has clicked create image" state with remote config versioning
 *
 * This hook combines remote config version management with localStorage persistence.
 * It automatically cleans up old version keys when the remote config version changes.
 *
 * @returns {UseHasClickedCreateImageReturn} Object containing:
 *  - hasClickedCreateImage: boolean - Whether user has clicked the create image button
 *  - setHasClickedCreateImage: function - Setter to update the state
 *  - isReady: boolean - Whether remote config is ready
 */
export const useHasClickedCreateImage = (): UseHasClickedCreateImageReturn => {
  // Remote Config
  const { getValueSyncRemoteConfig, isReady } = useRemoteConfigContext();
  const listStyleOptionsRaw = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.LIST_STYLE_OPTIONS
  );
  const listStyleOptions =
    safeJsonParse<TRemoteConfigListStyleOptions>(listStyleOptionsRaw) ??
    DEFAULT_LIST_STYLE_OPTIONS;

  // Generate versioned key for localStorage
  const versionedKey = `${HAS_CLICKED_BANANA_CREATE_IMAGE}-${listStyleOptions.config.version}`;

  const [hasClickedCreateImage, setHasClickedCreateImage] =
    useLocalStorage<boolean>(versionedKey, false);

  // Cleanup old version keys when remote config is ready and version changes
  useEffect(() => {
    if (!isReady) {
      return;
    }

    clearOldVersionKeys(
      listStyleOptions.config.version,
      HAS_CLICKED_BANANA_CREATE_IMAGE
    );
  }, [listStyleOptions.config.version, isReady]);

  return {
    hasClickedCreateImage,
    isReady,
    setHasClickedCreateImage,
  };
};
