import { CookieManager } from "@/app/api/auth-v2/utils/cookie-manager";
import SuiteViewAllProjectMain from "@/components/suite-main/suite-view-all-project-main";
import { getProjectsServerQueryOptions } from "@/features/suite/hooks/api/use-project.server";
import {
  dehydrate,
  getQueryClient,
  HydrationBoundary,
} from "@/libs/react-query";

export default async function ViewAllProjectPage() {
  const queryClient = getQueryClient();
  const accessToken = await CookieManager.getAccessTokenFromEncrypted();

  if (accessToken) {
    await queryClient.prefetchInfiniteQuery(
      getProjectsServerQueryOptions(
        { nextPageSize: 20, pageSize: 19 },
        accessToken
      )
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SuiteViewAllProjectMain />
    </HydrationBoundary>
  );
}
