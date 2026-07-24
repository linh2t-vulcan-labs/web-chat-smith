import { createIntlNavigation } from "@cs/i18n/navigation";

import { routing } from "./routing";

export const {
  Link,
  redirect,
  usePathname,
  useRouter,
  getPathname,
  permanentRedirect,
} = createIntlNavigation(routing);
