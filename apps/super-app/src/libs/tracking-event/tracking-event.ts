// tracking-events.ts
import { useCallback } from "react";

import { sendAppsFlyerEvent } from "./appsflyer";
import { sendGTMEvent } from "./gtm";
import { useTrackingEvent } from "./tractking-event-context";
import type { TEventOptions, TSendEventPayload } from "./types";

const dispatchTrackingEvent = (
  data: TSendEventPayload,
  options: TEventOptions
) => {
  const { name, payload } = data;
  const { enabledAppsflyer, enabledGTM } = options;

  if (enabledAppsflyer) {
    sendAppsFlyerEvent({ name, payload });
  }

  if (enabledGTM) {
    sendGTMEvent({
      event: name,
      ...payload,
    });
  }
};

export const useSendTrackingEvent = () => {
  const {
    enabledGTM: enabledGTMGlobal,
    enabledAppsflyer: enabledAppsflyerGlobal,
  } = useTrackingEvent();

  // Stable identity: this hook is called fresh in many components/hooks, and
  // an unmemoized function here would cascade into every useCallback/useEffect
  // that depends on it downstream, breaking their memoization too.
  const sendTrackingEvent = useCallback(
    (payload: TSendEventPayload, options?: TEventOptions) => {
      const enabledGTM = options?.enabledGTM ?? enabledGTMGlobal;
      const enabledAppsflyer =
        options?.enabledAppsflyer ?? enabledAppsflyerGlobal;

      const eventOptions = {
        enabledAppsflyer,
        enabledGTM,
      };
      dispatchTrackingEvent(payload, eventOptions);
    },
    [enabledGTMGlobal, enabledAppsflyerGlobal]
  );

  return {
    enabledAppsflyer: enabledAppsflyerGlobal,
    enabledGTM: enabledGTMGlobal,
    sendTrackingEvent,
  };
};
