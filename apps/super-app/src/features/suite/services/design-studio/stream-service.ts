import { SUITE_CREATIVE_STUDIO_ENDPOINTS } from "@/features/suite/api/endpoints";
import {
  fetchSuiteCreativeStream,
  suiteHttpClient,
} from "@/features/suite/services/base";
import type { TSuiteCreativeStreamServiceAPIs } from "@/features/suite/types/design-studio";
import type { SuiteHttp } from "@/features/suite/types/http";

export const suiteCreativeStreamServiceAPIs = (
  client: SuiteHttp
): TSuiteCreativeStreamServiceAPIs => {
  void client;

  return {
    streamMessage: (input) =>
      fetchSuiteCreativeStream(
        SUITE_CREATIVE_STUDIO_ENDPOINTS.messageStream(
          input.projectId,
          input.messageId
        ),
        {
          // Forward the abort signal to fetch so abort() cancels the request at the socket level
          // (even mid-open), not only the body reader once streaming has started.
          signal: input.signal,
          ...(input.lastEventId && {
            headers: { "Last-Event-ID": input.lastEventId },
          }),
        }
      ),
  };
};

export const suiteCreativeStreamClientService =
  suiteCreativeStreamServiceAPIs(suiteHttpClient);
