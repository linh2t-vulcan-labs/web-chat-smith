"use client";

import { useMemo, useRef } from "react";

import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";

// Params for the "image generation completed" event. vulcan_user_id is added by the hook, so callers
// only pass the per-generation outcome.
export interface SuiteImageGenTrackingParams {
  status: "success" | "failed";
  type: "with template" | "no template";
  action: "" | "create logo" | "create image" | "edit image";
}

/**
 * Centralizes the Design Studio analytics events so trigger sites just call a named method and
 * never re-derive payload shapes or the user id. Mirrors the assistant-writing tracking flow:
 * the event names/payloads live in libs/tracking-event (the typed registry); this hook wraps
 * sendTrackingEvent + the current user id.
 *
 * The returned methods are stable across renders (read user id / sender via refs), so they're safe
 * to use directly in effects/memo deps without re-running.
 */
export function useSuiteTracking() {
  const { sendTrackingEvent } = useSendTrackingEvent();
  const userId = useGlobalState((state) => state.user.id);

  const sendRef = useRef(sendTrackingEvent);
  // oxlint-disable-next-line react/react-compiler -- intentional latest-value ref updated during render so the stable tracking methods below always send with the newest sender without changing identity
  sendRef.current = sendTrackingEvent;
  const userIdRef = useRef(userId);
  // oxlint-disable-next-line react/react-compiler -- intentional latest-value ref updated during render so the stable tracking methods below always read the current user id without changing identity
  userIdRef.current = userId;

  return useMemo(() => {
    // "(if any)" events: include the id only when present — guests have an empty id.
    const optionalUser = () =>
      userIdRef.current ? { vulcan_user_id: userIdRef.current } : {};

    return {
      trackAddImageToChat: () =>
        sendRef.current({
          name: EventKeys.DesignstudioAddImageToChat,
          payload: { vulcan_user_id: userIdRef.current },
        }),
      trackCanvasMarkToEdit: () =>
        sendRef.current({
          name: EventKeys.DesignstudioCanvasMarkToEdit,
          payload: { vulcan_user_id: userIdRef.current },
        }),
      trackChatAttachFile: () =>
        sendRef.current({
          name: EventKeys.DesignstudioChatAttachFile,
          payload: optionalUser(),
        }),
      trackChatModeClick: () =>
        sendRef.current({
          name: EventKeys.DesignstudioChatModeClick,
          payload: { value: "create logo", vulcan_user_id: userIdRef.current },
        }),
      trackChatSend: () =>
        sendRef.current({
          name: EventKeys.DesignstudioChatSend,
          payload: optionalUser(),
        }),
      trackHitLimit: () =>
        sendRef.current({
          name: EventKeys.DesignstudioHitLimit,
          payload: { vulcan_user_id: userIdRef.current },
        }),
      trackImageGen: (params: SuiteImageGenTrackingParams) =>
        sendRef.current({
          name: EventKeys.DesignstudioImageGen,
          payload: {
            action: params.action,
            vulcan_status: params.status,
            vulcan_type: params.type,
            vulcan_user_id: userIdRef.current,
          },
        }),
      trackTemplateClick: () =>
        sendRef.current({
          name: EventKeys.DesignstudioTemplateClick,
          payload: { vulcan_user_id: userIdRef.current },
        }),
      trackView: () =>
        sendRef.current({
          name: EventKeys.DesignstudioView,
          payload: optionalUser(),
        }),
    };
    // sendRef/userIdRef are stable refs kept current above → methods never need to change identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
