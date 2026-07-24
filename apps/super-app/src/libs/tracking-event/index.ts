// import { sendAppsFlyerEvent } from "./appsflyer";
// import { sendGTMEvent } from "./gtm";
// import type { TEventOptions, TSendEventPayload } from "./types";

/**
 * Sends a tracking event to one or more analytics platforms.
 *
 * - If `enabledAppsflyer` is true → sends to AppsFlyer.
 * - If `enabledGTM` is true → sends to Google Tag Manager.
 *
 * Platforms can be toggled independently for flexibility in A/B tests,
 * debugging, or when a platform is temporarily disabled.
 * @param data Data event payload
 * @param options Tracking event options
 */
// function sendTrackingEvent(data: TSendEventPayload, options?: TEventOptions) {
//   const { name, payload } = data;

//   const { enabledAppsflyer = true, enabledGTM = true } = options || {};

//   if (enabledAppsflyer) {
//     sendAppsFlyerEvent({ name, payload });
//   }

//   if (enabledGTM) {
//     sendGTMEvent({
//       event: name,
//       ...payload,
//     });
//   }
// }

/**
 * Collection of pre-defined, strongly-typed tracking event helpers.
 *
 * Example:
 * ```ts
 * TrackingEvent.SendEvent(EventKeys.SignInStart, payload);
 * ```
 */

// const TrackingEvent = {
//   SendEvent: (data: TSendEventPayload, options?: TEventOptions) => {
//     sendTrackingEvent(data, options);
//   },
// };

export * from "./tractking-event-context";
export * from "./tracking-event";

export * from "./types";
