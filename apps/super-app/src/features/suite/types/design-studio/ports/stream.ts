import type { TSuiteCreativeStreamMessageInput } from "../stream";

export interface TSuiteCreativeStreamServiceAPIs {
  // signal is forwarded to the underlying fetch so an abort tears the request down at the network
  // layer (not just via the body reader's cancel), incl. while the connection is still opening.
  streamMessage: (
    input: TSuiteCreativeStreamMessageInput & { signal?: AbortSignal }
  ) => Promise<Response>;
}
