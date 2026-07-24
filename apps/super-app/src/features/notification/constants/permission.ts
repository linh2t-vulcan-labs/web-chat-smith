import { NOTIFICATION_CONFIRM_TEXT_DEFAULT } from "../components/notification-confirm-toast/constants";
import { E_PERMISSION_REQUEST_TYPE } from "../enum/permission";

export const PERMISSION_MESSAGE_TYPE = {
  [E_PERMISSION_REQUEST_TYPE.NOTIFICATION_BASE_PERMISSION]: [
    NOTIFICATION_CONFIRM_TEXT_DEFAULT.TITLE,
    NOTIFICATION_CONFIRM_TEXT_DEFAULT.DESCRIPTION,
  ],
  [E_PERMISSION_REQUEST_TYPE.NOTIFICATION_LONG_RUNNING_TASK]: [
    "notification.task.title",
    "notification.task.description",
  ],
};

export const DEFAULT_NOTIFICATION_STORE = {
  recentRequestTime: "",
  shownNewUserSoftPerm: false,
};
