import { CoralogixRum } from "@coralogix/browser";

export function setUserIdToCoralogix(userId: string) {
  if (globalThis.window === undefined) {
    return;
  }

  if (!CoralogixRum.isInited) {
    return;
  }

  CoralogixRum.setUserContext({
    user_id: userId,
    user_name: "",
  });
}
