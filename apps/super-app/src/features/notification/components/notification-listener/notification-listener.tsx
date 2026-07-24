import { usePermissionReminder } from "../../hooks/use-permission-reminder";
import { useNotification } from "../../provider/notification-context";

const NotificationListener = () => {
  const { hasClosedPopup, setConfirmToastState, checkShownNewUserSoftPerm } =
    useNotification();

  usePermissionReminder({
    checkShownNewUserSoftPerm,
    hasClosedPopup,
    setConfirmToastState,
  });

  return null;
};

export default NotificationListener;
