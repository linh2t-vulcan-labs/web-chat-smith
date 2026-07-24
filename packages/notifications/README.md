# @cs/notifications

FCM (Firebase Cloud Messaging) token lifecycle, permission state, and foreground message handling — extracted as small, composable pieces instead of one large provider.

## Why this exists

The reference implementation for this (a legacy notification provider) was a single ~790-line file mixing FCM SDK calls, React Query cache writes, `localStorage` token diffing, and permission-reminder timing/UI state. This package keeps only the parts that are genuinely reusable across apps — token sync, permission state, foreground message subscription — and leaves UI reaction (toasts, cache updates) and reminder policy (when to re-prompt) to the consuming app.

## Usage

The `vapidKey` is `@cs/env`'s `CS_PUBLIC_FIREBASE_VAPID_KEY`. `onToken`/token-removal should go through `@cs/notifications/integrations/api-client` — a thin, ready-made wrapper around `@cs/api-client`'s existing `notification.registerPushToken`/`unregisterPushToken` (the backend contract for FCM tokens already lives there, `packages/api-client/src/services/notification/notification.ts`) so nothing hand-rolls a second HTTP call against the same endpoints:

```tsx
// app/notifications-root.tsx
"use client";
import { getRuntimeEnv } from "@cs/env/universal";
import { useAuth } from "@cs/firebase/react";
import { registerFcmTokenWithApiClient } from "@cs/notifications/integrations/api-client";
import { NotificationsProvider } from "@cs/notifications/react";
import { app } from "@/lib/firebase";
import { queryClient } from "@/lib/query-client";

export const NotificationsRoot = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { uid } = useAuth();

  return (
    <NotificationsProvider
      app={app}
      vapidKey={getRuntimeEnv().CS_PUBLIC_FIREBASE_VAPID_KEY!}
      userId={uid}
      onToken={registerFcmTokenWithApiClient}
      onMessage={(payload) => {
        // App-level policy: update your own cache, show a toast, etc.
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }}
    >
      {children}
    </NotificationsProvider>
  );
};
```

```tsx
const { permissionState, token, requestPermission } = useNotifications();
```

## Remote-config-driven notification settings

Read those through the `useFlag` your app bound via `@cs/flags`'s `createFlagsReact` — this package doesn't duplicate Remote Config parsing:

```ts
const notificationConfig = useFlag(REMOTE_CONFIG_KEYS.NOTIFICATION_CONFIG); // typed by your schema's decoder ("json")
```

## Service worker (not included — app-owned)

This package only handles the foreground/tab side of FCM. A background message handler and the `notificationclick` behavior live in a service worker file the browser must fetch from a public URL (`/firebase-messaging-sw.js` by convention), which a package cannot ship — `apps/web` needs its own, e.g. generated at build time the way `apps/super-app/scripts/generate-sw.js` does (compat SDK via `importScripts`, `onBackgroundMessage`, custom `notificationclick` tab-matching). Pass the resulting registration in as `serviceWorkerRegistration`:

```ts
const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
<NotificationsProvider serviceWorkerRegistration={registration} ... />
```

## Swapping the token store

By default tokens are persisted to `localStorage`. Pass your own `TokenStore` (e.g. for tests, or a different persistence layer):

```ts
<NotificationsProvider tokenStore={myTokenStore} ... />
```

## Exports

| Entry point | Contents |
| --- | --- |
| `@cs/notifications` | `getMessagingClient`, `syncFcmToken`, `clearFcmToken`, `onForegroundMessage`, `createLocalStorageTokenStore`, `TokenStore` |
| `@cs/notifications/integrations/api-client` | `registerFcmTokenWithApiClient`, `unregisterFcmTokenWithApiClient` |
| `@cs/notifications/permission` | `getPermissionState`, `requestPermission` |
| `@cs/notifications/react` | `NotificationsProvider`, `useNotifications` |
