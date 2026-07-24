// Minimal type for the AF client function we use.
export interface TAppsFlyerClient {
  (command: "event", name: string, payload?: Record<string, unknown>): void;
  q?: unknown[];
}

declare global {
  interface Window {
    AF?: TAppsFlyerClient;
  }
}

export type TAppsFlyerEventPayload = Record<
  string,
  string | number | boolean | undefined | null | unknown
>;

export interface TAppsFlyerEvent {
  name: string;
  payload?: TAppsFlyerEventPayload;
}
