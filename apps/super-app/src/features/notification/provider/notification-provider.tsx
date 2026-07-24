"use client";

import { getPublicEnv } from "@cs/env/client";
import { usePrevious, useToggle } from "@uidotdev/usehooks";
import type { Messaging } from "firebase/messaging";
import { useTranslations } from "next-intl";
import { Toast } from "radix-ui";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  TGetNotificationDto,
  TGetUnreadCountDto,
} from "@/core/http/dto/notification";
import { NotificationModel } from "@/core/models/notification";
import { POPUP_QUEUE_KEY } from "@/features/onboarding-popup-queue-manager/constants";
import { getNotificationsQueryKey } from "@/hooks/notifications/use-get-notifications";
import { TransformerBuilder } from "@/libs/class-transformer";
import { getFirebaseApp } from "@/libs/firebase";
import {
  deleteToken,
  getMessaging,
  getToken,
  isSupportedFCM,
  onMessage,
} from "@/libs/firebase/messaging";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { DEFAULT_NOTIFICATION_CONFIG } from "@/libs/firebase/remote-config-default";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import type { InfiniteData } from "@/libs/react-query";
import { useQueryClient } from "@/libs/react-query";
import type { TNotificationTrigger } from "@/libs/tracking-event";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useAuthState } from "@/store/auth";
import { useGlobalState } from "@/store/global/hooks";
import { localStorageImpl, safeJsonParse } from "@/utils/commons/helpers";
import {
  LOCAL_STORAGE_KEY,
  PUSH_TOKEN_ID_KEY,
  PUSH_TOKEN_KEY,
} from "@/utils/commons/keys";

import { NotificationConfirmToast } from "../components/notification-confirm-toast";
import { NOTIFICATION_CONFIRM_TEXT_DEFAULT } from "../components/notification-confirm-toast/constants";
import { NotificationListener } from "../components/notification-listener";
import { NotificationToast } from "../components/notification-toast";
import {
  DEFAULT_NOTIFICATION_STORE,
  PERMISSION_MESSAGE_TYPE,
} from "../constants/permission";
import { E_PERMISSION_REQUEST_TYPE } from "../enum/permission";
import { useDeletePushToken } from "../hooks/use-delete-push-token";
import {
  getUnreadCountQueryKey,
  useGetUnreadCount,
} from "../hooks/use-get-unread-count";
import { useLoadNotification } from "../hooks/use-load-notification";
import { usePushTokens } from "../hooks/use-push-tokens";
import type {
  MessageData,
  TConfirmToastOptions,
  TNotificationConfig,
  TNotificationStore,
  TRequestPermissionOptions,
} from "../types/common";
import {
  checkShowSoftPermissionByTime,
  checkTimestamp,
  isIOSBrowser,
  isServiceWorkerSupported,
} from "../utils/helpers";
import { logger } from "../utils/logger";
import { NotificationContext } from "./notification-context";

const TOAST_OPTION_DEFAULT = {
  description: "",
  fromNewUser: false,
  title: "",
};

function updateNotificationStore(property: string, value: string | boolean) {
  const currentNotificationStore =
    localStorageImpl.load<TNotificationStore>(
      LOCAL_STORAGE_KEY.NOTIFICATION_STORE
    ) || DEFAULT_NOTIFICATION_STORE;
  const newNotificationStore = {
    ...currentNotificationStore,
    [property]: value,
  };
  localStorageImpl.save(
    LOCAL_STORAGE_KEY.NOTIFICATION_STORE,
    newNotificationStore
  );
}

async function getFCMToken(
  messaging: Messaging,
  registration: ServiceWorkerRegistration
) {
  try {
    const token = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      vapidKey: getPublicEnv().CS_PUBLIC_FIREBASE_VAPID_KEY,
    });
    if (!token) {
      logger("warn", "⚠️ Failed to get FCM token");
      return "";
    }
    return token;
  } catch (error) {
    logger("error", "Error getting new FCM token:", error);
    return "";
  }
}

async function clearFirebaseCloudMessagingPushScope() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  const unregisterPromises = registrations
    .filter((registration) => {
      const scope = registration.scope || "";
      return scope.includes("firebase-cloud-messaging-push-scope");
    })
    .map((registration) => registration.unregister());
  await Promise.all(unregisterPromises);
}

function getTriggerNameFromOpts(opts?: TRequestPermissionOptions) {
  const { fromWhatsNew = false, fromOnboarding = false } = opts || {};
  if (fromWhatsNew) {
    return "whats_new";
  }
  if (fromOnboarding) {
    return "onboarding";
  }
  return "";
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const commonT = useTranslations("common");
  const [shouldFetchNotifications, setShouldFetchNotifications] =
    useState(false);
  const [alertDialogOpen, toggleAlertDialog] = useToggle(false);
  const [alertConfirmToastOpen, toggleAlertConfirmToast] = useToggle(false);
  const [hasClosedPopup, setHasClosedPopup] = useState(false);
  const [confirmToastOptions, setConfirmToastOptions] =
    useState<TConfirmToastOptions>(TOAST_OPTION_DEFAULT);
  const [activeNotification, setActiveNotification] =
    useState<NotificationModel>();
  const [firebasePushToken, setFirebasePushToken] = useState("");
  const previousToastOptions = usePrevious(confirmToastOptions);
  const { sendTrackingEvent } = useSendTrackingEvent();
  const isAuthenticated = useAuthState((state) => state.isAuthenticated);
  const queryClient = useQueryClient();
  const userSubscriptionInfo = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const { isValidPremiumUser } = userSubscriptionInfo;
  const { getValueSyncRemoteConfig } = useRemoteConfigContext();

  const raw = getValueSyncRemoteConfig(REMOTE_CONFIG_KEY.NOTIFICATION_CONFIG);
  const notificationConfig =
    safeJsonParse<TNotificationConfig>(raw) || DEFAULT_NOTIFICATION_CONFIG;

  const isBrowserSupported = useCallback(() => !isIOSBrowser(), []);

  const initNotificationLocalStore = useCallback(() => {
    const currentNotificationStore = localStorageImpl.load<TNotificationStore>(
      LOCAL_STORAGE_KEY.NOTIFICATION_STORE
    );
    if (currentNotificationStore) {
      return;
    } // Keep existing store
    const notificationStore = {
      recentRequestTime: "",
      shownNewUserSoftPerm: false,
    };
    localStorageImpl.save(
      LOCAL_STORAGE_KEY.NOTIFICATION_STORE,
      notificationStore
    );
  }, []);

  const checkShownNewUserSoftPerm = useCallback(() => {
    const currentNotificationStore =
      localStorageImpl.load<TNotificationStore>(
        LOCAL_STORAGE_KEY.NOTIFICATION_STORE
      ) || DEFAULT_NOTIFICATION_STORE;
    return !!currentNotificationStore.shownNewUserSoftPerm;
  }, []);

  const couldAskSoftPermissionAgain = useCallback(() => {
    const currentNotificationStore = localStorageImpl.load<TNotificationStore>(
      LOCAL_STORAGE_KEY.NOTIFICATION_STORE
    );
    if (!currentNotificationStore) {
      return true;
    }
    const { popupDelayMs } = notificationConfig;
    const { recentRequestTime } = currentNotificationStore;
    const validTime = checkTimestamp(recentRequestTime);

    if (validTime === null) {
      return true;
    }
    return checkShowSoftPermissionByTime(validTime, popupDelayMs);
  }, [notificationConfig]);

  const setConfirmToastOptionsByType = useCallback(
    (type: E_PERMISSION_REQUEST_TYPE, options?: TConfirmToastOptions) => {
      const [title, description] = PERMISSION_MESSAGE_TYPE[type];
      const popupTitle = title || NOTIFICATION_CONFIRM_TEXT_DEFAULT.TITLE;
      const popupDesc =
        description || NOTIFICATION_CONFIRM_TEXT_DEFAULT.DESCRIPTION;
      setConfirmToastOptions({
        description: commonT(popupDesc),
        fromNewUser: options?.fromNewUser ?? false,
        title: commonT(popupTitle),
        triggerName: options?.triggerName ?? "",
      });
    },
    [commonT]
  );

  const setConfirmToastState = useCallback(
    (
      enable: boolean,
      type = E_PERMISSION_REQUEST_TYPE.NOTIFICATION_BASE_PERMISSION,
      options?: TConfirmToastOptions
    ) => {
      toggleAlertConfirmToast(enable);
      setConfirmToastOptionsByType(type, options);
    },
    [toggleAlertConfirmToast, setConfirmToastOptionsByType]
  );

  // Handle unread count changes - reset notifications when count changes
  const handleUnreadCountChanged = useCallback(
    (newCount: number, oldCount: number) => {
      logger(
        "warn",
        `Unread count changed from ${oldCount} to ${newCount}, resetting notifications...`
      );
      // Reset notifications query to clear all pages and refetch first page
      queryClient.resetQueries({ queryKey: getNotificationsQueryKey() });
    },
    [queryClient]
  );

  const { loading, items, hasNextPage, error, loadMore, refetch } =
    useLoadNotification({
      shouldFetch: shouldFetchNotifications && isAuthenticated,
    });
  const { data: result, refetch: refetchUnreadCount } = useGetUnreadCount(
    isAuthenticated,
    handleUnreadCountChanged
  );
  const unReadCount = result?.unread_count || 0;
  const pushTokensMutation = usePushTokens();
  const deletePushTokenMutation = useDeletePushToken();

  const [permission, setPermission] = useState<NotificationPermission | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const userId = useGlobalState((state) => state.user.id);
  const hasAutoSynced = useRef(false);
  const messagingRef = useRef<ReturnType<typeof getMessaging> | null>(null);
  const hasRegisteredOnMessage = useRef(false);
  const serviceWorkerRegistrationRef = useRef<ServiceWorkerRegistration | null>(
    null
  );

  // Derive hasPermission from permission state
  const hasPermission = permission === "granted";
  const canRequestPermission = permission === "default" || permission === null;

  // Function to enable notification fetching (called on first bell click)
  const enableNotificationFetch = useCallback(() => {
    setShouldFetchNotifications(true);
  }, []);

  const canShowSoftPermission = useCallback(
    () =>
      canRequestPermission &&
      isBrowserSupported() &&
      couldAskSoftPermissionAgain(),
    [isBrowserSupported, couldAskSoftPermissionAgain, canRequestPermission]
  );

  const clearNotificationStorage = useCallback(() => {
    localStorageImpl.remove(PUSH_TOKEN_KEY);
    localStorageImpl.remove(PUSH_TOKEN_ID_KEY);
  }, []);

  // Helper function to get messaging instance
  const getMessagingInstance = useCallback(() => {
    if (!messagingRef.current) {
      messagingRef.current = getMessaging(getFirebaseApp());
    }
    return messagingRef.current;
  }, []);

  // Helper functions for token storage
  const saveTokenToStorage = useCallback(
    (fcmToken: string, _userId: string) => {
      localStorageImpl.save(PUSH_TOKEN_KEY, fcmToken);
      // Also save the current userId to track which user this token belongs to
      if (_userId) {
        localStorageImpl.save(PUSH_TOKEN_ID_KEY, _userId);
      }
    },
    []
  );

  const getTokenFromStorage = useCallback(
    (): string | null => localStorageImpl.load<string>(PUSH_TOKEN_KEY),
    []
  );

  const getStoredUserId = useCallback(
    (): string | null => localStorageImpl.load<string>(PUSH_TOKEN_ID_KEY),
    []
  );

  const sendTokenToServer = useCallback(
    async (pushToken: string) => {
      await pushTokensMutation.mutateAsync(pushToken).catch(() => null);
    },
    [pushTokensMutation]
  );

  // Transform Firebase message to NotificationModel format
  const transformFirebaseMessage = useCallback(
    (message: MessageData): NotificationModel => {
      const { notification = {}, data = {} } = message;

      const transformedNotification = new TransformerBuilder(NotificationModel)
        .format({
          content: notification?.body,
          created_at: (Date.now() / 1000).toString(),
          id: message.messageId,
          image_url: notification?.image,
          link: data?.link,
          read: false,
          title: notification?.title,
          user_id: userId,
        })
        .toPlainCamelCase() as NotificationModel;
      return transformedNotification;
    },
    [userId]
  );

  // Callback to handle new Firebase messages
  const handleFirebaseMessage = useCallback(
    (message: MessageData) => {
      const newNotification = transformFirebaseMessage(message);
      setActiveNotification(newNotification);

      // Update the query cache to add the new notification to the first page
      queryClient.setQueryData<
        InfiniteData<TGetNotificationDto & { data: NotificationModel[] }>
      >(getNotificationsQueryKey(), (oldData) => {
        if (!oldData?.pages?.[0]) {
          return oldData;
        }

        const updatedPages = [...oldData.pages];
        const firstPage = {
          ...oldData.pages[0],
          data: [newNotification, ...oldData.pages[0].data],
        };
        updatedPages[0] = firstPage;

        return {
          ...oldData,
          pages: updatedPages,
        };
      });

      // Update unread count by incrementing 1
      queryClient.setQueryData<TGetUnreadCountDto>(
        getUnreadCountQueryKey(),
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          return {
            ...oldData,
            unread_count: (oldData.unread_count || 0) + 1,
          };
        }
      );
    },
    [queryClient, transformFirebaseMessage]
  );

  // Register onMessage when permission is granted
  const registerOnMessage = useCallback(async () => {
    if (hasRegisteredOnMessage.current) {
      return;
    }

    const supported = await isSupportedFCM();
    if (!supported) {
      console.warn("Firebase Messaging not supported on this browser.");
      return;
    }

    try {
      const messaging = getMessagingInstance();

      // Only receive message when app is open
      onMessage(messaging, (payload) => {
        const { data, notification = {} } = payload;

        const notificationData = {
          body: data?.body || notification?.body,
          image: data?.image || notification?.image,
          title: data?.title || notification?.title,
        };

        const messageData: MessageData = {
          data,
          messageId: payload.messageId,
          notification: notificationData,
        };

        // Handle the new Firebase message
        handleFirebaseMessage(messageData);
        // Open alert dialog
        toggleAlertDialog(true);
      });

      hasRegisteredOnMessage.current = true;
    } catch (error) {
      logger("error", "FCM onMessage registration error:", error);
    }
  }, [getMessagingInstance, handleFirebaseMessage, toggleAlertDialog]);

  const deleteFirebasePushToken = useCallback(async () => {
    try {
      const messaging = getMessagingInstance();
      if (!messaging || firebasePushToken) {
        return;
      }
      await deleteToken(messaging);
    } catch (error) {
      logger("error", "Error deleting FCM token:", error);
    }
  }, [getMessagingInstance, firebasePushToken]);

  const unregisterPushToken = useCallback(
    async (pushToken: string, clearStorage?: boolean) => {
      try {
        await deletePushTokenMutation
          .mutateAsync(pushToken)
          .then(() => {
            if (clearStorage) {
              clearNotificationStorage();
            }
          })
          .catch(() => null);
        return true;
      } catch (error) {
        logger("error", "Error deleting FCM token:", error);
        return false;
      }
    },
    [deletePushTokenMutation, clearNotificationStorage]
  );

  const syncTokenWithServer = useCallback(
    async (isUserAction: boolean) => {
      const context = isUserAction ? "User action" : "Auto-sync";

      if (!userId) {
        return;
      }

      try {
        if (isServiceWorkerSupported()) {
          const messaging = getMessagingInstance();

          // Register service worker if not already registered

          // Get or register service worker
          let registration = serviceWorkerRegistrationRef.current;
          if (!registration) {
            // Check if there's an existing registration first
            const existingRegistration =
              await navigator.serviceWorker.getRegistration(
                "/firebase-messaging-sw.js"
              );
            if (existingRegistration) {
              registration = existingRegistration;
              serviceWorkerRegistrationRef.current = registration;
            } else {
              // Register new service worker
              registration = await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js"
              );
              if (registration) {
                serviceWorkerRegistrationRef.current = registration;
              }
            }
          }

          if (!registration) {
            return;
          }

          clearFirebaseCloudMessagingPushScope();
          // Get current token
          const currentToken = await getFCMToken(messaging, registration);
          if (currentToken) {
            // Get stored token and userId from localStorage
            setFirebasePushToken(currentToken);
            const storedToken = getTokenFromStorage();
            const storedUserId = getStoredUserId();

            // Check if we need to send token to server
            // Send token if:
            // 1. No stored token exists
            // 2. Current token differs from stored token
            const shouldSendToken =
              storedUserId !== userId ||
              !storedToken ||
              currentToken !== storedToken;

            if (shouldSendToken) {
              // Save new token and userId to storage
              saveTokenToStorage(currentToken, userId);
              await sendTokenToServer(currentToken);
            }
          } else {
            logger("warn", `${context}: No registration token available`);
          }
        }
      } catch (error) {
        logger("warn", `${context}: Error syncing token:`, error);
      }
    },
    [
      userId,
      saveTokenToStorage,
      getTokenFromStorage,
      getStoredUserId,
      sendTokenToServer,
      getMessagingInstance,
    ]
  );

  const requestPermissionAndGetToken = useCallback(
    async (
      opts?: TRequestPermissionOptions
    ): Promise<NotificationPermission> => {
      if (!userId) {
        return "denied";
      }

      setIsLoading(true);

      try {
        if (isServiceWorkerSupported()) {
          // Request notification permission (only when user clicks bell icon)
          const permission = await Notification.requestPermission();
          setPermission(permission);
          if (permission === "granted") {
            const triggerName = opts
              ? getTriggerNameFromOpts(opts)
              : confirmToastOptions?.triggerName ||
                previousToastOptions?.triggerName;
            sendTrackingEvent({
              name: EventKeys.MainNotificationAllowPermission,
              payload: {
                trigger: triggerName as unknown as TNotificationTrigger,
                vulcan_user_id: userId,
              },
            });
            await syncTokenWithServer(true);
            // Register onMessage handler when permission is granted
            await registerOnMessage();
          }

          return permission;
        }
      } catch (error) {
        logger("warn", "User action: Error requesting permission:", error);
        return "denied";
      } finally {
        setIsLoading(false);
      }

      return "denied";
    },
    [
      userId,
      previousToastOptions,
      confirmToastOptions,
      syncTokenWithServer,
      registerOnMessage,
      sendTrackingEvent,
    ]
  );

  const checkPermissionAndToken = useCallback(async () => {
    if (!userId) {
      return;
    }

    if (hasAutoSynced.current) {
      logger("warn", "Already auto-synced, skipping...");
      return;
    }

    hasAutoSynced.current = true;

    try {
      if (isServiceWorkerSupported()) {
        // Check current permission status
        const { permission } = Notification;

        // Update permission state in provider
        setPermission(permission);

        // Only auto-sync token and register onMessage if permission is already granted
        if (permission === "granted") {
          await syncTokenWithServer(false);
          await registerOnMessage();
        } else {
          logger("warn", "Permission not granted.");
        }
      }
    } catch (error) {
      logger("warn", "Error checking permission:", error);
    }
  }, [userId, syncTokenWithServer, registerOnMessage]);

  const handleRequestPermission = useCallback(() => {
    requestPermissionAndGetToken();
    toggleAlertConfirmToast(false);
  }, [requestPermissionAndGetToken, toggleAlertConfirmToast]);

  const handleNotificationClose = () => {
    toggleAlertDialog(false);
  };

  // Auto-sync token when component mounts
  useEffect(() => {
    if (userId && !hasAutoSynced.current) {
      checkPermissionAndToken();
    }
  }, [userId, checkPermissionAndToken]);

  const checkClosedPopupFromLocalStore = useCallback(() => {
    const existingStore = !!localStorageImpl.load(
      LOCAL_STORAGE_KEY.NOTIFICATION_STORE
    );
    setHasClosedPopup(
      existingStore &&
        localStorageImpl.load(POPUP_QUEUE_KEY.NOTIFICATION_PERMISSION) === true
    );
  }, []);

  useEffect(() => {
    // oxlint-disable-next-line react/react-compiler -- reads popup-closed flag from localStorage (external system) on mount to sync into state, not a render derivation
    checkClosedPopupFromLocalStore();
  }, [checkClosedPopupFromLocalStore]);

  // Expose context value
  const value = useMemo(
    () => ({
      canRequestPermission,
      canShowSoftPermission,
      checkShownNewUserSoftPerm,
      clearNotificationStorage,
      deleteFirebasePushToken,
      enableNotificationFetch,
      error,
      firebasePushToken,
      hasClosedPopup,
      hasNextPage,
      hasPermission,
      initNotificationLocalStore,
      isBrowserSupported,
      isLoading,
      loadMore,
      loading,
      notifications: items,
      permission,
      refetchUnreadCount,
      reloadNotifications: refetch,
      requestPermissionAndGetToken,
      setConfirmToastState,
      setHasClosedPopup,
      setPermission,
      shouldFetchNotifications,
      unReadCount,
      unregisterPushToken,
    }),
    [
      items,
      hasNextPage,
      error,
      unReadCount,
      canRequestPermission,
      firebasePushToken,
      loading,
      permission,
      hasPermission,
      isLoading,
      shouldFetchNotifications,
      loadMore,
      requestPermissionAndGetToken,
      enableNotificationFetch,
      refetch,
      refetchUnreadCount,
      setConfirmToastState,
      deleteFirebasePushToken,
      clearNotificationStorage,
      unregisterPushToken,
      isBrowserSupported,
      initNotificationLocalStore,
      checkShownNewUserSoftPerm,
      canShowSoftPermission,
      setHasClosedPopup,
      hasClosedPopup,
    ]
  );

  return (
    <NotificationContext value={value}>
      {children}
      <NotificationListener />
      <Toast.Provider swipeDirection="right" duration={4000}>
        {activeNotification && (
          <NotificationToast
            open={alertDialogOpen}
            onOpenChange={(open) => {
              toggleAlertDialog(open);
              if (open === false) {
                setActiveNotification(undefined);
              }
            }}
            onClose={handleNotificationClose}
            title={activeNotification.title}
            content={activeNotification.content}
            imageUrl={activeNotification.imageUrl}
            link={activeNotification.link}
          />
        )}
        <NotificationConfirmToast
          userId={userId}
          isPremium={isValidPremiumUser}
          open={alertConfirmToastOpen}
          options={confirmToastOptions}
          onRequestPermission={handleRequestPermission}
          onOpenChange={(open) => {
            toggleAlertConfirmToast(open);
            if (open === false) {
              updateNotificationStore("recentRequestTime", String(Date.now()));
              if (confirmToastOptions.fromNewUser) {
                updateNotificationStore("shownNewUserSoftPerm", true);
              }
              setConfirmToastOptions(TOAST_OPTION_DEFAULT);
            }
          }}
        />
        <Toast.Viewport className="fixed top-4 end-4 z-99 flex flex-col gap-2 outline-none rtl:right-auto" />
      </Toast.Provider>
    </NotificationContext>
  );
}

export { useNotification } from "./notification-context";
