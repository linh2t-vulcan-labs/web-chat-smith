# @cs/flags

A typed, provider-agnostic feature flags / remote config / A-B experiment engine. The Firebase Remote Config integration is one adapter, not the whole package — nothing outside `@cs/flags/firebase` imports the Firebase SDK.

## Why this exists (and what it replaces)

The previous version of this package wrapped Firebase Remote Config, but every typed getter (`getBoolean`/`getString`/`getNumber`/`getJSON`/`getValue`) duplicated the same override → default → fetch → parse → catch sequence, and `getValue` re-implemented type dispatch with an `if/else` chain on `typeof default` instead of a lookup table. Consuming apps then re-declared defaults in two or three more places, and any raw "experiment variant" Remote Config value (e.g. a UI-version integer) had to be decoded with hand-rolled modulo/`Set` arithmetic duplicated at every call site.

This version fixes that by making the **schema** the single source of truth: one place declares each key's decoder and default, and every getter, hook, and experiment is derived from it — no parallel type tables, no per-key `if/else`.

## 1. Define your schema

```ts
// lib/flags/schema.ts
import { REMOTE_CONFIG_KEYS } from "@cs/flags/keys";
import { defineFlagSchema } from "@cs/flags/schema";

export const flagSchema = defineFlagSchema({
  [REMOTE_CONFIG_KEYS.SYNC_BETA]: { decoder: "boolean", defaultValue: false },
  [REMOTE_CONFIG_KEYS.PACKAGE_SUBSCRIPTION_UI_VERSION]: {
    decoder: "number",
    defaultValue: 6,
  },
  [REMOTE_CONFIG_KEYS.WEB_FEATURES]: {
    decoder: "json",
    defaultValue: {} as Record<string, unknown>,
  },
});
```

## 2. Create the engine (Firebase adapter)

```ts
// lib/flags/engine.ts
import { createFlagsEngine } from "@cs/flags";
import { createFirebaseAdapter } from "@cs/flags/firebase";
import { getRemoteConfig } from "firebase/remote-config";
import { app } from "@/lib/firebase";
import { getRuntimeEnv } from "@cs/env/universal";
import { flagSchema } from "./schema";

const remoteConfig = getRemoteConfig(app);
// `@cs/env`'s schema already declares this fetch-interval override —
// `remoteConfig.settings` is owned by the caller, this package never touches it.
// Leave the env var unset in staging/prod to fall through to the Firebase
// SDK's own default (12h) — only override when a call site has a real reason
// to (e.g. `0` for local dev), don't hardcode the SDK's default here.
const fetchIntervalMs =
  getRuntimeEnv().CS_PUBLIC_FIREBASE_REMOTE_CONFIG_INTERVAL_FETCH;
if (fetchIntervalMs) {
  remoteConfig.settings.minimumFetchIntervalMillis = fetchIntervalMs;
}

export const flagsEngine = createFlagsEngine({
  adapter: createFirebaseAdapter(remoteConfig, flagSchema),
  schema: flagSchema,
  // The caller decides dev-vs-prod — this package never reads NODE_ENV itself.
  initialOverrides:
    process.env.NODE_ENV === "production" ? undefined : devOverrides,
  onError: (error, context) => console.error("[flags]", context, error),
});
```

## 3. Bind typed React hooks once per app

```tsx
// lib/flags/react.tsx
"use client";
import { createFlagsReact } from "@cs/flags/react";
import type { flagSchema } from "./schema";

export const {
  FlagsProvider,
  useFlag,
  useExperiment,
  useWebFeature,
  Feature,
  ExperimentSwitch,
} = createFlagsReact<typeof flagSchema>();
```

```tsx
// app/layout.tsx
import { FlagsProvider } from "@/lib/flags/react";
import { flagsEngine } from "@/lib/flags/engine";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FlagsProvider engine={flagsEngine}>{children}</FlagsProvider>;
}
```

```tsx
const syncBeta = useFlag(REMOTE_CONFIG_KEYS.SYNC_BETA); // boolean, fully typed
```

## Experiments (A/B/n variants)

An experiment decodes one raw flag (typically a number) into a named variant via a single `decode` function — replacing the modulo/`Set` arithmetic that used to live in components.

```ts
// lib/flags/experiments.ts
import { defineExperiment } from "@cs/flags";
import { REMOTE_CONFIG_KEYS } from "@cs/flags/keys";
import type { flagSchema } from "./schema";

const defineAppExperiment = defineExperiment<typeof flagSchema>();
const TIERS = ["tier1", "tier2", "tier3"] as const;

export const subscriptionUiExperiment = defineAppExperiment({
  key: REMOTE_CONFIG_KEYS.PACKAGE_SUBSCRIPTION_UI_VERSION,
  variants: TIERS,
  defaultVariant: "tier1",
  decode: (raw) => TIERS[(raw - 6) % 3] ?? "tier1",
});
```

```tsx
<ExperimentSwitch
  experiment={subscriptionUiExperiment}
  cases={{
    tier1: <SubscriptionModalTier1 />,
    tier2: <SubscriptionModalTier2 />,
    tier3: <SubscriptionModalTier3 />,
  }}
/>
```

Or in a hook: `const { variant, isReady } = useExperiment(subscriptionUiExperiment)`.

## Web features (nested flag)

`web_features` is just a JSON flag with nested keys — `useWebFeature` reads one entry out of it:

```tsx
const oneTapEnabled = useWebFeature(
  REMOTE_CONFIG_KEYS.WEB_FEATURES,
  WEB_FEATURE_KEYS.SIGN_IN_ONE_TAP
);
```

## Local overrides (dev tools)

```ts
flagsEngine.setOverride(REMOTE_CONFIG_KEYS.SYNC_BETA, true);
flagsEngine.clearOverrides();
```

Both trigger a re-render in every component reading that flag (the engine notifies subscribers via `useSyncExternalStore`, not a manual `isReady` gate).

## Exports

| Entry point | Contents |
| --- | --- |
| `@cs/flags` | `createFlagsEngine`, `defineExperiment`, `resolveExperiment`, `createWebFeatures` |
| `@cs/flags/keys` | `REMOTE_CONFIG_KEYS`, `WEB_FEATURE_KEYS` |
| `@cs/flags/schema` | `defineFlagSchema` |
| `@cs/flags/firebase` | `createFirebaseAdapter` (the only file importing `firebase/remote-config`) |
| `@cs/flags/react` | `createFlagsReact` |

## Adding a new provider

Implement the `FlagAdapter` interface (`init`, `getRawValue`) — nothing else in the package needs to change. `createFirebaseAdapter` is the reference implementation.

## Bundle size

Measured directly from this repo's installed `firebase` version (unminified ESM entry files, before minify+gzip):

| Module                   | Unminified ESM size |
| ------------------------ | ------------------- |
| `firebase/app`           | ~44 KB              |
| `firebase/remote-config` | ~96 KB              |
| `firebase/auth`          | ~450 KB             |
| `firebase/messaging`     | ~80 KB              |

After minify+gzip (typical ~4-6x reduction for this kind of code), using Remote Config at all costs roughly **20-30 KB gzipped** on top of `firebase/app`'s **~10 KB gzipped** — a real, non-trivial cost, but it is the cost of choosing Firebase Remote Config as the provider, not something this package's architecture adds on top of it. `firebase/auth` is the actually expensive one (~80-100 KB gzipped) if your app also uses `@cs/firebase/auth`.

What this package's design _does_ control, and gets right:

- `@cs/flags/schema`, `@cs/flags/keys`, `defineExperiment`/`resolveExperiment` import **zero** Firebase or React — code that only needs types/schema/experiment-decoding (e.g. a server-side analytics job) pulls in none of the SDK weight above. This was a real regression in the previous version of this package, whose root `index.ts` re-exported the Firebase client directly, so importing anything from `@cs/flags` — even just a key constant — pulled in `firebase/remote-config`.
- The Firebase SDK is only ever imported from `@cs/flags/firebase`'s one file, so it can't end up duplicated across multiple entry points in your bundle.

What's still on the app to decide: whether Remote Config needs to be fetched eagerly on every route, or whether it can be deferred (e.g. `await import("@cs/flags/firebase")` behind a route that actually needs flags, accepting default values until it resolves) — that's a routing/UX tradeoff this package can't make for you.

### Does having many flags/experiments bloat the bundle?

Two different things, two different answers:

- **The flags system's own code (schema, engine, decoders, `defineExperiment`) — no.** `getValue`/`resolveExperiment` are each _one_ generic function shared by every key; adding the 50th schema entry or the 10th experiment adds a few bytes of data (a decoder string + a default value), not more branching code. This was one of the explicit goals of this rewrite — the old package's `if (typeof def === "boolean") ... else if ...` pattern _did_ grow (a little) per code path touched, but never per flag either; it's the components below that actually scale badly.

- **The components gated behind a flag/experiment — yes, if you're not careful, and this gets worse as you add more variants.** A client-side flag/experiment can only be evaluated _after_ Remote Config resolves in the browser — the decision literally cannot be made at build time. If you write:

  ```tsx
  import { Tier1Modal } from "./tier1-modal";
  import { Tier2Modal } from "./tier2-modal";
  import { Tier3Modal } from "./tier3-modal";

  <ExperimentSwitch
    experiment={subscriptionUiExperiment}
    cases={{
      tier1: <Tier1Modal />,
      tier2: <Tier2Modal />,
      tier3: <Tier3Modal />,
    }}
  />;
  ```

  all three modals are statically imported, so **all three ship in the same bundle** for every user, even though each user only ever sees one — the exact bug `apps/super-app` had with `AccountSubscriptionModalV4`/`V5` always bundled together regardless of `dsVersion`. This isn't specific to this package's design; it's inherent to any client-evaluated flag system. The more variants you add without addressing this, the worse it gets.

  **Mitigation — code-split each variant** with `next/dynamic`/`React.lazy`, so only the selected variant's chunk is fetched at runtime. `Feature` and `ExperimentSwitch` both wrap their output in a `<Suspense>` (with a `loadingFallback` prop, separate from `fallback` for the "no match" case) specifically so this works without every call site remembering to add its own boundary:

  ```tsx
  import dynamic from "next/dynamic";

  const Tier1Modal = dynamic(() => import("./tier1-modal"));
  const Tier2Modal = dynamic(() => import("./tier2-modal"));
  const Tier3Modal = dynamic(() => import("./tier3-modal"));

  <ExperimentSwitch
    experiment={subscriptionUiExperiment}
    loadingFallback={<ModalSkeleton />}
    cases={{
      tier1: <Tier1Modal />,
      tier2: <Tier2Modal />,
      tier3: <Tier3Modal />,
    }}
  />;
  ```

  Now each `dynamic()` call is its own chunk, and only the chunk for the resolved variant is ever fetched. The same applies to `<Feature flag={...}>{children}</Feature>` when `children` is a large component — pass a `dynamic()`/`lazy()` component instance instead of a directly-imported one whenever the gated component is non-trivial.
