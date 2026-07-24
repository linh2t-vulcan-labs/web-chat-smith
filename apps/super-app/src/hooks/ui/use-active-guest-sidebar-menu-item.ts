import { useEffect, useState } from "react";

import { SIDEBAR_MENU_ID } from "@/utils/constants/common";
import { GUEST_ASSISTANT_WRITING_URL } from "@/utils/constants/url";

interface TUseActiveGuestSidebarMenuItemParams {
  pathname: string;
  isGuestHomePage: boolean;
}

export function useActiveGuestSidebarMenuItem({
  pathname,
  isGuestHomePage,
}: TUseActiveGuestSidebarMenuItemParams) {
  const [activeMenuId, setActiveMenuId] = useState<string>(
    SIDEBAR_MENU_ID.HISTORY
  );

  useEffect(() => {
    if (isGuestHomePage) {
      // oxlint-disable-next-line react/react-compiler -- resyncs active menu based on the current route (pathname/isGuestHomePage); URL-driven resync, not a render derivation
      setActiveMenuId(SIDEBAR_MENU_ID.HISTORY);
      return;
    }

    if (pathname === GUEST_ASSISTANT_WRITING_URL) {
      setActiveMenuId(SIDEBAR_MENU_ID.GUEST_ASSISTANT_WRITING);
    }
  }, [isGuestHomePage, pathname]);

  return {
    activeMenuId,
    setActiveMenuId,
  };
}
