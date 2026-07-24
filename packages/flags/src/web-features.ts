import type { FlagsEngine } from "./core/engine";
import type { WebFeatureKey } from "./keys";
import type { FlagSchema } from "./schema";

type WebFeatureValue = boolean | { isEnabled: boolean };

/**
 * Reads one entry out of the `web_features` JSON flag. This is intentionally
 * a thin helper on top of `engine.getValue`, not a special case baked into
 * the engine — a "web feature" is just a JSON flag with nested keys.
 *
 * `TFeatureKey` defaults to {@link WebFeatureKey} (this package's canonical
 * nested-key set) so a typo like `"singInOneTap"` is a compile error instead
 * of a getter that silently always returns `false`/`null`. Pass a different
 * `TFeatureKey` explicitly if your app's `web_features` blob uses its own key
 * set instead.
 */
export const createWebFeatures = <
  TSchema extends FlagSchema,
  TFeatureKey extends string = WebFeatureKey,
>(
  engine: FlagsEngine<TSchema>,
  webFeaturesKey: keyof TSchema & string
) => {
  const getWebFeature = <TValue = unknown>(
    featureKey: TFeatureKey
  ): TValue | null => {
    const features = engine.getValue(webFeaturesKey) as Record<string, unknown>;
    if (typeof features !== "object" || features === null) {
      return null;
    }
    const value = features[featureKey];
    return value === undefined ? null : (value as TValue);
  };

  const isWebFeatureEnabled = (featureKey: TFeatureKey): boolean => {
    const value = getWebFeature<WebFeatureValue>(featureKey);
    if (value === null) {
      return false;
    }
    return typeof value === "boolean" ? value : value.isEnabled === true;
  };

  return { getWebFeature, isWebFeatureEnabled };
};
