import type { TPopupItemConfig } from "../store/types";

type TRemoteConfigOverride = Pick<
  TPopupItemConfig,
  "id" | "priority" | "delay" | "dependencies"
>;

/**
 * Applies remote config settings to default popup queue configs
 * @param defaultConfigs - The default popup queue configurations
 * @param remoteConfigSettings - The remote config settings to apply (array of partial configs with id, priority, delay, dependencies)
 * @returns Merged and sorted popup configurations
 */
export const applyRemoteConfigToPopupQueue = (
  defaultConfigs: TPopupItemConfig[],
  remoteConfigSettings: TRemoteConfigOverride[]
): TPopupItemConfig[] => {
  // Create a map for quick lookup of remote config settings by id
  const remoteConfigMap = new Map<string, TRemoteConfigOverride>(
    remoteConfigSettings.map((setting) => [setting.id, setting])
  );

  // Merge remote config settings into default configs
  const mergedConfigs = defaultConfigs.map((defaultConfig) => {
    const remoteConfig = remoteConfigMap.get(defaultConfig.id);

    if (!remoteConfig) {
      return defaultConfig;
    }

    // Merge remote config values into default config
    // Only override if the value exists in remote config
    return {
      ...defaultConfig,
      ...(remoteConfig.priority !== undefined && {
        priority: remoteConfig.priority,
      }),
      ...(remoteConfig.delay !== undefined && { delay: remoteConfig.delay }),
      ...(remoteConfig.dependencies !== undefined && {
        dependencies: remoteConfig.dependencies,
      }),
    };
  });

  // Sort by priority (lower number = higher priority)
  return mergedConfigs.toSorted((a, b) => a.priority - b.priority);
};
