// @cs/env/create-env — browser/server-split env factory, used ONLY by
// ./sanity for Sanity Studio's Vite-inlined vars (a separate build tool from
// the Next.js apps, still needs this server/client split). App-level
// CS_PUBLIC_* validation is unrelated — see ./schema's own assertAllPublic().
import { STUDIO_PREFIX } from "./constants";
import type { EnvEntries, InferEntries } from "./parse";
import { lazyEnv, parseEntries } from "./parse";

export const assertAllStudioPrefixed = (
  entries: EnvEntries,
  label: string
): void => {
  for (const key of Object.keys(entries)) {
    if (!key.startsWith(STUDIO_PREFIX)) {
      throw new Error(
        `[@cs/env] ${label} schema key "${key}" must start with ${STUDIO_PREFIX}.`
      );
    }
  }
};

export const assertNoneStudioPrefixed = (
  entries: EnvEntries,
  label: string
): void => {
  for (const key of Object.keys(entries)) {
    if (key.startsWith(STUDIO_PREFIX)) {
      throw new Error(
        `[@cs/env] ${label} schema key "${key}" must NOT start with ${STUDIO_PREFIX}.`
      );
    }
  }
};

interface CreateEnvOptions<
  TServer extends EnvEntries,
  TClient extends EnvEntries,
> {
  server: TServer;
  client: TClient;
  runtimeEnv: Record<keyof TServer | keyof TClient, string | undefined>;
}

export type EnvResult<
  TServer extends EnvEntries,
  TClient extends EnvEntries,
> = InferEntries<TServer> & InferEntries<TClient>;

export const createEnv = <
  TServer extends EnvEntries,
  TClient extends EnvEntries,
>(
  opts: CreateEnvOptions<TServer, TClient>
): EnvResult<TServer, TClient> => {
  assertNoneStudioPrefixed(opts.server, "server");
  assertAllStudioPrefixed(opts.client, "client");

  const serverKeys = new Set(Object.keys(opts.server));

  return lazyEnv((): EnvResult<TServer, TClient> => {
    const isBrowser = typeof window !== "undefined";

    if (isBrowser) {
      const clientResult = parseEntries(opts.client, opts.runtimeEnv, "client");
      return new Proxy(clientResult as EnvResult<TServer, TClient>, {
        get(target, prop) {
          if (typeof prop === "string" && serverKeys.has(prop)) {
            throw new TypeError(
              `[@cs/env] "${prop}" is server-only and cannot be accessed in the browser.`
            );
          }
          return Reflect.get(target, prop);
        },
      });
    }

    const client = parseEntries(opts.client, opts.runtimeEnv, "client");
    const server = parseEntries(opts.server, opts.runtimeEnv, "server");
    return Object.freeze({
      ...server,
      ...client,
    }) as EnvResult<TServer, TClient>;
  });
};
