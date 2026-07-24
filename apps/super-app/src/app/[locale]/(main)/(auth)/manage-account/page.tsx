import { getLocale } from "next-intl/server";

import { EManageAccountModalTab } from "@/features/manage-account-modal/types";
import { redirect } from "@/i18n/navigation";
import { MANAGE_ACCOUNT_URL } from "@/utils/constants/url";

export default async function ManageAccountRedirect() {
  const locale = await getLocale();
  redirect({
    href: `${MANAGE_ACCOUNT_URL}/${EManageAccountModalTab.GENERAL}`,
    locale,
  });
}
