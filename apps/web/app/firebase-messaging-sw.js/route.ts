import { getFirebaseConfigFromEnv } from "@cs/firebase/config";
import { connection } from "next/server";

/**
 * Serves the FCM background-message service worker as JS text, with the
 * Firebase config injected from runtime env at request time — matching this
 * repo's runtime-env philosophy (@cs/env/bridge) rather than baking the
 * config into a static `public/` file at build time. The Firebase Messaging
 * SDK auto-discovers this at `/firebase-messaging-sw.js` when
 * `NotificationsProvider` doesn't pass an explicit `serviceWorkerRegistration`.
 *
 * `await connection()` is load-bearing, not decorative: with Cache
 * Components enabled, a GET Route Handler that touches nothing
 * request-specific is eligible for build-time static prerendering (same
 * model as a normal route) — confirmed directly, this route showed up as
 * "○ Static" in the build output and threw during prerender since the
 * runtime Firebase config isn't available yet at build time. `connection()`
 * opts it back into per-request-only evaluation, which is what the
 * "runtime env philosophy" comment above already assumed was happening.
 */
export const GET = async () => {
  await connection();
  const config = getFirebaseConfigFromEnv();

  const body = `
importScripts("https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js");

firebase.initializeApp(${JSON.stringify(config)});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, ...options } = payload.notification ?? {};
  self.registration.showNotification(title ?? "", options);
});
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Service-Worker-Allowed": "/",
    },
  });
};
