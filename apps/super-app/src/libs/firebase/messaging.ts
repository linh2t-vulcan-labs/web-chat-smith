// Kept out of `./index` so routes that never render NotificationProvider
// (the only consumer) don't pull the firebase/messaging SDK into the shared
// bundle used by every route (auth + remote config).
export {
  deleteToken,
  getMessaging,
  getToken,
  isSupported as isSupportedFCM,
  onMessage,
} from "firebase/messaging";
