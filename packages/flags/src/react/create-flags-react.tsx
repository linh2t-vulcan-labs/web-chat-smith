"use client";

import {
  createContext,
  createElement,
  Suspense,
  useContext,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

import type { FlagsEngine } from "../core/engine";
import { resolveExperiment } from "../experiments/resolve-experiment";
import type { ExperimentDefinition } from "../experiments/types";
import type { WebFeatureKey } from "../keys";
import type { FlagSchema, FlagValue } from "../schema";
import { createWebFeatures } from "../web-features";

/**
 * Builds a fully-typed set of React bindings for one `FlagsEngine<TSchema>`.
 *
 * A generic `createContext<FlagsEngine<any>>` can't give `useFlag`/`getValue`
 * per-key return types, so each app calls this once with its own schema type
 * (in a module-level `lib/flags.ts`) and gets back hooks/components that know
 * every key's real value type — the same "create once, use everywhere" shape
 * as `zustand`'s `create()`.
 */
export const createFlagsReact = <TSchema extends FlagSchema>() => {
  const FlagsContext = createContext<FlagsEngine<TSchema> | null>(null);

  const FlagsProvider = ({
    engine,
    children,
  }: {
    engine: FlagsEngine<TSchema>;
    children: ReactNode;
  }) => createElement(FlagsContext, { value: engine }, children);

  const useFlagsEngine = (): FlagsEngine<TSchema> => {
    const engine = useContext(FlagsContext);
    if (!engine) {
      throw new Error("useFlag must be used within a <FlagsProvider>.");
    }
    return engine;
  };

  const useFlag = <K extends keyof TSchema & string>(
    key: K
  ): FlagValue<TSchema, K> => {
    const engine = useFlagsEngine();
    return useSyncExternalStore(
      engine.subscribe,
      () => engine.getValue(key),
      () => engine.getValue(key)
    );
  };

  const useExperiment = <
    TRawKey extends keyof TSchema & string,
    TVariant extends string,
  >(
    definition: ExperimentDefinition<TSchema, TRawKey, TVariant>
  ): { variant: TVariant; isReady: boolean } => {
    const engine = useFlagsEngine();
    const variant = useSyncExternalStore(
      engine.subscribe,
      () => resolveExperiment(engine, definition),
      () => resolveExperiment(engine, definition)
    );
    return { isReady: engine.initialized, variant };
  };

  const useWebFeature = <
    TValue = unknown,
    TFeatureKey extends string = WebFeatureKey,
  >(
    webFeaturesKey: keyof TSchema & string,
    featureKey: TFeatureKey
  ): TValue | null => {
    const engine = useFlagsEngine();
    const read = () =>
      createWebFeatures<TSchema, TFeatureKey>(
        engine,
        webFeaturesKey
      ).getWebFeature<TValue>(featureKey);
    return useSyncExternalStore(engine.subscribe, read, read);
  };

  /**
   * `children`/each entry in `cases` below is commonly a `React.lazy`/
   * `next/dynamic` component instance, not eagerly-imported JSX — the
   * variant to render is only known at runtime (after Remote Config
   * resolves), so without code-splitting, every variant's code ships in the
   * same bundle regardless of which one a given user actually sees. Wrapping
   * in `<Suspense>` here (rather than requiring every call site to remember
   * to add its own boundary) is what makes that code-splitting actually work
   * — `loadingFallback` is shown while a lazy variant's chunk is fetching,
   * separate from `fallback` (shown when the flag/experiment simply doesn't
   * match anything).
   */
  const Feature = ({
    flag,
    children,
    fallback = null,
    loadingFallback = null,
  }: {
    flag: keyof TSchema & string;
    children: ReactNode;
    fallback?: ReactNode;
    loadingFallback?: ReactNode;
  }) => (
    <Suspense fallback={loadingFallback}>
      {useFlag(flag) ? children : fallback}
    </Suspense>
  );

  const ExperimentSwitch = <
    TRawKey extends keyof TSchema & string,
    TVariant extends string,
  >({
    experiment,
    cases,
    fallback = null,
    loadingFallback = null,
  }: {
    experiment: ExperimentDefinition<TSchema, TRawKey, TVariant>;
    cases: Partial<Record<TVariant, ReactNode>>;
    fallback?: ReactNode;
    loadingFallback?: ReactNode;
  }) => {
    const { variant } = useExperiment(experiment);
    return (
      <Suspense fallback={loadingFallback}>
        {cases[variant] ?? fallback}
      </Suspense>
    );
  };

  return {
    Feature,
    FlagsProvider,
    ExperimentSwitch,
    useExperiment,
    useFlag,
    useFlagsEngine,
    useWebFeature,
  };
};
