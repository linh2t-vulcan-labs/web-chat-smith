import { usePathname } from "@/i18n/navigation";
import { useQueryState } from "@/libs/nuqs";
import { QUERY_PARAM_BANANA } from "@/utils/constants/common";
import { CONVERSATION_URL } from "@/utils/constants/url";

const useHandleDetectBananaUrl = () => {
  const pathname = usePathname();
  const [modeParam] = useQueryState("mode");
  const isConversationPage = pathname === CONVERSATION_URL;
  return modeParam === QUERY_PARAM_BANANA && isConversationPage;
};

export default useHandleDetectBananaUrl;
