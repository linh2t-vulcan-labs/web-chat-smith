import type { FirebaseApp } from "firebase/app";
import type { Messaging } from "firebase/messaging";

let cachedMessaging: Messaging | null = null;
let supportChecked = false;

/**
 * Lazily creates the singleton `Messaging` client, gated on `isSupported()`
 * (FCM isn't available in every browser/SSR context). `firebase/messaging`
 * itself is dynamically imported here (not a static top-level import) so its
 * SDK weight ships as its own chunk, fetched only once a notifications
 * provider actually mounts, instead of sitting in every route's initial bundle.
 */
export const getMessagingClient = async (
  app: FirebaseApp
): Promise<Messaging | null> => {
  if (cachedMessaging) {
    return cachedMessaging;
  }
  if (supportChecked) {
    return null;
  }
  supportChecked = true;
  const { getMessaging, isSupported } = await import("firebase/messaging");
  if (!(await isSupported())) {
    return null;
  }
  cachedMessaging = getMessaging(app);
  return cachedMessaging;
};
