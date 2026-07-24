// scripts/generate-sw.js
//
// Runs at build time — before this rename, it baked a real Firebase config
// (from NEXT_PUBLIC_FIREBASE_AUTH_CONFIG) into this static file, meaning a
// separate image had to be built per environment. Now it writes a placeholder
// token instead: tools/docker/patch-sw-config.ts substitutes the real runtime
// CS_PUBLIC_FIREBASE_AUTH_CONFIG value in-place when the container starts, so
// the same built image works across every environment.
import fs from "node:fs";
import path from "node:path";

const PLACEHOLDER_TOKEN = "__CS_PUBLIC_FIREBASE_AUTH_CONFIG__";

function generateServiceWorker() {
  try {
    console.log(
      "🔥 Generating Service Worker (placeholder Firebase config)..."
    );

    const swContent = `
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp("${PLACEHOLDER_TOKEN}");

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  try {

    const {data, notification} = payload;
    const notificationTitle = data?.title || notification?.title || "";
    const notificationBody = data?.body || notification?.body || "";
    const notificationData = {
      ...notification,
      link: data?.link,
    };
    const notificationOptions = {
      body: notificationBody,
      icon: "/images/logo-v2.png",
      data: notificationData,
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  } catch (e) {
    console.error("Notification show error:", e);
  }
});

// Force the new SW to activate immediately
self.addEventListener("install", (event) => {
  console.log("[Firebase SW] Installing...");
  event.waitUntil(self.skipWaiting());
});

// Take control over all open pages
self.addEventListener("activate", (event) => {
  console.log("[Firebase SW] Activating...");
  event.waitUntil(self.clients.claim());
});

// 🔗 Handle click to open the desired page
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const click_action = event.notification.data?.link;
  const path = click_action || "/";
  const urlToOpen = new URL(path, self.location.origin).href;
  const targetUrl = new URL(path, self.location.origin);
  const targetPathname = targetUrl.pathname;
  const targetSearch = targetUrl.search;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      let matchingClient = null;

      for (const client of windowClients) {
        const clientUrl = new URL(client.url);
        const clientPathname = clientUrl.pathname;
        const clientSearch = clientUrl.search;
        // Must match pathname first
        if (clientPathname !== targetPathname) {
          continue;
        }

        // Check search params matching
        // Both must match: pathname AND search params (if present)
        // If target has search params → client must have the same search params
        // If target doesn't have search params → client must also not have search params
        if (targetSearch) {
          // Target has search params → client must also have the same search params
          if (clientSearch === targetSearch) {
            matchingClient = client;
            break;
          }
        } else {
          // Target doesn't have search params → client must also not have search params
          if (!clientSearch || clientSearch === "") {
            matchingClient = client;
            break;
          }
        }
      }

      if (matchingClient) {
        // If there is already a tab in that path → focus on that tab
        return matchingClient.focus();
      } else if (self.clients.openWindow) {
        // If there is no tab in that path → open a new tab
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
`;

    const outputPath = path.join(
      import.meta.dirname,
      "../public/firebase-messaging-sw.js"
    );
    fs.writeFileSync(outputPath, swContent.trim());

    console.log("✅ Production Service Worker generated successfully!");
  } catch (error) {
    console.error(
      "❌ Unable to generate Service Worker file due to an unexpected error:",
      error.message
    );
    process.exit(1);
  }
}

generateServiceWorker();
