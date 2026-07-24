export const SUBSCRIPTION_API_VERSION = {
  V1: "v1",
  V2: "v2",
};

export const DEFAULT_MANAGE_SUBSCRIPTION_MECHANISM = {
  manageType: "url", // url or inline
  mechanism: "v2",
} as const;
