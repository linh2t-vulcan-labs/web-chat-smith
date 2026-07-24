import { getFirebaseConfigFromEnv } from "@cs/firebase/config";

/**
 * Serves the FCM background-message service worker as JS text, with the
 * Firebase config injected from runtime env at request time — matching this
 * repo's runtime-env philosophy (@cs/env/bridge) rather than baking the
 * config into a static `public/` file at build time. The Firebase Messaging
 * SDK auto-discovers this at `/firebase-messaging-sw.js` when
 * `NotificationsProvider` doesn't pass an explicit `serviceWorkerRegistration`.
 */
export const GET = () => {
  const config = getFirebaseConfigFromEnv();

  const body = `
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

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
